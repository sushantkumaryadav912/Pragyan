"""Tests for device change history tracking."""
from __future__ import annotations

import pytest
import pytest_asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.db import Base
from app.models import DeviceChange
from app.repositories import get_device_changes, list_recent_changes, upsert_hosts
from app.services.discovery.parser import ParsedHost, ParsedService


@pytest_asyncio.fixture
async def async_db():

    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    Session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with Session() as session:
        yield session

    await engine.dispose()


@pytest.mark.asyncio
async def test_device_change_tracking(async_db: AsyncSession):
    # 1. Initial scan discovers a host with 1 open port
    host1 = ParsedHost(
        ip="192.168.1.100",
        status="up",
        hostname="host-100",
        services=[ParsedService(port=22, protocol="tcp", name="ssh", state="open")],
    )
    count = await upsert_hosts(async_db, [host1])
    assert count == 1

    changes = await list_recent_changes(async_db)
    assert len(changes) == 2  # NEW_DEVICE and NEW_PORT 22
    types = {c.change_type for c in changes}
    assert "NEW_DEVICE" in types
    assert "NEW_PORT" in types

    # 2. Subsequent scan: port 80 opens and hostname changes
    host2 = ParsedHost(
        ip="192.168.1.100",
        status="up",
        hostname="host-100-updated.local",
        services=[
            ParsedService(port=22, protocol="tcp", name="ssh", state="open"),
            ParsedService(port=80, protocol="tcp", name="http", state="open"),
        ],
    )
    await upsert_hosts(async_db, [host2])

    dev_changes = await get_device_changes(async_db, device_id=1)
    assert len(dev_changes) == 4  # NEW_DEVICE, NEW_PORT 22, METADATA_CHANGE, NEW_PORT 80
    assert dev_changes[0].change_type in ("NEW_PORT", "METADATA_CHANGE")

    # 3. Subsequent scan: port 22 closes
    host3 = ParsedHost(
        ip="192.168.1.100",
        status="up",
        hostname="host-100-updated.local",
        services=[
            ParsedService(port=80, protocol="tcp", name="http", state="open"),
        ],
    )
    await upsert_hosts(async_db, [host3])

    latest_changes = await get_device_changes(async_db, device_id=1)
    assert len(latest_changes) == 5
    assert latest_changes[0].change_type == "CLOSED_PORT"
    assert "22/tcp" in latest_changes[0].old_value
