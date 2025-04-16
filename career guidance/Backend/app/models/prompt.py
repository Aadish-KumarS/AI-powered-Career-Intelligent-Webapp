from pydantic import BaseModel
from typing import List, Optional

class CareerPrompt(BaseModel):
    personality_type: Optional[str]
    interests: List[str]
    strengths: List[str]
    goals: str
    education_level: str
    experience_years: int
