from fastapi import APIRouter, HTTPException
from app.models.prompt import CareerPrompt
from app.services.recommender import generate_career_advice
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/recommend-career")
async def recommend(prompt: CareerPrompt):
    try:
        recommendation = await generate_career_advice(prompt)
        logger.info("Career recommendation generated")

        return {"recommendation": recommendation}

    except HTTPException as http_error:
        logger.warning("Career recommendation request failed: %s", http_error.detail)
        raise HTTPException(status_code=http_error.status_code, detail=http_error.detail)

    except Exception:
        logger.exception("Unexpected career recommendation error")
        raise HTTPException(status_code=503, detail="Career recommendations are temporarily unavailable. Please retry shortly.")
