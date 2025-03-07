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
from app.utils.LLM import LLM
# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize API clients
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
anthropic = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
llm = LLM(logger, client, anthropic)
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
            result = await llm.query_claude_vision(request.image, request.question)
        except Exception as e:
            logger.warning(f"Claude query failed, falling back to OpenAI: {str(e)}")
            result = await llm.query_openai_vision(request.image, request.question)

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

    if os.getenv("SAVE_DATASET") != "True":
        logger.info("Skipping dataset upload")
        return {"message": "Uploading dataset skipped"}

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
