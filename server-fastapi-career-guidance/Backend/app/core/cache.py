from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis
import logging
import os
from dotenv import load_dotenv

load_dotenv()

# Redis configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost")
logger = logging.getLogger(__name__)

async def setup_cache():
    """Initialize Redis caching when it is available.

    Caching is an optimisation, not a dependency for the AI services. A local
    development machine or an unavailable Redis instance must not prevent the
    API from starting.
    """
    try:
        redis = aioredis.from_url(REDIS_URL, encoding="utf8", decode_responses=True)
        await redis.ping()
        FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")
        logger.info("Redis cache enabled")
    except Exception as error:
        logger.warning("Redis cache unavailable; continuing without cache: %s", error)
