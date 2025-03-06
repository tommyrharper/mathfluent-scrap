from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import logging
from dotenv import load_dotenv

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
origins = [
    "http://localhost:3000",     # Dev frontend
    "http://localhost",          # Prod frontend
    "http://127.0.0.1:3000",     # Alternative dev frontend
    "http://127.0.0.1",          # Alternative prod frontend
    "http://frontend:3000",      # Docker container name
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ImageRequest(BaseModel):
    image: str  # base64 encoded image

class AnswerResponse(BaseModel):
    is_correct: bool

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
    return AnswerResponse(is_correct=True) 