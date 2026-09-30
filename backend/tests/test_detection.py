"""Tests for security detection engine rules and alert management."""
from __future__ import annotations

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.db import Base
from app.models.alert import Alert
from app.models.device import Device
from app.models.service import Service
from app.models.traffic import ConnectionEvent, DNSEvent
from app.repositories import create_alert, get_alert, list_alerts, update_alert_status
from app.services.detection import (
    evaluate_brute_force,
    evaluate_dns_anomalies,
    evaluate_port_scan,
    evaluate_rogue_device,
)


@pytest_asyncio.fixture
async def async_db():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    Session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with Session() as session:
        yield session

    await engine.dispose()


def test_port_scan_detector():
    conns = [
        ConnectionEvent(src_ip="192.168.1.50", dst_ip="192.168.1.10", dst_port=port, protocol="tcp")
        for port in range(1, 25)
    ]
    alerts = evaluate_port_scan(conns, threshold_ports=15)
    assert len(alerts) == 1
    assert alerts[0].alert_type == "PORT_SCAN"
    assert alerts[0].source_ip == "192.168.1.50"
    assert alerts[0].severity == "HIGH"


def test_brute_force_detector():
    conns = [
        ConnectionEvent(src_ip="192.168.1.99", dst_ip="192.168.1.10", dst_port=22, protocol="tcp")
        for _ in range(12)
    ]
    alerts = evaluate_brute_force(conns, threshold_attempts=10)
    assert len(alerts) == 1
    assert alerts[0].alert_type == "BRUTE_FORCE"
    assert alerts[0].destination_port == 22


def test_dns_anomaly_detector():
    dns_events = [
        DNSEvent(src_ip="192.168.1.45", dst_ip="192.168.1.1", query="x7q2m9z8p4n1.tunnel-c2.net", entropy=4.15),
        DNSEvent(src_ip="192.168.1.10", dst_ip="192.168.1.1", query="google.com", entropy=2.2),
    ]
    alerts = evaluate_dns_anomalies(dns_events, entropy_threshold=3.8)
    assert len(alerts) == 1
    assert alerts[0].alert_type == "DNS_ANOMALY"
    assert alerts[0].severity == "CRITICAL"


def test_rogue_device_detector():
    dev = Device(
        ip="192.168.1.88",
        status="up",
        is_new=True,
        services=[Service(port=23, protocol="tcp", name="telnet", state="open")],
    )
    alert = evaluate_rogue_device(dev)
    assert alert is not None
    assert alert.alert_type == "ROGUE_DEVICE"


@pytest.mark.asyncio
async def test_alert_repository_lifecycle(async_db: AsyncSession):
    alert = Alert(
        alert_type="PORT_SCAN",
        title="Test Port Scan",
        severity="HIGH",
        risk_score=85,
        source_ip="192.168.1.50",
        description="Test port scan alert",
        status="NEW",
    )
    created = await create_alert(async_db, alert)
    assert created.id is not None
    assert created.status == "NEW"

    all_alerts = await list_alerts(async_db, status="NEW")
    assert len(all_alerts) == 1

    updated = await update_alert_status(async_db, created.id, "ACKNOWLEDGED")
    assert updated is not None
    assert updated.status == "ACKNOWLEDGED"

    retrieved = await get_alert(async_db, created.id)
    assert retrieved is not None
    assert retrieved.status == "ACKNOWLEDGED"
