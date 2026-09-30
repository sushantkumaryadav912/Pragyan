"""Alert Management REST API router."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.models.alert import Alert
from app.repositories import create_alert, get_alert, list_alerts, update_alert_status
from app.schemas import AlertCreate, AlertOut, AlertStatusUpdate
from app.websocket import ws_manager

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=list[AlertOut])
async def get_all_alerts(
    status: str | None = Query(None, description="Filter by status (NEW, ACKNOWLEDGED, CLOSED, etc.)"),
    severity: str | None = Query(None, description="Filter by severity (LOW, MEDIUM, HIGH, CRITICAL)"),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
) -> list[AlertOut]:
    """Fetch security detection alerts with optional status and severity filtering."""
    alerts = await list_alerts(db, status=status, severity=severity, limit=limit)
    return [AlertOut.model_validate(a) for a in alerts]


@router.post("", response_model=AlertOut, status_code=210)
async def post_new_alert(
    body: AlertCreate,
    db: AsyncSession = Depends(get_db),
) -> AlertOut:
    """Manually create or inject an alert and broadcast to WebSocket clients."""
    alert = Alert(**body.model_dump())
    created = await create_alert(db, alert)
    out = AlertOut.model_validate(created)
    await ws_manager.broadcast("ALERT_NEW", out.model_dump(mode="json"))
    return out


@router.get("/{alert_id}", response_model=AlertOut)
async def get_alert_by_id(
    alert_id: int, db: AsyncSession = Depends(get_db)
) -> AlertOut:
    """Fetch a single alert by ID."""
    alert = await get_alert(db, alert_id)
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return AlertOut.model_validate(alert)


@router.patch("/{alert_id}/status", response_model=AlertOut)
async def patch_alert_status(
    alert_id: int,
    body: AlertStatusUpdate,
    db: AsyncSession = Depends(get_db),
) -> AlertOut:
    """Update alert triage lifecycle status."""
    updated = await update_alert_status(db, alert_id, body.status)
    if updated is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    out = AlertOut.model_validate(updated)
    await ws_manager.broadcast("ALERT_UPDATE", out.model_dump(mode="json"))
    return out
