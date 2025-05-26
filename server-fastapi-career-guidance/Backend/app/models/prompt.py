from pydantic import BaseModel
from typing import List, Optional

class CareerPrompt(BaseModel):
    personality_type: Optional[str]
    interests: List[str]
    goals: str
    education_level: str
    experience_years: int
    current_role: Optional[str]
    work_type: Optional[List[str]]
    desired_industries: Optional[List[str]]
    career_goals: Optional[List[str]]
    career_stage: Optional[str]
    desired_roles: Optional[List[str]]
