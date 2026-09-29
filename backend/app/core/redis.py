"""Shared async Redis client."""
from __future__ import annotations

import redis.asyncio as aioredis

from app.core.config import settings

redis_client: aioredis.Redis = aioredis.from_url(
    settings.redis_url, encoding="utf-8", decode_responses=True
)


async def redis_ping() -> bool:
    try:
        return bool(await redis_client.ping())
    except Exception:
        return False
