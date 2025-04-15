from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

print("Connecting to:", MONGO_DB_NAME)

client = AsyncIOMotorClient(MONGO_URI)
db = client[MONGO_DB_NAME]
