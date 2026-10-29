import asyncio
import logging

import httpx
from app.core.config import settings
from fastapi import HTTPException


logger = logging.getLogger(__name__)
MAX_RATE_LIMIT_RETRIES = 2


def _retry_delay(response: httpx.Response) -> float:
    """Honor a provider Retry-After value without allowing an unbounded wait."""
    try:
        return min(max(float(response.headers.get("Retry-After", "1")), 0.25), 5.0)
    except ValueError:
        return 1.0


async def generate_career_advice(payload):
    if not settings.OPENROUTER_API_KEY or not settings.MODEL_PROVIDER_URL or not settings.MODEL_NAME:
        logger.error("Career recommendation provider is not fully configured")
        raise HTTPException(status_code=503, detail="Career recommendation service is not configured")

    system_prompt = (
        "You are a strategic career advisor with expertise in global job trends, skill development, and personalized career planning. "
        "You MUST provide EXACTLY 3 different career path recommendations. This is a hard requirement. Each recommendation must be fully developed with all sections below."
        "I will check your output and reject it if you do not provide 3 complete recommendations."
        "Your response must include '## 1. [Career Path Name]', '## 2. [Career Path Name]', and '## 3. [Career Path Name]' with complete sections under each."

        "\n\n# Career Recommendations\n\n"

        # First recommendation
        "## 1. [Career Path Name]\n"
        "### Overview\n"
        "[Detailed explanation of career path]\n\n"
        "### Why This Career Fits\n"
        "- Alignment with personality type: [explanation]\n"
        "- Psychological strengths: [strengths]\n\n"
        "### Skills to Develop\n"
        "- **[Skill 1]** — [description]\n"
        "- **[Skill 2]** — [description]\n"
        "- **[Skill 3]** — [description]\n"
        "- **[Skill 4]** — [description]\n\n"
        "### 3–6 Month Learning Roadmap\n"
        "- **Month 1–2**: [Topic/Skill] – Learn from [Course] [Link]\n"
        "- **Month 3–4**: [Topic/Skill] – Learn from [Course] [Link]\n"
        "- **Month 5–6**: [Topic/Skill] – Learn from [Course] [Link]\n"
        "- **Estimated weekly time commitment**: [hours/week]\n\n"
        "### Learning Curve\n"
        "[Learning curve details]\n\n"
        "### Entry Strategies\n"
        "- **Entry Role 1**: [details]\n"
        "- **Entry Role 2**: [details]\n"
        "- **Optional freelance/startup path**: [details]\n\n"
        "### 5-Year Career Growth Path\n"
        "- **Year 1–2**: [details]\n"
        "- **Year 3–4**: [details]\n"
        "- **Year 5**: [details]\n\n"

        "---\n\n"

        # Second recommendation - REQUIRED
        "## 2. [Different Career Path Name]\n"
        "### Overview\n"
        "[Detailed explanation of career path]\n\n"
        "### Why This Career Fits\n"
        "- Alignment with personality type: [explanation]\n"
        "- Psychological strengths: [strengths]\n\n"
        "### Skills to Develop\n"
        "- **[Skill 1]** — [description]\n"
        "- **[Skill 2]** — [description]\n"
        "- **[Skill 3]** — [description]\n"
        "- **[Skill 4]** — [description]\n\n"
        "### 3–6 Month Learning Roadmap\n"
        "- **Month 1–2**: [Topic/Skill] – Learn from [Course] [Link]\n"
        "- **Month 3–4**: [Topic/Skill] – Learn from [Course] [Link]\n"
        "- **Month 5–6**: [Topic/Skill] – Learn from [Course] [Link]\n"
        "- **Estimated weekly time commitment**: [hours/week]\n\n"
        "### Learning Curve\n"
        "[Learning curve details]\n\n"
        "### Entry Strategies\n"
        "- **Entry Role 1**: [details]\n"
        "- **Entry Role 2**: [details]\n"
        "- **Optional freelance/startup path**: [details]\n\n"
        "### 5-Year Career Growth Path\n"
        "- **Year 1–2**: [details]\n"
        "- **Year 3–4**: [details]\n"
        "- **Year 5**: [details]\n\n"

        "---\n\n"

        # Third recommendation - REQUIRED
        "## 3. [Another Different Career Path Name]\n"
        "### Overview\n"
        "[Detailed explanation of career path]\n\n"
        "### Why This Career Fits\n"
        "- Alignment with personality type: [explanation]\n"
        "- Psychological strengths: [strengths]\n\n"
        "### Skills to Develop\n"
        "- **[Skill 1]** — [description]\n"
        "- **[Skill 2]** — [description]\n"
        "- **[Skill 3]** — [description]\n"
        "- **[Skill 4]** — [description]\n\n"
        "### 3–6 Month Learning Roadmap\n"
        "- **Month 1–2**: [Topic/Skill] – Learn from [Course] [Link]\n"
        "- **Month 3–4**: [Topic/Skill] – Learn from [Course] [Link]\n"
        "- **Month 5–6**: [Topic/Skill] – Learn from [Course] [Link]\n"
        "- **Estimated weekly time commitment**: [hours/week]\n\n"
        "### Learning Curve\n"
        "[Learning curve details]\n\n"
        "### Entry Strategies\n"
        "- **Entry Role 1**: [details]\n"
        "- **Entry Role 2**: [details]\n"
        "- **Optional freelance/startup path**: [details]\n\n"
        "### 5-Year Career Growth Path\n"
        "- **Year 1–2**: [details]\n"
        "- **Year 3–4**: [details]\n"
        "- **Year 5**: [details]"

        "IMPORTANT NOTE: MAINTAIN THE STRUCTURE AT ALL TIMES, USE THE SAME FLOW"
    )
    
    user_content = (
        f"Personality Type: {payload.personality_type}\n"
        f"Interests: {', '.join(payload.interests)}\n"
        f"Education Level: {payload.education_level}\n"
        f"Experience: {payload.experience_years} years\n"
        f"Current Role: {payload.current_role}\n"
        f"Preferred Work Type: {payload.work_type}\n"
        f"Desired Industries: {', '.join(payload.desired_industries)}\n"
        f"Career Goals: {payload.career_goals}\n"
        f"Career Stage: {payload.career_stage}\n"
        f"Desired Roles: {', '.join(payload.desired_roles)}\n"
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
        async with httpx.AsyncClient(timeout=httpx.Timeout(45.0, connect=10.0)) as client:
            for attempt in range(MAX_RATE_LIMIT_RETRIES + 1):
                response = await client.post(
                    settings.MODEL_PROVIDER_URL,
                    json=body,
                    headers=headers,
                )
                if response.status_code != 429:
                    response.raise_for_status()
                    result = response.json()
                    content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
                    if content.count("## ") < 3:
                        raise HTTPException(status_code=502, detail="The career provider returned an incomplete recommendation")
                    return content

                if attempt == MAX_RATE_LIMIT_RETRIES:
                    logger.warning("Career provider remained rate limited after %s retries", MAX_RATE_LIMIT_RETRIES)
                    raise HTTPException(status_code=503, detail="Career recommendations are temporarily busy. Please try again shortly.")
                await asyncio.sleep(_retry_delay(response))

    except httpx.HTTPStatusError as http_err:
        logger.error("Career provider returned HTTP %s", http_err.response.status_code)
        raise HTTPException(status_code=502, detail="Career recommendation provider could not complete the request")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unexpected career recommendation failure")
        raise HTTPException(status_code=502, detail="Career recommendation could not be generated")
