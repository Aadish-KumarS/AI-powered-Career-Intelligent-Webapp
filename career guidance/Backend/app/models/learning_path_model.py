from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum

class SkillRequest(BaseModel):
    skill: str

class Recommendation(BaseModel):
    title: str
    platform: str
    type: str  # Course, Tutorial, Book, etc.
    difficulty: str  # Beginner, Intermediate, Advanced, All Levels
    estimated_time_hours: float
    cost: str  # More detailed now, e.g. "$19.99", "Free", "Monthly subscription $29.99"
    certification: bool
    link: str  # Direct URL or "search on Google"
    prerequisites: List[str]
    learning_outcomes: List[str]
    reason_recommended: str
    best_for: str

class RecommendationResponse(BaseModel):
    recommendations: List[Recommendation]

class ProgressStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class ResourceProgress(BaseModel):
    resource_id: str
    title: str
    # Add more fields to store additional resource details
    platform: Optional[str] = None
    type: Optional[str] = None
    difficulty: Optional[str] = None
    estimated_time_hours: Optional[float] = None
    cost: Optional[str] = None
    certification: Optional[bool] = None
    link: Optional[str] = None
    progress_percentage: float = 0.0
    status: ProgressStatus = ProgressStatus.NOT_STARTED
    notes: str = ""
    last_updated: datetime = Field(default_factory=datetime.now)

class KeyConcept(BaseModel):
    concept_name: str
    description: str
    importance: str  # High, Medium, Low

class LearningStage(BaseModel):
    stage: str
    description: str
    milestones: List[str]

class SkillDocumentation(BaseModel):
    skill_name: str
    description: str
    categories: List[str]
    difficulty_level: str
    estimated_mastery_time: Dict[str, int]
    key_concepts: List[KeyConcept]
    common_applications: List[str]
    related_skills: List[str]
    learning_path: List[LearningStage]
    assessment_methods: List[str]

class SkillProgress(BaseModel):
    skill_id: str
    skill_name: str
    current_proficiency: str = "Beginner"  # Beginner, Intermediate, Advanced
    overall_progress: float = 0.0
    start_date: datetime = Field(default_factory=datetime.now)
    target_completion_date: Optional[datetime] = None
    last_updated: datetime = Field(default_factory=datetime.now)
    resources_progress: List[ResourceProgress] = []
    notes: str = ""
    completed_milestones: List[str] = []
    
class CreateSkillRequest(BaseModel):
    skill_name: str
    target_completion_date: Optional[datetime] = None

class UpdateProgressRequest(BaseModel):
    resource_id: Optional[str] = None
    progress_percentage: Optional[float] = None
    status: Optional[ProgressStatus] = None
    notes: Optional[str] = None
    completed_milestones: Optional[List[str]] = None
    current_proficiency: Optional[str] = None