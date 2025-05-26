from fastapi import HTTPException,APIRouter
from typing import List

from app.models.learning_path_model import (
    RecommendationResponse,
    Recommendation,
    SkillProgress,
    SkillDocumentation,
    CreateSkillRequest,
    UpdateProgressRequest
)
from app.db.learning_path_db import SkillDatabase
from app.utils.gemini_llm import GeminiService

router = APIRouter()

# Initialize services
db = SkillDatabase()
gemini = GeminiService()

@router.get("/")
async def root():
    return {"message": "Skill Learning & Progress Tracking API"}

@router.post("/skills/", response_model=SkillProgress)
async def create_skill(request: CreateSkillRequest):
    """Create a new skill to track"""
    skill_id = db.create_skill(request.skill_name, request.target_completion_date)
    
    # Generate documentation for the skill
    try:
        documentation = gemini.generate_skill_documentation(request.skill_name)
        if documentation:
            doc_model = SkillDocumentation(**documentation)
            db.save_skill_documentation(skill_id, doc_model)
    except Exception as e:
        print(f"Error generating documentation: {e}")
        # Continue even if documentation generation fails
    
    # Get learning recommendations
    try:
        recommendations = gemini.get_learning_recommendations(request.skill_name)
        if recommendations:
            db.save_recommendations(skill_id, recommendations)
    except Exception as e:
        print(f"Error generating recommendations: {e}")
        # Continue even if recommendations generation fails
    
    return db.get_skill(skill_id)

@router.get("/skills/", response_model=List[SkillProgress])
async def list_skills():
    """List all skills being tracked"""
    return db.list_skills()

@router.get("/skills/{skill_id}", response_model=SkillProgress)
async def get_skill(skill_id: str):
    """Get details of a specific skill"""
    skill = db.get_skill(skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    return skill

@router.put("/skills/{skill_id}/progress", response_model=SkillProgress)
async def update_progress(skill_id: str, update: UpdateProgressRequest):
    """Update progress for a skill"""
    success = db.update_skill_progress(
        skill_id,
        resource_id=update.resource_id,
        progress_percentage=update.progress_percentage,
        status=update.status,
        notes=update.notes,
        completed_milestones=update.completed_milestones,
        current_proficiency=update.current_proficiency
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Skill not found")
    
    return db.get_skill(skill_id)

@router.get("/skills/{skill_id}/documentation", response_model=SkillDocumentation)
async def get_documentation(skill_id: str):
    """Get detailed documentation for a skill"""
    doc = db.get_skill_documentation(skill_id)
    
    if not doc:
        # If documentation doesn't exist, try to generate it
        skill = db.get_skill(skill_id)
        if not skill:
            raise HTTPException(status_code=404, detail="Skill not found")
            
        try:
            documentation = gemini.generate_skill_documentation(skill.skill_name)
            if documentation:
                doc_model = SkillDocumentation(**documentation)
                db.save_skill_documentation(skill_id, doc_model)
                return doc_model
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to generate documentation: {str(e)}")
    
    return doc

@router.get("/skills/{skill_id}/recommendations", response_model=RecommendationResponse)
async def get_recommendations(skill_id: str, refresh: bool = False):
    """Get learning recommendations for a skill"""
    skill = db.get_skill(skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    
    recommendations = db.get_recommendations(skill_id)
    
    # If refresh is requested or no recommendations exist, generate new ones
    if refresh or not recommendations:
        try:
            recommendations = gemini.get_learning_recommendations(skill.skill_name)
            if recommendations:
                db.save_recommendations(skill_id, recommendations)
        except Exception as e:
            if not recommendations:  # Only raise error if we have no recommendations at all
                raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")
    
    return RecommendationResponse(recommendations=[Recommendation(**rec) for rec in recommendations])

@router.delete("/skills/{skill_id}")
async def delete_skill(skill_id: str):
    """Delete a skill and all its associated data"""
    if not db.get_skill(skill_id):
        raise HTTPException(status_code=404, detail="Skill not found")
    
    success = db.delete_skill(skill_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete skill")
    
    return {"message": "Skill deleted successfully"}