from app.db.mongo import db
from app.models.roadmapModel import Roadmap
from bson.objectid import ObjectId, InvalidId
from fastapi import HTTPException
import logging

collection = db["roadmaps"]
print(collection)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def save_roadmap(roadmap: Roadmap):
    try:
        # Insert the roadmap into the collection
        result = await collection.insert_one(roadmap.dict())
        logger.info(f"Roadmap saved with ID: {result.inserted_id}")
        # Return the inserted ID as a string
        return str(result.inserted_id)
    except Exception as e:
        logger.error(f"Error saving roadmap: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save roadmap")

async def get_roadmap_by_id(roadmap_id: str):
    try:
        # Check if the provided ID is a valid ObjectId
        if not ObjectId.is_valid(roadmap_id):
            raise HTTPException(status_code=400, detail="Invalid roadmap ID format")
        
        # Query the database for the roadmap with the given ID
        data = await collection.find_one({"_id": ObjectId(roadmap_id)})
        
        if data:
            data["id"] = str(data["_id"])  # Convert ObjectId to string
            del data["_id"]  # Remove the _id field
            return data
        return None
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")
    except Exception as e:
        logger.error(f"Error retrieving roadmap by ID: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve roadmap")

async def get_all_roadmaps():
    try:
        # Retrieve all roadmaps from the collection
        cursor = collection.find({})
        roadmaps = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])  # Convert ObjectId to string
            del doc["_id"]  # Remove the _id field
            roadmaps.append(doc)
        return roadmaps
    except Exception as e:
        logger.error(f"Error retrieving all roadmaps: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve roadmaps")


async def delete_all_roadmaps():
    try:
        result = await collection.delete_many({})
        logger.info(f"Deleted {result.deleted_count} roadmaps.")
        return {"message": f"Deleted {result.deleted_count} roadmaps."}
    except Exception as e:
        logger.error(f"Error deleting roadmaps: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete roadmaps")
