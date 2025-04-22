from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import Depends
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL) 
database = client.career_guidance

async def get_database():
    return database  