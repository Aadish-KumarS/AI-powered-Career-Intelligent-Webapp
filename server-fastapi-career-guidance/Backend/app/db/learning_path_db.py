import os
from datetime import datetime
import uuid
from typing import List, Dict, Any, Optional
import json
from app.models.learning_path_model import SkillProgress, ResourceProgress, SkillDocumentation

class SkillDatabase:
    def __init__(self, db_path: str = "skills_db"):
        self.db_path = db_path
        self.skills_dir = os.path.join(db_path, "skills")
        self.docs_dir = os.path.join(db_path, "documentation")
        self.recommendations_dir = os.path.join(db_path, "recommendations")
        
        # Create directories if they don't exist
        for directory in [self.db_path, self.skills_dir, self.docs_dir, self.recommendations_dir]:
            if not os.path.exists(directory):
                os.makedirs(directory)
    
    def create_skill(self, skill_name: str, target_date: Optional[datetime] = None) -> str:
        """Create a new skill entry in the database"""
        skill_id = str(uuid.uuid4())
        
        skill_progress = SkillProgress(
            skill_id=skill_id,
            skill_name=skill_name,
            target_completion_date=target_date
        )
        
        # Save to file
        file_path = os.path.join(self.skills_dir, f"{skill_id}.json")
        with open(file_path, 'w') as f:
            f.write(skill_progress.model_dump_json())
        
        return skill_id
    
    def get_skill(self, skill_id: str) -> Optional[SkillProgress]:
        """Get a skill progress by ID"""
        file_path = os.path.join(self.skills_dir, f"{skill_id}.json")
        
        if not os.path.exists(file_path):
            return None
        
        with open(file_path, 'r') as f:
            data = json.load(f)
            return SkillProgress(**data)
    
    def list_skills(self) -> List[SkillProgress]:
        """List all skills in the database"""
        skills = []
        
        for filename in os.listdir(self.skills_dir):
            if filename.endswith('.json'):
                file_path = os.path.join(self.skills_dir, filename)
                with open(file_path, 'r') as f:
                    data = json.load(f)
                    skills.append(SkillProgress(**data))
        
        return skills
    
    def update_skill_progress(self, skill_id: str, 
                             resource_id: Optional[str] = None,
                             progress_percentage: Optional[float] = None,
                             status: Optional[str] = None,
                             notes: Optional[str] = None,
                             completed_milestones: Optional[List[str]] = None,
                             current_proficiency: Optional[str] = None) -> bool:
        """Update progress for a skill"""
        skill = self.get_skill(skill_id)
        if not skill:
            return False
        
        # Update resource progress if provided
        if resource_id and (progress_percentage is not None or status is not None):
            resource_found = False
            for resource in skill.resources_progress:
                if resource.resource_id == resource_id:
                    resource_found = True
                    if progress_percentage is not None:
                        resource.progress_percentage = progress_percentage
                    if status is not None:
                        resource.status = status
                    resource.last_updated = datetime.now()
                    break
            
            if not resource_found and progress_percentage is not None:
                # Create new resource progress if it doesn't exist
                new_resource = ResourceProgress(
                    resource_id=resource_id,
                    title=f"Resource {resource_id}",  # Default title
                    progress_percentage=progress_percentage,
                    status=status or "in_progress",
                    last_updated=datetime.now()
                )
                skill.resources_progress.append(new_resource)
        
        # Update skill-level attributes
        if notes is not None:
            skill.notes = notes
        
        if completed_milestones is not None:
            for milestone in completed_milestones:
                if milestone not in skill.completed_milestones:
                    skill.completed_milestones.append(milestone)
        
        if current_proficiency is not None:
            skill.current_proficiency = current_proficiency
        
        # Calculate overall progress based on resources
        if skill.resources_progress:
            total_progress = sum(r.progress_percentage for r in skill.resources_progress)
            skill.overall_progress = total_progress / len(skill.resources_progress)
        
        # Update last_updated timestamp
        skill.last_updated = datetime.now()
        
        # Save updated skill
        file_path = os.path.join(self.skills_dir, f"{skill_id}.json")
        with open(file_path, 'w') as f:
            f.write(skill.model_dump_json())
        
        return True
    
    def save_skill_documentation(self, skill_id: str, documentation: SkillDocumentation) -> bool:
        """Save documentation for a skill"""
        file_path = os.path.join(self.docs_dir, f"{skill_id}.json")
        
        with open(file_path, 'w') as f:
            f.write(documentation.model_dump_json())
        
        return True
    
    def get_skill_documentation(self, skill_id: str) -> Optional[SkillDocumentation]:
        """Get documentation for a skill"""
        file_path = os.path.join(self.docs_dir, f"{skill_id}.json")
        
        if not os.path.exists(file_path):
            return None
        
        with open(file_path, 'r') as f:
            data = json.load(f)
            return SkillDocumentation(**data)
    
    def save_recommendations(self, skill_id: str, recommendations: List[Dict[str, Any]]) -> bool:
        """Save learning recommendations for a skill"""
        file_path = os.path.join(self.recommendations_dir, f"{skill_id}.json")
        
        with open(file_path, 'w') as f:
            json.dump({"recommendations": recommendations}, f, indent=2)
        
        # Also update the skill's resources_progress with these recommendations
        skill = self.get_skill(skill_id)
        if skill:
            # Clear existing resources if any (to avoid duplicates)
            skill.resources_progress = []
            
            # Add each recommendation as a resource with all available details
            for rec in recommendations:
                resource_id = str(uuid.uuid4())
                new_resource = ResourceProgress(
                    resource_id=resource_id,
                    title=rec["title"],
                    platform=rec.get("platform"),
                    type=rec.get("type"),
                    difficulty=rec.get("difficulty"),
                    estimated_time_hours=rec.get("estimated_time_hours"),
                    cost=rec.get("cost"),
                    certification=rec.get("certification"),
                    link=rec.get("link"),
                    progress_percentage=0.0,
                    status="not_started",
                    last_updated=datetime.now()
                )
                skill.resources_progress.append(new_resource)
            
            # Save updated skill
            file_path = os.path.join(self.skills_dir, f"{skill_id}.json")
            with open(file_path, 'w') as f:
                f.write(skill.model_dump_json())
        
        return True

    def get_recommendations(self, skill_id: str) -> List[Dict[str, Any]]:
        """Get learning recommendations for a skill"""
        file_path = os.path.join(self.recommendations_dir, f"{skill_id}.json")
        
        if not os.path.exists(file_path):
            return []
        
        with open(file_path, 'r') as f:
            data = json.load(f)
            return data.get("recommendations", [])
    
    def delete_skill(self, skill_id: str) -> bool:
        """Delete a skill and all associated data"""
        skill_file = os.path.join(self.skills_dir, f"{skill_id}.json")
        doc_file = os.path.join(self.docs_dir, f"{skill_id}.json")
        rec_file = os.path.join(self.recommendations_dir, f"{skill_id}.json")
        
        success = True
        
        # Delete files if they exist
        for file_path in [skill_file, doc_file, rec_file]:
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception:
                    success = False
        
        return success