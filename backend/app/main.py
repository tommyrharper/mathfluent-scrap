from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import logging
from dotenv import load_dotenv
import random
from openai import OpenAI

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Initialize FastAPI app
app = FastAPI(
    title="MathFluent API",
    description="Backend API for MathFluent application",
    version="0.1.0"
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

@app.get("/")
async def read_root():
    return {"message": "Welcome to MathFluent API"}

@app.post("/check-answer", response_model=AnswerResponse)
async def check_answer(request: ImageRequest):
    """
    Check answer using OpenAI's vision model.
    """
    logger.info("Received answer check request")
    logger.info(f"Image data length: {len(request.image) if request.image else 0} characters")
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"For the math question '{request.question}', analyze the handwritten answer in the image. If the answer is right, return 1, otherwise return 0. Return no other characters."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": request.image,
                                "detail": "low"
                            }
                        }
                    ]
                }
            ],
            max_tokens=10
        )
        
        result = response.choices[0].message.content.strip()
        logger.info(f"OpenAI response: {result}")
        is_correct = result == "1"
        
        logger.info(f"OpenAI response: {result}")
        return AnswerResponse(is_correct=is_correct)
        
    except Exception as e:
        logger.error(f"Error checking answer with OpenAI: {str(e)}")
        raise HTTPException(status_code=500, detail="Error checking answer")

@app.post("/submit-results")
async def submit_results(request: SubmitResultsRequest):
    """
    Endpoint to submit final results. Currently logs the submission.
    In the future, this would upload to Hugging Face.
    """
    logger.info("Received results submission")
    logger.info(f"Number of questions: {len(request.questions)}")
    logger.info(f"Number of answers: {len(request.answers)}")
    logger.info(f"Correctness: {request.is_correct}")
    
    # Mock Hugging Face upload simulation
    logger.info("Simulating Hugging Face upload...")
    
    return {"message": "Results submitted successfully"} 