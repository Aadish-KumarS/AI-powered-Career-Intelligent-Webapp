from fastapi import APIRouter, HTTPException
from app.services.exam_llm import fetch_exam_recommendations
from app.models.exam_model import ExamRecommendationRequest
import logging
import json

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/recommend-exams")
async def recommend_exams(data: ExamRecommendationRequest):
    prompt = f"""
    Act as a career counselor. Based on the following student's profile, recommend the most relevant national or international exams or certifications.
    
    Profile:
    - Education: {data.education.highestLevel or "N/A"}, {data.education.fieldOfStudy or "N/A"}, {data.education.institution or "N/A"}, {data.education.graduationYear or "N/A"}
    - Technical Skills: {', '.join([skill.name for skill in data.skills.technicalSkills]) if data.skills and data.skills.technicalSkills else "N/A"}
    - Soft Skills: {', '.join([skill.name for skill in data.skills.softSkills]) if data.skills and data.skills.softSkills else "N/A"}
    - Career Goals: {', '.join(data.careerInfo.careerGoals) if data.careerInfo and data.careerInfo.careerGoals else "N/A"}
    - Preferred Industries: {', '.join(data.careerInfo.desiredIndustries) if data.careerInfo and data.careerInfo.desiredIndustries else "N/A"}
    - Experience: {data.experience.currentRole or "N/A"}, {data.experience.yearsOfExperience or "N/A"} years
    - Personality: {data.preferences.personalityType or "N/A"}
    
    Return a list of at least 4 to 6 exam/certification recommendations as a valid JSON array of objects, with each object having the following format:
    {{"exam_name": "Name of the exam", "why_recommended": "Explanation of why this exam is recommended", "ideal_timeline": "When to take this exam"}}
    
    Do not include any other text, just return the JSON array.
    """
    
    try:
        # Call the API
        result = await fetch_exam_recommendations(prompt)
        
        # Log the result for debugging
        logger.info(f"Processed result: {result}")
        
        # Check if the result is a string (error message)
        if isinstance(result, str):
            if result.startswith("Error:"):
                return {"error": result}
            else:
                # If it's a string but not an error message, try to parse it as JSON
                try:
                    recommendations = json.loads(result)
                    return {"recommendations": recommendations}
                except json.JSONDecodeError:
                    # Handle the case where the API didn't return valid JSON
                    return {"error": "Failed to parse API response as JSON", "raw_response": result}
        elif isinstance(result, list):
            # If the result is already a list of recommendations
            return {"recommendations": result}
        else:
            # Unexpected response format
            return {"error": "Unexpected API response format", "raw_response": str(result)}
        
    except Exception as e:
        logger.exception("Error in recommend_exams endpoint")
        return {"error": str(e)}
# make the component like this 1) the is alredry few details in backend in 1st section use the backend data to give suggestion 2) in section 2 make a form that collects data for adding custom data and with that it should render it 3) make a save button for each recommendation , it should save in backend (comment it out for now) and localstorage , when onload the component should check if there is any saved recommondation if any it should render it.