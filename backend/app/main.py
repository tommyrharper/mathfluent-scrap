from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import logging
from dotenv import load_dotenv
import random

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    Mock endpoint that always returns true for correctness.
    In a real application, this would analyze the image.
    """
    logger.info("Received answer check request")
    logger.info(f"Image data length: {len(request.image) if request.image else 0} characters")
    
    # Always return true for the mock implementation
    return AnswerResponse(is_correct=random.choice([True, False]))

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