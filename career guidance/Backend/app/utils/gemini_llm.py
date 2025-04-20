import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
from typing import Dict, Any, List

load_dotenv()

class GeminiService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-2.0-flash")
    
    def get_learning_recommendations(self, skill: str) -> List[Dict[str, Any]]:
        """Get learning recommendations for a specific skill using Gemini API"""
        prompt = f"""
        As an expert educator and learning consultant specializing in '{skill}', provide comprehensive learning recommendations.
        
        Generate 5 diverse, high-quality learning resources for mastering '{skill}' that:
        - Cover different learning modalities (video courses, interactive platforms, books, projects, documentation)
        - Represent various difficulty levels (beginner to advanced)
        - Include both free and paid options
        - Are current and highly regarded in the field
        - Cover different aspects of '{skill}' (theory, practice, applications)
        
        Return the results as a JSON object that strictly follows this schema:
        {{
          "recommendations": [
            {{
              "title": "string", // Specific, full title of the resource with creator/author when applicable
              "platform": "string", // Platform hosting the resource (e.g., Coursera, Udemy, GitHub, O'Reilly)
              "type": "string", // Format (Course, Tutorial, Book, Documentation, Project, etc.)
              "difficulty": "string", // Must be one of: "Beginner", "Intermediate", "Advanced", or "All Levels"
              "estimated_time_hours": number, // Realistic completion time in hours (numeric value only)
              "cost": "string", // Specific cost category (Free, $19.99, Monthly subscription $29.99, etc.)
              "certification": boolean, // Whether it offers a recognized certificate (true/false)
              "link": "string", // Direct URL if known, otherwise "search on Google"
              "prerequisites": ["string"], // 1-3 specific prerequisite skills or knowledge
              "learning_outcomes": ["string"], // 3-5 specific skills that will be gained, with measurable outcomes
              "reason_recommended": "string", // Detailed explanation (2-3 sentences) of why this resource is valuable for learning {skill}
              "best_for": "string" // Specific learner profile (e.g., "Visual learners who prefer structured content", "Hands-on practitioners seeking real-world applications")
            }}
          ]
        }}
        
        Important requirements:
        - Provide exactly 5 resources that vary substantially in type, difficulty, and approach
        - Ensure all fields conform to the specified data types
        - Include resources from different platforms and learning formats
        - Make sure 'estimated_time_hours' is a realistic numeric value (not a string)
        - For 'certification', use only true or false (lowercase, without quotes)
        - Be specific and accurate about costs and time commitments
        - Format the response as valid JSON that can be parsed by a Python application
        - Do not include any explanation text outside the JSON structure
        """
        
        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            
            # Try to extract JSON properly
            try:
                # First try to parse the entire text as JSON
                data = json.loads(text)
                if "recommendations" in data:
                    return data["recommendations"]
            except json.JSONDecodeError:
                # If that fails, try to extract the JSON part
                json_start = text.find("{")
                json_end = text.rfind("}") + 1
                if json_start >= 0 and json_end > json_start:
                    json_text = text[json_start:json_end]
                    data = json.loads(json_text)
                    if "recommendations" in data:
                        return data["recommendations"]
                
                # If still no success, look for the array directly
                json_start = text.find("[")
                json_end = text.rfind("]") + 1
                if json_start >= 0 and json_end > json_start:
                    json_text = text[json_start:json_end]
                    return json.loads(json_text)
                
            # If we got here, something went wrong with parsing
            raise ValueError("Could not parse LLM response as JSON")
            
        except Exception as e:
            print(f"Gemini API Error: {e}")
            return []
    
    def generate_skill_documentation(self, skill: str) -> Dict[str, Any]:
        """Generate detailed documentation about a skill"""
        prompt = f"""
        As a leading expert and curriculum designer specializing in '{skill}', create a comprehensive, structured learning guide.
        
        Generate detailed documentation for '{skill}' that would serve as a complete reference for someone tracking their learning journey.
        
        Return the results as a JSON object that strictly follows this schema:
        {{
          "skill_name": "{skill}",
          "description": "string", // Comprehensive, multi-paragraph description explaining what this skill is, its importance, and real-world applications
          "categories": ["string"], // 2-4 specific categories this skill belongs to (e.g., "Backend Web Development", "Data Science", "UX Research")
          "difficulty_level": "string", // Overall difficulty assessment with explanation (e.g., "Intermediate - requires foundational programming knowledge and problem-solving skills")
          "estimated_mastery_time": {{
            "beginner_to_intermediate_weeks": number, // Realistic timeframe for progression in weeks
            "intermediate_to_advanced_weeks": number // Realistic timeframe for progression in weeks
          }},
          "key_concepts": [
            {{
              "concept_name": "string", // Specific concept name
              "description": "string", // Detailed explanation of the concept
              "importance": "string" // High, Medium, Low with reasoning
            }}
          ],
          "common_applications": ["string"], // 5-7 specific real-world applications or use cases
          "related_skills": ["string"], // 3-5 complementary skills with brief explanation of relationship
          "learning_path": [
            {{
              "stage": "string", // Specific learning stage name (e.g., "Fundamentals", "Core Techniques", "Advanced Applications")
              "description": "string", // Detailed description of what this stage covers
              "milestones": ["string"] // 3-5 specific, measurable achievements that indicate completion of this stage
            }}
          ],
          "assessment_methods": ["string"] // 3-5 specific ways to evaluate proficiency at different stages
        }}
        
        Requirements:
        - Include at least 5-7 key concepts, each with detailed descriptions
        - Create a learning path with at least 3 distinct stages
        - Each stage should have 3-5 specific, measurable milestones
        - Provide realistic time estimates based on learning full-time (40 hours/week)
        - Include both theoretical concepts and practical applications
        - Format the response as valid JSON that can be parsed by a Python application
        - Be comprehensive yet specific in all descriptions
        - Do not include any explanation text outside the JSON structure
        """
        
        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            
            # Parse JSON response
            try:
                return json.loads(text)
            except json.JSONDecodeError:
                # Try to extract JSON from text
                json_start = text.find("{")
                json_end = text.rfind("}") + 1
                if json_start >= 0 and json_end > json_start:
                    json_text = text[json_start:json_end]
                    return json.loads(json_text)
                raise ValueError("Could not parse LLM response as JSON")
                
        except Exception as e:
            print(f"Gemini API Error: {e}")
            return {
                "skill_name": skill,
                "description": "Error generating documentation",
                "categories": [],
                "difficulty_level": "Unknown",
                "estimated_mastery_time": {
                    "beginner_to_intermediate_weeks": 0,
                    "intermediate_to_advanced_weeks": 0
                },
                "key_concepts": [],
                "common_applications": [],
                "related_skills": [],
                "learning_path": [],
                "assessment_methods": []
            }