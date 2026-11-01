import asyncio
import hashlib
import logging

import httpx
import os
from dotenv import load_dotenv

from app.core.config import settings
from app.utils.json_response import parse_json_response

load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL_NAME = os.getenv("MODEL_NAME")
logger = logging.getLogger(__name__)
MAX_RATE_LIMIT_RETRIES = 5
MAX_CONCURRENT_LLM_REQUESTS = max(1, int(os.getenv("MAX_CONCURRENT_LLM_REQUESTS", "2")))
CACHE_TTL_SECONDS = max(0, int(os.getenv("LLM_RESPONSE_CACHE_TTL_SECONDS", "300")))
MAX_CACHE_ENTRIES = max(1, int(os.getenv("LLM_RESPONSE_CACHE_MAX_ENTRIES", "128")))
_request_semaphore = asyncio.Semaphore(MAX_CONCURRENT_LLM_REQUESTS)
_response_cache = {}
_cache_lock = asyncio.Lock()


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

    prompt_key = hashlib.sha256(prompt.encode("utf-8")).hexdigest()
    if CACHE_TTL_SECONDS:
        loop_time = asyncio.get_running_loop().time()
        async with _cache_lock:
            expired_keys = [key for key, value in _response_cache.items() if value[0] <= loop_time]
            for key in expired_keys:
                _response_cache.pop(key, None)
            cached = _response_cache.get(prompt_key)
            if cached and cached[0] > loop_time:
                return cached[1]

    try:
        # A small bounded pool prevents provider bursts without serialising all
        # three independent analysis requests behind one long-running request.
        async with _request_semaphore:
            async with httpx.AsyncClient(timeout=httpx.Timeout(75.0, connect=10.0)) as client:
                for attempt in range(MAX_RATE_LIMIT_RETRIES + 1):
                    res = await client.post(
                        settings.MODEL_PROVIDER_URL,
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

        # Extract and validate the structured model output once, at the edge.
        llm_response = data["choices"][0].get("message", {}).get("content")
        parsed_response = parse_json_response(llm_response)
        if CACHE_TTL_SECONDS:
            expires_at = asyncio.get_running_loop().time() + CACHE_TTL_SECONDS
            async with _cache_lock:
                while len(_response_cache) >= MAX_CACHE_ENTRIES:
                    _response_cache.pop(next(iter(_response_cache)), None)
                _response_cache[prompt_key] = (expires_at, parsed_response)
        return parsed_response
    
    except Exception as e:
        raise RuntimeError(f"LLM API call failed: {str(e)}")
