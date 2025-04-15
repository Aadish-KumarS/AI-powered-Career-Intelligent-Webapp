from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import json
import httpx
import time
import logging

from app.models.roadmapModel import Roadmap
from app.crud.roadmapCRUD import save_roadmap
from app.crud.roadmapCRUD import get_all_roadmaps,delete_all_roadmaps

# Load environment variables from .env
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# ✅ CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📦 Request model
class RoadmapRequest(BaseModel):
    goal: str

class RoadmapSaveRequest(BaseModel):
    roadmap: dict

# 📄 Load API Key and model from env
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
LLM_MODEL = os.getenv("LLM_MODEL", "llama3-8b-8192")

# Logger setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 🚀 Route to generate roadmap only
@app.post("/generate-roadmap")
async def generate_roadmap(req: RoadmapRequest):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Missing GROQ_API_KEY in .env")

    prompt = f"""
    You are an expert career path architect. Create a detailed, step-by-step progressive roadmap for becoming a {req.goal}.

    DELIVER ONLY VALID JSON WITH THIS STRUCTURE:
    {{
    "title": "Professional Roadmap: {req.goal}",
    "description": "Comprehensive progression from beginner to expert {req.goal}",
    "nodes": [
        {{
        "id": "1",
        "title": "Stage Name",
        "category": "foundation|technical|specialization|mastery",
        "description": "Detailed description of what is covered in this stage",
        "difficulty": "beginner|intermediate|advanced|expert",
        "estimated_time": "X weeks/months",
        "key_skills": ["skill1", "skill2", "skill3"],
        "specific_technologies": ["tool1", "framework2", "platform3"],
        "learning_objectives": [
            "Clear, measurable goal 1",
            "Clear, measurable goal 2"
        ],
        "substeps": [
            {{
            "title": "Substep Name",
            "description": "More specific focus area under this stage",
            "objectives": ["Learn X", "Practice Y", "Understand Z"],
            "resources": [
                {{"type": "course|book|tutorial|certification", "name": "Resource Name", "url": "optional_url"}}
            ],
            "practical_tasks": ["Project or task to apply this substep"]
            }}
        ],
        "practical_tasks": ["Specific project or exercise to demonstrate competency"],
        "industry_relevance": "Why this stage matters for real-world job readiness",
        "prerequisites": []
        }}
    ],
    "edges": [
        {{"source": "1", "target": "2", "type": "required"}},
        {{"source": "1", "target": "3", "type": "required"}},
        {{"source": "3", "target": "5", "type": "required"}}
    ],
    "career_paths": [
        {{
        "path_name": "Specialization Path Name",
        "description": "Brief description of this career direction",
        "node_sequence": ["1", "2", "5", "8"],
        "job_titles": ["Job titles this path prepares for"]
        }}
    ],
    "industry_insights": {{
        "trending_skills": ["In-demand skills for this career"],
        "future_outlook": "Career growth forecast",
        "salary_range": "Typical salary range (e.g., $60k-$120k USD)"
    }}
    }}

    REQUIREMENTS:
    1. Create 15–20 well-structured learning stages (nodes)
    2. Break complex subjects (e.g., Full-Stack Development) into detailed subtopics (e.g., separate Backend and Frontend)
    3. For each stage, provide clear **learning objectives**
    4. Include a **substeps array** within stages for complex or multi-topic phases
    5. Ensure a mix of sequential and branching learning paths
    6. Recommend specific, credible learning resources for each step and substep
    7. Include portfolio-ready project suggestions at key stages
    8. Emphasize both technical and soft skills
    9. Provide industry relevance and practical applications
    10. Return ONLY complete, valid JSON — no extra text, formatting, or explanation
    """



    try:
        start_time = time.time()

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": LLM_MODEL,
            "messages": [
                {"role": "system", "content": "You are an expert roadmap generator."},
                {"role": "user", "content": prompt}
            ]
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=30.0
            )

        elapsed = time.time() - start_time
        logger.info(f"⚡ LLM response took {elapsed:.2f} seconds")

        response.raise_for_status()
        result = response.json()
        content = result["choices"][0]["message"]["content"]

        start_idx = content.find("{")
        end_idx = content.rfind("}") + 1

        if start_idx != -1 and end_idx > start_idx:
            try:
                roadmap_json = json.loads(content[start_idx:end_idx])
                return roadmap_json
            except json.JSONDecodeError:
                logger.error(f"Failed to parse JSON from LLM response. Raw content: {content}")
                raise HTTPException(status_code=500, detail="Failed to parse JSON from LLM response.")
        else:
            logger.error(f"Could not extract valid JSON from LLM response. Raw content: {content}")
            raise HTTPException(status_code=500, detail="Could not extract valid JSON from LLM response.")

    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"HTTP error: {str(e)}")

    except httpx.RequestError as e:
        logger.error(f"Request error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Request error: {str(e)}")

    except Exception as e:
        logger.error(f"Unexpected error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

# 💾 Separate route to save roadmap
@app.post("/save-roadmap")
async def save_roadmap_to_db(req: RoadmapSaveRequest):
    try:
        roadmap_model = Roadmap(**req.roadmap)
        roadmap_id = await save_roadmap(roadmap_model)
        return {"message": "Roadmap saved successfully", "id": roadmap_id}
    except Exception as e:
        logger.error(f"Failed to save roadmap: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save roadmap")


@app.get("/roadmaps")
async def get_roadmaps():
    try:
        # Get all roadmaps from the database
        roadmaps = await get_all_roadmaps()
        if roadmaps:
            return {"roadmaps": roadmaps}
        else:
            raise HTTPException(status_code=404, detail="No roadmaps found")
    except Exception as e:
        logger.error(f"Error fetching roadmaps: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch roadmaps")
    

@app.delete("/roadmaps/delete-all", tags=["Roadmaps"])
async def delete_all():
    return await delete_all_roadmaps()