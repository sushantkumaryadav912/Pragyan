"""Tests for security incident correlation and incident management."""
from __future__ import annotations

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.db import Base
from app.models.alert import Alert
from app.models.incident import Incident
from app.repositories import create_incident, get_incident, list_incidents, update_incident_status
from app.services.incidents import correlate_alerts_into_incidents


@pytest_asyncio.fixture
async def async_db():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    Session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with Session() as session:
        yield session

    await engine.dispose()


def test_correlate_alerts_into_incidents():
    alerts = [
        Alert(alert_type="PORT_SCAN", title="Port scan", severity="HIGH", risk_score=85, destination_ip="192.168.1.10", status="NEW"),
        Alert(alert_type="BRUTE_FORCE", title="SSH Brute force", severity="HIGH", risk_score=82, destination_ip="192.168.1.10", status="NEW"),
        Alert(alert_type="DNS_ANOMALY", title="DNS Tunneling", severity="CRITICAL", risk_score=90, destination_ip="192.168.1.10", status="NEW"),
    ]

    incidents = correlate_alerts_into_incidents(alerts)
    assert len(incidents) == 1
    assert incidents[0].target_host == "192.168.1.10"
    assert incidents[0].severity == "CRITICAL"
    assert incidents[0].risk_score == 90
    assert "Correlated 3 security alert(s)" in incidents[0].summary


@pytest.mark.asyncio
async def test_incident_repository_lifecycle(async_db: AsyncSession):
    inc = Incident(
        incident_number="INC-1042",
        title="Possible Compromised Host (192.168.1.10)",
        severity="CRITICAL",
        status="OPEN",
        target_host="192.168.1.10",
        risk_score=90,
        summary="High severity incident",
    )
    created = await create_incident(async_db, inc)
    assert created.id is not None
    assert created.incident_number == "INC-1042"

    all_incidents = await list_incidents(async_db, status="OPEN")
    assert len(all_incidents) == 1

    updated = await update_incident_status(async_db, created.id, "INVESTIGATING")
    assert updated is not None
    assert updated.status == "INVESTIGATING"

    retrieved = await get_incident(async_db, created.id)
    assert retrieved is not None
    assert retrieved.status == "INVESTIGATING"
