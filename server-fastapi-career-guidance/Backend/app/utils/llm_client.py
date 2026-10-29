import asyncio
import logging

import httpx
import os
from dotenv import load_dotenv

from app.utils.json_response import parse_json_response

load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL_NAME = os.getenv("MODEL_NAME")
logger = logging.getLogger(__name__)
MAX_RATE_LIMIT_RETRIES = 5
_request_lock = asyncio.Lock()


def _retry_delay(response: httpx.Response, attempt: int) -> float:
    """Use provider guidance when available, with a bounded backoff fallback."""
    backoff = min(2 ** attempt, 8.0)
    try:
        return min(max(float(response.headers.get("Retry-After", "")), backoff), 8.0)
    except ValueError:
        return backoff

async def get_llm_response(prompt: str):
    if not OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY is not configured")
    if not MODEL_NAME:
        raise RuntimeError("MODEL_NAME is not configured")

    try:
        # The analysis screen has three independent calls. Queue them locally
        # instead of sending a burst that free/shared providers reject.
        async with _request_lock:
            async with httpx.AsyncClient(timeout=httpx.Timeout(75.0, connect=10.0)) as client:
                for attempt in range(MAX_RATE_LIMIT_RETRIES + 1):
                    res = await client.post(
                        "https://openrouter.ai/api/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                            "HTTP-Referer": "http://localhost:8001/",
                            "X-Title": "Career Guide AI",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": MODEL_NAME,
                            "messages": [{"role": "user", "content": prompt}],
                            "temperature": 0.7,
                            "response_format": {"type": "json_object"}
                        }
                    )
                    if res.status_code != 429:
                        res.raise_for_status()
                        break
                    if attempt == MAX_RATE_LIMIT_RETRIES:
                        logger.warning("OpenRouter remained rate limited after %s retries", MAX_RATE_LIMIT_RETRIES)
                        raise RuntimeError("The AI provider is temporarily busy. Please retry shortly.")
                    await asyncio.sleep(_retry_delay(res, attempt))

        data = res.json()
        if not data.get("choices"):
            raise ValueError(f"Unexpected response format: {data}")

        # Extract the content from the LLM response
        llm_response = data["choices"][0].get("message", {}).get("content")
        return parse_json_response(llm_response)
    
    except Exception as e:
        raise RuntimeError(f"LLM API call failed: {str(e)}")
