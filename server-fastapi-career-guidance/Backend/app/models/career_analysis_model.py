from pydantic import BaseModel, Field
from typing import List


class Location(BaseModel):
    city: str = Field("", description="City of the user")
    latitude: float = Field(0, description="Latitude of the user's location")
    longitude: float = Field(0, description="Longitude of the user's location")


class Education(BaseModel):
    highest_level: str = Field("", description="Highest education level")
    field_of_study: str = Field("", description="Field of study")
    institution: str = Field("", description="Institution name")
    graduation_year: str = Field("", description="Graduation year")


class Skill(BaseModel):
    name: str = Field(..., min_length=1, description="Name of the skill")
    level: str = Field("Intermediate", description="Proficiency level of the skill")


class Experience(BaseModel):
    current_role: str = Field("", description="Current professional role")
    years_of_experience: str = Field("0", description="Total years of experience")
    past_roles: List[str] = Field(default_factory=list, description="List of past job roles")


class CareerInfo(BaseModel):
    career_stage: str = Field("", description="Current career stage")
    career_goals: List[str] = Field(default_factory=list, description="Career goals")
    desired_industries: List[str] = Field(default_factory=list, description="Preferred industries")
    desired_roles: List[str] = Field(default_factory=list, description="Target job roles")


class Preferences(BaseModel):
    personality_type: str = Field("", description="Personality type")
    work_environment: str = Field("", description="Preferred work environment")
    work_style: List[str] = Field(default_factory=list, description="Preferred work style")


class UserData(BaseModel):
    current_skills: List[Skill] = Field(default_factory=list, description="List of user's current skills with proficiency levels")
    education: Education = Field(default_factory=Education)
    desired_roles: List[str] = Field(default_factory=list, description="Target job roles")
    location: Location = Field(default_factory=Location)
    career_interests: List[str] = Field(default_factory=list, description="Areas of career interest")
    experience: Experience = Field(default_factory=Experience)
    career_info: CareerInfo = Field(default_factory=CareerInfo)
    preferences: Preferences = Field(default_factory=Preferences)

    class Config:
        schema_extra = {
            "example": {
                "current_skills": [
                    {"name": "Python", "level": "Intermediate"},
                    {"name": "Data Analysis", "level": "Advanced"},
                    {"name": "SQL", "level": "Beginner"},
                    {"name": "DevOps", "level": "Beginner"},
                    {"name": "UI/UX Design", "level": "Intermediate"},
                    {"name": "Communication", "level": "Advanced"}
                ],
                "education": {
                    "highest_level": "Bachelor's",
                    "field_of_study": "Computer Science",
                    "institution": "XYZ University",
                    "graduation_year": "2020"
                },
                "desired_roles": ["Data Scientist", "Machine Learning Engineer"],
                "location": {
                    "city": "New York",
                    "latitude": 40.7128,
                    "longitude": -74.0060
                },
                "career_interests": ["Machine Learning", "AI", "Big Data"],
                "experience": {
                    "current_role": "Data Analyst",
                    "years_of_experience": "3",
                    "past_roles": ["Intern Data Analyst", "Junior Data Analyst"]
                },
                "career_info": {
                    "career_stage": "Early Career",
                    "career_goals": ["Become a Data Scientist", "Learn AI"],
                    "desired_industries": ["Tech", "Finance"],
                    "desired_roles": ["Data Scientist"]
                },
                "preferences": {
                    "personality_type": "INTJ",
                    "work_environment": "Hybrid",
                    "work_style": ["Collaborative", "Flexible"]
                }
            }
        }
