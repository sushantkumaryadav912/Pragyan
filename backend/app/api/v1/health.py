from fastapi import APIRouter
from sqlalchemy import text

from app.core.db import SessionLocal
from app.core.redis import redis_ping
from app.schemas import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    db_ok = "ok"
    try:
        async with SessionLocal() as session:
            await session.execute(text("SELECT 1"))
    except Exception:
        db_ok = "error"

    redis_ok = "ok" if await redis_ping() else "error"
    overall = "ok" if db_ok == "ok" and redis_ok == "ok" else "degraded"
    return HealthResponse(status=overall, db=db_ok, redis=redis_ok)
