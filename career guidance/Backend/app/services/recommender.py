import httpx
from app.core.config import settings
from fastapi import HTTPException


async def generate_career_advice(payload):
    system_prompt = (
        "You are an expert AI career advisor with deep knowledge of modern job markets, industry trends, and career development paths. "
        "Analyze the user's profile holistically to provide personalized career guidance that aligns with their personality, interests, strengths, education, experience, and goals. "
        "For each recommended career path (2-3 options):\n"
        "1. Explain why this path aligns specifically with their personality type and strengths\n"
        "2. Outline key skills they should develop, with priority on those that leverage existing strengths\n"
        "3. Suggest specific educational steps, certifications, or training programs with realistic timelines\n"
        "4. Include potential entry points based on their current experience level\n"
        "5. Address how this path connects to their stated long-term goals\n\n"
        "Be specific rather than generic, practical rather than theoretical, and balance optimism with realism. "
        "Format your response in clear sections that are easy to read. Keep your total response under 500 words."
    )

    user_content = (
        f"Personality Type: {payload.personality_type}\n"
        f"Interests: {', '.join(payload.interests)}\n"
        f"Strengths: {', '.join(payload.strengths)}\n"
        f"Education Level: {payload.education_level}\n"
        f"Experience: {payload.experience_years} years\n"
        f"Goals: {payload.goals}"
    )

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    body = {
        "model": settings.MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ]
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                settings.MODEL_PROVIDER_URL, 
                json=body,
                headers=headers
            )
            response.raise_for_status()

            result = response.json()
            return result["choices"][0]["message"]["content"]

    except httpx.HTTPStatusError as http_err:
        raise HTTPException(
            status_code=http_err.response.status_code,
            detail=f"Model request failed: {http_err.response.text}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
