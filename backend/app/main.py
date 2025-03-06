from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import logging
from dotenv import load_dotenv
from openai import OpenAI
import base64
from anthropic import Anthropic
from datasets import Dataset

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize API clients
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
anthropic = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Initialize FastAPI app
app = FastAPI(
    title="MathFluent API",
    description="Backend API for MathFluent application",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Only during development!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class ImageRequest(BaseModel):
    image: str  # base64 encoded image
    question: str  # The question being answered


class AnswerResponse(BaseModel):
    is_correct: bool


class SubmitResultsRequest(BaseModel):
    questions: list[str]
    answers: list[str]
    is_correct: list[bool]


def debug_image(image: str):
    # Save image to disk for debugging
    # Create debug directory if it doesn't exist
    os.makedirs("debug_images", exist_ok=True)

    # Extract base64 data
    if image.startswith("data:image"):
        base64_data = image.split("base64,")[1]
    else:
        base64_data = image

    # Save to file
    image_path = f"debug_images/answer_{len(os.listdir('debug_images'))}.png"
    with open(image_path, "wb") as f:
        f.write(base64.b64decode(base64_data))
    logger.info(f"Saved debug image to {image_path}")


@app.get("/")
async def read_root():
    return {"message": "Welcome to MathFluent API"}


async def query_openai_vision(image: str, question: str) -> str:
    """
    Query OpenAI's vision model to check a handwritten math answer.
    Returns "1" for correct answers and "0" for incorrect answers.
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {"url": image, "detail": "high"},
                        },
                        {
                            "type": "text",
                            "text": f"For the math question '{question}', analyze the handwritten answer in the image. If the answer is right, return 1, otherwise return 0. Return no other characters.",
                        },
                    ],
                }
            ],
            max_tokens=10,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Error in OpenAI vision query: {str(e)}")
        raise


async def query_claude_vision(image: str, question: str) -> str:
    """
    Query Claude 3.7 Sonnet to check a handwritten math answer.
    Returns "1" for correct answers and "0" for incorrect answers.
    """
    try:
        # Convert data URL to base64 if needed
        if image.startswith("data:image"):
            base64_data = image.split("base64,")[1]
        else:
            base64_data = image

        response = anthropic.messages.create(
            model="claude-3-7-sonnet-20250219",
            max_tokens=10,
            system='Instruction to Claude: Your response must be only 0 or 1, with no additional text. Below are examples to illustrate the expected output:\n\nExample 1:\n\nInput:\nPrompt: "For the math question 2 + 2, analyze the handwritten answer in the image. If the answer is right, return 1, otherwise return 0."\nImage: (Handwritten response: "4")\nExpected Output:\n1\nExample 2:\n\nInput:\nPrompt: "For the math question 5 × 3, analyze the handwritten answer in the image. If the answer is right, return 1, otherwise return 0."\nImage: (Handwritten response: "20")\nExpected Output:\n0\nExample 3:\n\nInput:\nPrompt: "For the math question √16, analyze the handwritten answer in the image. If the answer is right, return 1, otherwise return 0."\nImage: (Handwritten response: "5")\nExpected Output:\n0\nExample 4:\n\nInput:\nPrompt: "For the math question 10 ÷ 2, analyze the handwritten answer in the image. If the answer is right, return 1, otherwise return 0."\nImage: (Handwritten response: "5")\nExpected Output:\n1\nFinal Clarification:\nClaude, your response must be either 0 or 1 with no extra text. Do not explain, do not add words, do not format the response in any way—just return 0 or 1.',
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/png",
                                "data": base64_data,
                            },
                        },
                        {
                            "type": "text",
                            "text": f"For the math question '{question}', analyze the handwritten answer in the image. If the answer is right, return 1, otherwise return 0. Return no other characters.",
                        },
                    ],
                }
            ],
        )
        return response.content[0].text.strip()
    except Exception as e:
        logger.error(f"Error in Claude vision query: {str(e)}")
        raise


@app.post("/check-answer", response_model=AnswerResponse)
async def check_answer(request: ImageRequest):
    """
    Check answer using vision models.
    Uses Claude as primary model, falls back to OpenAI if Claude fails.
    """
    logger.info("Received answer check request")
    logger.info(
        f"Image data length: {len(request.image) if request.image else 0} characters"
    )

    try:
        # Try Claude first
        try:
            result = await query_claude_vision(request.image, request.question)
        except Exception as e:
            logger.warning(f"Claude query failed, falling back to OpenAI: {str(e)}")
            result = await query_openai_vision(request.image, request.question)

        logger.info(f"Model response: {result}")
        is_correct = result == "1"

        return AnswerResponse(is_correct=is_correct)

    except Exception as e:
        logger.error(f"Error checking answer: {str(e)}")
        raise HTTPException(status_code=500, detail="Error checking answer")


@app.post("/submit-results")
async def submit_results(request: SubmitResultsRequest):
    """
    Endpoint to submit final results and upload to Hugging Face dataset.
    """
    logger.info("Received results submission")
    logger.info(f"Number of questions: {len(request.questions)}")
    logger.info(f"Number of answers: {len(request.answers)}")
    logger.info(f"Correctness: {request.is_correct}")

    try:
        # Create a dataset dictionary
        dataset_dict = {
            "questions": request.questions,
            "answers": request.answers,
            "is_correct": request.is_correct,
        }
        
        # Create a Dataset object
        dataset = Dataset.from_dict(dataset_dict)
        
        # Push to Hugging Face Hub
        dataset.push_to_hub(
            "zeroknowledgeltd/mathfluent",
            token=os.getenv("HUGGINGFACE_TOKEN"),
            split="train"
        )
        
        logger.info("Successfully uploaded to Hugging Face dataset")
        return {"message": "Results submitted and uploaded successfully"}
    
    except Exception as e:
        logger.error(f"Error uploading to Hugging Face: {str(e)}")
        raise HTTPException(status_code=500, detail="Error uploading results to dataset")
