"""Risk & ML Anomaly Scoring API Router."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.models.alert import Alert
from app.models.device import Device
from app.models.traffic import ConnectionEvent, DNSEvent
from app.schemas import RiskScoreBreakdownOut
from app.services.ml import calculate_composite_risk_score, extract_host_features

router = APIRouter(prefix="/risk", tags=["risk"])


@router.get("/devices/{device_id}", response_model=RiskScoreBreakdownOut)
async def get_device_risk_breakdown(
    device_id: int, db: AsyncSession = Depends(get_db)
) -> RiskScoreBreakdownOut:
    """Fetch multi-dimensional composite risk score breakdown for a specific device."""
    device = await db.get(Device, device_id)
    if device is None:
        raise HTTPException(status_code=404, detail="Device not found")

    # 1. Fetch alerts for this host
    alerts_res = await db.execute(
        select(Alert).where(
            (Alert.device_id == device_id) | (Alert.source_ip == device.ip)
        )
    )
    alerts = list(alerts_res.scalars().all())

    # 2. Fetch recent flow & DNS events for host
    conns_res = await db.execute(
        select(ConnectionEvent).where(ConnectionEvent.src_ip == device.ip)
    )
    conns = list(conns_res.scalars().all())

    dns_res = await db.execute(
        select(DNSEvent).where(DNSEvent.src_ip == device.ip)
    )
    dns_events = list(dns_res.scalars().all())

    # 3. Extract features & calculate risk breakdown
    features = extract_host_features(conns, dns_events)
    breakdown = calculate_composite_risk_score(device, alerts, features)

    # Persist updated risk score on device
    device.risk_score = breakdown["composite_risk_score"]
    await db.commit()

    return RiskScoreBreakdownOut.model_validate(breakdown)
