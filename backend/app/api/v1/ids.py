"""Suricata NIDS Ingestion API Router."""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.repositories import create_alert
from app.schemas import AlertOut
from app.services.ids import parse_suricata_eve_alert
from app.websocket import ws_manager

router = APIRouter(prefix="/ids", tags=["ids"])


@router.post("/suricata/event", response_model=AlertOut, status_code=201)
async def ingest_suricata_eve_event(
    eve_payload: dict[str, Any],
    db: AsyncSession = Depends(get_db),
) -> AlertOut:
    """Ingest a raw Suricata EVE JSON event record and convert it into a Pragyan Alert."""
    parsed_alert = parse_suricata_eve_alert(eve_payload)
    if parsed_alert is None:
        raise HTTPException(
            status_code=400,
            detail="Payload is not a valid Suricata 'alert' event_type.",
        )

    created = await create_alert(db, parsed_alert)
    out = AlertOut.model_validate(created)
    await ws_manager.broadcast("ALERT_NEW", out.model_dump(mode="json"))
    return out
