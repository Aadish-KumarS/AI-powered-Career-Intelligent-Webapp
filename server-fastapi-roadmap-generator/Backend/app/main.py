from fastapi import FastAPI, HTTPException, status, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import json
import httpx
import time
import logging
import re

from app.models.roadmapModel import Roadmap
from app.crud.roadmapCRUD import save_roadmap
from app.crud.roadmapCRUD import get_all_roadmaps,delete_all_roadmaps
from app.core.auth import get_current_user_id

# Load environment variables from .env
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Allow local Vite development ports by default; production origins are
# configured with CORS_ORIGINS as a comma-separated environment variable.
allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:5174",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
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


def parse_roadmap_json(content: object) -> dict:
    """Extract one complete roadmap object without mutating model output."""
    if not isinstance(content, str) or not content.strip():
        raise ValueError("The model returned an empty response")
    text = content.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        text = "\n".join(lines[1:-1] if lines and lines[-1].strip() == "```" else lines[1:]).strip()

    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        if start < 0:
            raise ValueError("No JSON object found in model response")
        depth, in_string, escaped = 0, False, False
        parsed = None
        for index in range(start, len(text)):
            char = text[index]
            if in_string:
                if escaped:
                    escaped = False
                elif char == "\\":
                    escaped = True
                elif char == '"':
                    in_string = False
            elif char == '"':
                in_string = True
            elif char == "{":
                depth += 1
            elif char == "}":
                depth -= 1
                if depth == 0:
                    parsed = json.loads(text[start:index + 1])
                    break
        if parsed is None:
            raise ValueError("The model response contains incomplete JSON")

    if not isinstance(parsed, dict):
        raise ValueError("The model response must be a JSON object")
    # Preserve the frontend contract while rejecting unusable output early.
    Roadmap(**parsed)
    node_ids = [str(node.get("id")) for node in parsed.get("nodes", [])]
    if len(node_ids) != len(set(node_ids)) or not node_ids:
        raise ValueError("Roadmap nodes must have unique IDs")
    valid_ids = set(node_ids)
    if any(edge.get("source") not in valid_ids or edge.get("target") not in valid_ids for edge in parsed.get("edges", [])):
        raise ValueError("Roadmap edges reference unknown nodes")
    return parsed

# 🚀 Route to generate roadmap only
@app.post("/generate-roadmap")
async def generate_roadmap(req: RoadmapRequest, _: str = Depends(get_current_user_id)):
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
    10. Important Note: Return ONLY complete, valid JSON — no extra text, formatting, or explanation
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
            ],
            "temperature": 0.3,
            "max_completion_tokens": 20000,
            "response_format": {"type": "json_object"}
        }

        async with httpx.AsyncClient(timeout=httpx.Timeout(90.0, connect=10.0)) as client:
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

        return parse_roadmap_json(content)

    except httpx.HTTPStatusError as e:
        logger.error("Roadmap provider returned %s", e.response.status_code)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="The roadmap provider could not complete the request")

    except httpx.RequestError as e:
        logger.error("Roadmap provider request failed: %s", e)
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="The roadmap provider is temporarily unavailable")

    except Exception as e:
        logger.exception("Roadmap generation failed")
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="The generated roadmap was incomplete. Please try again.")

# 💾 Separate route to save roadmap
@app.post("/save-roadmap")
async def save_roadmap_to_db(req: RoadmapSaveRequest, user_id: str = Depends(get_current_user_id)):
    try:
        roadmap_model = Roadmap(**req.roadmap, user_id=user_id)
        roadmap_id = await save_roadmap(roadmap_model)
        return {"message": "Roadmap saved successfully", "id": roadmap_id}
    except Exception as e:
        logger.error(f"Failed to save roadmap: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save roadmap")


@app.get("/roadmaps")
async def get_roadmaps(user_id: str = Depends(get_current_user_id)):
    try:
        # Get all roadmaps from the database
        roadmaps = await get_all_roadmaps(user_id)
        if roadmaps:
            return {"roadmaps": roadmaps}
        else:
            raise HTTPException(status_code=404, detail="No roadmaps found")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        logger.error(f"Error fetching roadmaps: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch roadmaps")
    

@app.delete("/roadmaps/delete-all", tags=["Roadmaps"])
async def delete_all(user_id: str = Depends(get_current_user_id)):
    return await delete_all_roadmaps(user_id)
