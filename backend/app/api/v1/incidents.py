"""Incident Management REST API router."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.models.alert import Alert
from app.repositories import (
    create_incident,
    get_incident,
    list_incidents,
    update_incident_status,
)
from app.schemas import IncidentOut, IncidentStatusUpdate
from app.services.incidents import correlate_alerts_into_incidents
from app.websocket import ws_manager

router = APIRouter(prefix="/incidents", tags=["incidents"])


@router.get("", response_model=list[IncidentOut])
async def get_all_incidents(
    status: str | None = Query(None, description="Filter by status (OPEN, INVESTIGATING, RESOLVED, CLOSED)"),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
) -> list[IncidentOut]:
    """Fetch correlated security incidents."""
    incidents = await list_incidents(db, status=status, limit=limit)
    return [IncidentOut.model_validate(inc) for inc in incidents]


@router.post("/correlate", response_model=list[IncidentOut])
async def trigger_incident_correlation(
    db: AsyncSession = Depends(get_db),
) -> list[IncidentOut]:
    """Trigger automated alert correlation over recent unclosed alerts."""
    alerts_res = await db.execute(select(Alert).where(Alert.status != "CLOSED"))
    alerts = list(alerts_res.scalars().all())

    new_incidents = correlate_alerts_into_incidents(alerts)
    created_list = []
    for inc in new_incidents:
        created = await create_incident(db, inc)
        out = IncidentOut.model_validate(created)
        await ws_manager.broadcast("INCIDENT_NEW", out.model_dump(mode="json"))
        created_list.append(out)

    return created_list


@router.get("/{incident_id}", response_model=IncidentOut)
async def get_incident_by_id(
    incident_id: int, db: AsyncSession = Depends(get_db)
) -> IncidentOut:
    """Fetch a single incident ticket by ID."""
    incident = await get_incident(db, incident_id)
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return IncidentOut.model_validate(incident)


@router.patch("/{incident_id}/status", response_model=IncidentOut)
async def patch_incident_status(
    incident_id: int,
    body: IncidentStatusUpdate,
    db: AsyncSession = Depends(get_db),
) -> IncidentOut:
    """Update incident ticket triage status."""
    updated = await update_incident_status(db, incident_id, body.status)
    if updated is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    out = IncidentOut.model_validate(updated)
    await ws_manager.broadcast("INCIDENT_UPDATE", out.model_dump(mode="json"))
    return out
