from pydantic import BaseModel
from typing import List, Optional


class Education(BaseModel):
    highestLevel: Optional[str]
    fieldOfStudy: Optional[str]
    institution: Optional[str]
    graduationYear: Optional[str]

class Skill(BaseModel):
    name: str

class Skills(BaseModel):
    technicalSkills: Optional[List[Skill]]
    softSkills: Optional[List[Skill]]

class CareerInfo(BaseModel):
    careerGoals: Optional[List[str]]
    desiredIndustries: Optional[List[str]]

class Experience(BaseModel):
    currentRole: Optional[str]
    yearsOfExperience: Optional[int]

class Preferences(BaseModel):
    personalityType: Optional[str]

class ExamRecommendationRequest(BaseModel):
    education: Education
    skills: Skills
    careerInfo: CareerInfo
    experience: Experience
    preferences: Preferences
