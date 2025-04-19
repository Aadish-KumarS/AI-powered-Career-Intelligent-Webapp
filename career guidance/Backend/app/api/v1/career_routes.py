from fastapi import APIRouter, HTTPException, Request, Depends, status
from pydantic import BaseModel, Field
from typing import Dict, Any
from app.utils.llm_client import get_llm_response
from app.models.career_analysis_model import UserData
from datetime import datetime
import logging



logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define data models for request validation


class CareerResponse(BaseModel):
    result: Dict[str, Any]
    processed_at: datetime = Field(default_factory=datetime.now)
    request_id: str

# Rate limiting dependency
async def check_rate_limit(request: Request):
    # Implementation of rate limiting logic would go here
    return True

career_routes = APIRouter(prefix="/career", tags=["Career Planning"])

@career_routes.post("/analyze-skill-gap", 
    response_model=CareerResponse,
    summary="Analyze skill gaps for desired career roles",
    response_description="Skill gap analysis with learning recommendations")
async def analyze_skill_gap(
    user_data: UserData,
    request: Request,
    _: bool = Depends(check_rate_limit)
):
    request_id = request.headers.get("X-Request-ID", f"req-{datetime.now().timestamp()}")
    logger.info(f"Processing skill gap analysis, request_id: {request_id}")
    
    prompt = f"""
    Based on this user's data, perform a comprehensive skill gap analysis for career advancement.

    USER PROFILE:
    - Current Skills: {user_data.current_skills}
    - Experience: {user_data.experience.current_role} with {user_data.experience.years_of_experience} years of professional experience
    - Past Roles: {user_data.experience.past_roles}
    - Education: {user_data.education.highest_level} in {user_data.education.field_of_study} from {user_data.education.institution} ({user_data.education.graduation_year})
    - Target Roles: {user_data.desired_roles}
    - Career Interests: {user_data.career_interests}
    - Career Stage: {user_data.career_info.career_stage}
    - Career Goals: {user_data.career_info.career_goals}
    - Location: {user_data.location.city}
    - Work Preferences: {user_data.preferences.work_environment} environment, {user_data.preferences.work_style} work style

    Return a detailed JSON response with these keys:
    1. "skill_assessment": {{
        "current_strengths": ["Skills the user already has that align with desired roles"],
        "current_skill_levels": ["Assessment of existing skills with development recommendations"],
        "transferable_skills": ["Skills from current role that can be leveraged"],
        "skill_gaps": ["Critical skills missing for each target role with priority levels"]
    }}
    2. "missing_skills": [
        {{
            "role": "Target Role Name",
            "essential_technical_skills": ["Core technical skills needed with proficiency levels"],
            "essential_soft_skills": ["Required soft skills with importance rating"],
            "recommended_tools": ["Specific technologies, frameworks, or platforms"],
            "nice_to_have": ["Non-essential but beneficial skills"]
        }}
    ]
    3. "learning_path": {{
        "skill_name": {{
            "beginner_resources": ["Entry-level learning resources"],
            "intermediate_resources": ["More advanced learning options"],
            "advanced_resources": ["Expert-level resources"],
            "practice_projects": ["Hands-on projects to build portfolio"],
            "certifications": ["Relevant industry certifications"]
        }}
    }}
    4. "industry_insights": {{
        "market_trends": ["Current industry trends affecting skill demands"],
        "regional_factors": ["Location-specific considerations based on user's city"],
        "salary_expectations": ["Estimated salary ranges based on acquired skills"]
    }}
    5. "career_trajectory": {{
        "short_term_goals": ["3-6 month objectives"],
        "medium_term_goals": ["6-12 month milestones"],
        "long_term_goals": ["1-3 year career path"],
        "estimated_timeline": ["Realistic timeframe to transition to target roles"]
    }}
    6. "networking_recommendations": ["Industry groups, events, or communities to join"]
    7. "portfolio_recommendations": ["Suggested projects to demonstrate acquired skills"]

    Only return a valid raw JSON object with no additional text. Ensure all analysis is personalized to the user's specific background and goals.
    """

    
    try:
        response = await get_llm_response(prompt)
        
        # You could add response validation here to ensure valid JSON
        
        return {
            "result": response,
            "processed_at": datetime.now(),
            "request_id": request_id
        }
    except Exception as e:
        logger.error(f"Error in skill gap analysis: {str(e)}, request_id: {request_id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to process skill gap analysis: {str(e)}"
        )


@career_routes.post("/suggest-career-path", 
    response_model=CareerResponse,
    summary="Generate personalized career pathways",
    response_description="Step-by-step career path recommendations")
async def suggest_career_path(
    user_data: UserData,
    request: Request,
    _: bool = Depends(check_rate_limit)
):
    request_id = request.headers.get("X-Request-ID", f"req-{datetime.now().timestamp()}")
    logger.info(f"Processing career path suggestion, request_id: {request_id}")
    
    prompt = f"""
    Based on the user's comprehensive profile, generate a detailed and personalized career development roadmap:

    CAREER PROFILE:
    - Current Skills: {user_data.current_skills}
    - Experience: {user_data.experience.current_role} with {user_data.experience.years_of_experience} years
    - Previous Roles: {user_data.experience.past_roles}
    - Education: {user_data.education.highest_level} in {user_data.education.field_of_study} from {user_data.education.institution}
    - Target Roles: {user_data.desired_roles}
    - Career Interests: {user_data.career_interests}
    - Career Stage: {user_data.career_info.career_stage if hasattr(user_data.career_info, 'career_stage') else "Not specified"}
    - Career Goals: {user_data.career_info.career_goals if hasattr(user_data.career_info, 'career_goals') else "Not specified"}
    - Location: {user_data.location.city if hasattr(user_data, 'location') and hasattr(user_data.location, 'city') else "Not specified"}
    - Work Preferences: {user_data.preferences.work_environment if hasattr(user_data, 'preferences') and hasattr(user_data.preferences, 'work_environment') else "Not specified"}

    Return a comprehensive JSON response with these keys:
    1. "career_pathway": {{
    "short_term_goals": [
        {{
        "timeframe": "0-3 months",
        "focus_areas": [Specific skills or knowledge to prioritize],
        "actionable_steps": [Concrete tasks with measurable outcomes],
        "learning_objectives": [Key concepts to master],
        "networking_targets": [Specific connections or communities to build],
        "project_recommendations": [Portfolio-building opportunities]
        }},
        {{
        "timeframe": "4-6 months",
        "focus_areas": [],
        "actionable_steps": [],
        "learning_objectives": [],
        "networking_targets": [],
        "project_recommendations": []
        }},
        {{
        "timeframe": "7-12 months",
        "focus_areas": [],
        "actionable_steps": [],
        "learning_objectives": [],
        "networking_targets": [],
        "project_recommendations": []
        }}
    ],
    "mid_term_goals": [
        {{
        "timeframe": "Year 1-2",
        "potential_roles": [Intermediate positions to target],
        "key_responsibilities": [Skills to demonstrate mastery in],
        "advancement_strategies": [Ways to position for promotion or transition],
        "professional_development": [Formal education, certifications, or training],
        "leadership_opportunities": [Ways to demonstrate management potential]
        }},
        {{
        "timeframe": "Year 2-3",
        "potential_roles": [],
        "key_responsibilities": [],
        "advancement_strategies": [],
        "professional_development": [],
        "leadership_opportunities": []
        }}
    ],
    "long_term_goals": [
        {{
        "timeframe": "Year 3-5",
        "career_positioning": [Strategic specialization or generalization advice],
        "industry_positioning": [Sectors or niches to target],
        "leadership_trajectory": [Management or technical leadership path recommendations],
        "expertise_development": [Areas to develop thought leadership]
        }},
        {{
        "timeframe": "Year 5+",
        "senior_role_opportunities": [Executive or advanced positions to aspire to],
        "alternative_pathways": [Potential career pivots or entrepreneurial options],
        "industry_impact_goals": [Ways to shape the field or drive innovation]
        }}
    ]
    }},
    "skill_development_roadmap": {{
        "technical_skills": [
        {{
            "skill": "Specific technical skill",
            "current_level": "Assessment of current proficiency",
            "target_level": "Required proficiency for goals",
            "development_timeline": "When to focus on this skill",
            "learning_resources": [Specific courses, books, or practice opportunities],
            "application_opportunities": [Where to demonstrate this skill],
            "measurement_criteria": "How to assess mastery"
        }}
        ],
        "soft_skills": [
        {{
            "skill": "Specific soft skill",
            "importance": "Relevance to career goals",
            "development_approach": "How to cultivate this skill",
            "practice_venues": [Forums to develop and showcase]
        }}
        ],
        "domain_knowledge": [
        {{
            "area": "Specific knowledge domain",
            "acquisition_strategy": "How to develop expertise",
            "key_concepts": [Essential topics to master],
            "industry_applications": [How this knowledge applies to target roles]
        }}
        ]
    }},
    "potential_challenges": [
        {{
        "challenge": "Specific obstacle",
        "likelihood": "Probability of encountering",
        "impact": "Effect on career trajectory if encountered",
        "mitigation_strategies": [Specific approaches to overcome],
        "contingency_plans": [Alternative paths if challenge proves insurmountable]
        }}
    ],
    "career_milestones": [
        {{
        "milestone": "Specific achievement",
        "target_timeframe": "When to achieve",
        "significance": "Why this matters for career progression",
        "prerequisites": [Conditions needed to reach this milestone],
        "celebration_criteria": "How to know when truly achieved"
        }}
    ],
    "mentorship_and_networking": {{
        "mentor_profiles": [Types of mentors to seek out],
        "networking_strategy": [Specific approach to relationship building],
        "community_engagement": [Professional groups or forums to join],
        "thought_leadership": [Ways to establish professional reputation]
    }},
    "work_life_integration": {{
        "sustainability_considerations": [How to pursue goals while maintaining balance],
        "burnout_prevention": [Strategies to maintain career longevity],
        "personal_development": [Non-professional growth that supports career]
    }}

    Only return a valid raw JSON object with no additional text, markdown, or code blocks. Ensure all recommendations are personalized to the user's specific background, goals, and preferences.
    """

        
    try:
        response = await get_llm_response(prompt)
        
        return {
            "result": response,
            "processed_at": datetime.now(),
            "request_id": request_id
        }
    except Exception as e:
        logger.error(f"Error in career path suggestion: {str(e)}, request_id: {request_id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to generate career path suggestions: {str(e)}"
        )


@career_routes.post("/job-market-insights", 
    response_model=CareerResponse,
    summary="Get job market trends and insights",
    response_description="Current job market analysis for specified skills and location")
async def job_market_insights(
    user_data: UserData,
    request: Request,
    _: bool = Depends(check_rate_limit)
):
    request_id = request.headers.get("X-Request-ID", f"req-{datetime.now().timestamp()}")
    logger.info(f"Processing job market insights, request_id: {request_id}")
    
    location_text = f"in {user_data.location}" if user_data.location else "globally"
    
    prompt = f"""
    Provide comprehensive job market intelligence for a professional with the following profile:

    CANDIDATE PROFILE:
    - Skills: {user_data.current_skills}
    - Target Roles: {user_data.desired_roles}
    - Career Interests: {user_data.career_interests}
    - Experience Level: {user_data.experience.years_of_experience} years as {user_data.experience.current_role}
    - Education: {user_data.education.highest_level} in {user_data.education.field_of_study}
    - Location: {location_text}
    - Work Preferences: {user_data.preferences.work_environment if hasattr(user_data, 'preferences') and hasattr(user_data.preferences, 'work_environment') else "Not specified"} environment

    Return a detailed JSON response with these keys:
    1. "market_demand_analysis": {{
    "high_demand_skills": [Top 10 most sought-after skills in their target field {location_text}, with demand rating 1-10],
    "saturated_skills": [Skills that are common and less differentiating in the market],
    "emerging_skills": [Newer skills showing rapid growth in job postings with growth percentage],
    "technical_vs_soft_skills_balance": [Analysis of employer preferences for technical vs. soft skills in this field]
    }}
    2. "role_insights": [
    {{
        "role_title": "Specific Target Role",
        "common_requirements": [Most frequently listed requirements in job postings],
        "average_years_experience": "Typical experience required",
        "common_titles": [Variations of this role title to search for],
        "remote_opportunities": "Percentage of roles offering remote work",
        "entry_vs_senior_distribution": "Breakdown of junior vs senior positions available"
    }}
    ]
    3. "industry_landscape": {{
    "growing_sectors": [Industries with highest growth potential for these roles with growth rates],
    "declining_sectors": [Areas seeing reduced demand],
    "geographical_hotspots": [Cities with highest concentration of relevant opportunities],
    "startup_vs_enterprise": [Analysis of opportunity distribution by company size/stage]
    }}
    4. "compensation_insights": {{
    "salary_ranges": {{
        "entry_level": "Range for 0-2 years experience {location_text}",
        "mid_level": "Range for 3-5 years experience {location_text}",
        "senior_level": "Range for 6+ years experience {location_text}"
    }},
    "compensation_trends": "Year-over-year salary growth percentage",
    "benefits_trends": [Most commonly offered benefits for these roles],
    "negotiation_leverage_points": [Areas where candidates have most negotiation power]
    }}
    5. "future_outlook": {{
    "five_year_projection": "Projected demand change over next 5 years",
    "automation_risk": "Assessment of how AI/automation might impact these roles",
    "emerging_hybrid_roles": [New combined skill set positions appearing in job market],
    "reskilling_opportunities": [Adjacent career paths that leverage existing skills]
    }}
    6. "hiring_channel_effectiveness": {{
    "job_boards": [Most effective platforms for finding relevant postings],
    "networking_platforms": [Key professional networks for the industry/roles],
    "recruitment_agencies": [Agencies specializing in these roles/industries],
    "direct_application_success_rate": "Effectiveness of company website applications"
    }}
    7. "interview_process_insights": {{
    "common_assessments": [Typical evaluation methods used],
    "interview_stages": [Average number and types of interviews],
    "key_evaluation_criteria": [What hiring managers prioritize for these roles]
    }}

    Only return a valid raw JSON object with no additional text or explanation.
    """
    
    try:
        response = await get_llm_response(prompt)
        
        return {
            "result": response,
            "processed_at": datetime.now(),
            "request_id": request_id
        }
    except Exception as e:
        logger.error(f"Error in job market insights: {str(e)}, request_id: {request_id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to retrieve job market insights: {str(e)}"
        )

