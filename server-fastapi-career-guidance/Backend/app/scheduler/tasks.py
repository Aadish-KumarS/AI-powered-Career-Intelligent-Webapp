from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import httpx
import asyncio
import logging
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
SERVICE_BASE_URL = os.getenv("CAREER_SERVICE_BASE_URL", "http://localhost:8001").rstrip("/")

async def update_exam_database():
    """Scheduled task to update the exam database."""
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(30.0, connect=5.0)) as client:
            response = await client.get(f"{SERVICE_BASE_URL}/api/v1/exams/store")
            if response.status_code == 200:
                result = response.json()
                logger.info(f"Updated exam database: {result}")
            else:
                logger.error(f"Failed to update exam database: {response.text}")
    except Exception:
        logger.exception("Error updating exam database")

def setup_scheduler():
    """Configure and start the scheduler."""
    scheduler = AsyncIOScheduler()
    
    # Update exam database daily at 2 AM
    scheduler.add_job(
        update_exam_database,
        CronTrigger(hour=2, minute=0),
        id="update_exam_database",
        replace_existing=True
    )
    
    # Start the scheduler
    scheduler.start()
    return scheduler
