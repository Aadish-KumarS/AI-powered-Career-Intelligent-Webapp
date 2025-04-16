from fastapi import APIRouter, HTTPException
from app.models.prompt import CareerPrompt
from app.services.recommender import generate_career_advice
import logging

router = APIRouter()

logging.basicConfig(level=logging.INFO)

@router.post("/recommend-career")
async def recommend(prompt: CareerPrompt):
    try:
        recommendation = await generate_career_advice(prompt)
        logging.info(f"Career advice generated: {recommendation}")

        return {"recommendation": recommendation}

    except HTTPException as http_error:
        logging.error(f"HTTP error: {http_error.detail}")
        raise HTTPException(status_code=http_error.status_code, detail=http_error.detail)

    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
