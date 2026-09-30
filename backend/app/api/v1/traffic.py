"""Traffic Telemetry REST API router."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.schemas import ConnectionOut, DNSOut, TrafficSummaryOut
from app.services.traffic import (
    get_traffic_summary,
    list_recent_connections,
    list_recent_dns,
)

router = APIRouter(prefix="/traffic", tags=["traffic"])


@router.get("/summary", response_model=TrafficSummaryOut)
async def get_traffic_metrics_summary(
    db: AsyncSession = Depends(get_db),
) -> TrafficSummaryOut:
    """Fetch aggregated network traffic summary (throughput, connections, top talkers)."""
    summary = await get_traffic_summary(db)
    return TrafficSummaryOut.model_validate(summary)


@router.get("/connections", response_model=list[ConnectionOut])
async def get_traffic_connections(
    limit: int = 50, db: AsyncSession = Depends(get_db)
) -> list[ConnectionOut]:
    """Fetch recent network flow connections."""
    conns = await list_recent_connections(db, limit=limit)
    return [ConnectionOut.model_validate(c) for c in conns]


@router.get("/dns", response_model=list[DNSOut])
async def get_traffic_dns_queries(
    limit: int = 50, db: AsyncSession = Depends(get_db)
) -> list[DNSOut]:
    """Fetch recent DNS query logs."""
    dns_logs = await list_recent_dns(db, limit=limit)
    return [DNSOut.model_validate(d) for d in dns_logs]
