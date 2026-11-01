import asyncio

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any

# Import your scraper
from app.scrapers.exam_scraper import ExamScraper
from app.database.mongodb import get_database

router = APIRouter(
    prefix="/exams",
    tags=["exams"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[Dict[str, Any]])
# @cache(expire=3600)  # Cache for 1 hour
async def get_upcoming_exams():
    """Fetch upcoming exams from various sources."""
    try:
        scraper = ExamScraper()
        
        # Combine results from different sources
        nta_exams, upsc_exams, aws_certs = await asyncio.gather(
            asyncio.to_thread(scraper.scrape_nta_exams),
            asyncio.to_thread(scraper.scrape_upsc_exams),
            asyncio.to_thread(scraper.scrape_aws_certifications),
        )
        
        all_exams = nta_exams + upsc_exams + aws_certs
        
        # Sort by date if available
        all_exams.sort(
            key=lambda x: x.get("exam_date") or x.get("notification_date") or "", 
            reverse=True
        )
        
        return all_exams
    
    except Exception:
        raise HTTPException(status_code=502, detail="Exam sources are temporarily unavailable. Please retry shortly.")

@router.get("/source/{source}", response_model=List[Dict[str, Any]])
# @cache(expire=3600)  # Cache for 1 hour
async def get_exams_by_source(source: str):
    """Fetch exams from a specific source."""
    try:
        scraper = ExamScraper()
        
        source_fetchers = {
            "nta": scraper.scrape_nta_exams,
            "upsc": scraper.scrape_upsc_exams,
            "aws": scraper.scrape_aws_certifications,
        }
        fetcher = source_fetchers.get(source.lower())
        if not fetcher:
            raise HTTPException(status_code=404, detail=f"Source {source} not supported")
        return await asyncio.to_thread(fetcher)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=502, detail="Exam source is temporarily unavailable. Please retry shortly.")

@router.get("/store", response_model=Dict[str, Any])
async def store_exams_in_db(db=Depends(get_database)):
    """Store the latest exam data in the database."""
    try:
        scraper = ExamScraper()
        
        # Fetch from all sources
        nta_exams, upsc_exams, aws_certs = await asyncio.gather(
            asyncio.to_thread(scraper.scrape_nta_exams),
            asyncio.to_thread(scraper.scrape_upsc_exams),
            asyncio.to_thread(scraper.scrape_aws_certifications),
        )
        
        all_exams = nta_exams + upsc_exams + aws_certs
        
        # Store in database
        result = await db.exams.delete_many({})  # Clear old data
        if all_exams:
            insert_result = await db.exams.insert_many(all_exams)
            return {"status": "success", "inserted": len(insert_result.inserted_ids)}
        else:
            return {"status": "success", "inserted": 0}
    
    except Exception:
        raise HTTPException(status_code=502, detail="Unable to refresh exam data right now. Please retry shortly.")
