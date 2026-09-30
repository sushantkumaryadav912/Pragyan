"""Tests for Zeek telemetry log parsing and traffic aggregation."""
from __future__ import annotations

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.db import Base
from app.services.traffic import (
    calculate_domain_entropy,
    get_traffic_summary,
    parse_zeek_conn_line,
    parse_zeek_dns_line,
    parse_zeek_http_line,
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


def test_zeek_conn_parser():
    raw_event = {
        "ts": 1700000000.0,
        "id.orig_h": "192.168.1.50",
        "id.orig_p": 54321,
        "id.resp_h": "192.168.1.1",
        "id.resp_p": 53,
        "proto": "udp",
        "service": "dns",
        "orig_bytes": 120,
        "resp_bytes": 480,
        "duration": 0.05,
        "conn_state": "SF",
    }
    event = parse_zeek_conn_line(raw_event)
    assert event.src_ip == "192.168.1.50"
    assert event.dst_ip == "192.168.1.1"
    assert event.dst_port == 53
    assert event.protocol == "udp"
    assert event.bytes_orig == 120
    assert event.bytes_resp == 480


def test_domain_entropy_calculation():
    # Normal short domain
    entropy_normal = calculate_domain_entropy("google.com")
    # High entropy suspicious random domain (DNS tunneling candidate)
    entropy_random = calculate_domain_entropy("a9f82k3m9z8x1w7q2p4n.attacker-c2.net")

    assert entropy_normal < entropy_random
    assert entropy_random > 3.5


@pytest.mark.asyncio
async def test_traffic_aggregation(async_db: AsyncSession):
    # Insert mock connection events
    conn1 = parse_zeek_conn_line(
        {
            "id.orig_h": "192.168.1.20",
            "id.orig_p": 49152,
            "id.resp_h": "93.184.216.34",
            "id.resp_p": 443,
            "proto": "tcp",
            "service": "ssl",
            "orig_bytes": 2048,
            "resp_bytes": 8192,
        }
    )
    conn2 = parse_zeek_conn_line(
        {
            "id.orig_h": "192.168.1.20",
            "id.orig_p": 49153,
            "id.resp_h": "8.8.8.8",
            "id.resp_p": 53,
            "proto": "udp",
            "service": "dns",
            "orig_bytes": 100,
            "resp_bytes": 300,
        }
    )
    dns1 = parse_zeek_dns_line(
        {
            "id.orig_h": "192.168.1.20",
            "id.resp_h": "8.8.8.8",
            "query": "api.github.com",
            "qtype_name": "A",
            "rcode_name": "NOERROR",
        }
    )

    async_db.add(conn1)
    async_db.add(conn2)
    async_db.add(dns1)
    await async_db.commit()

    summary = await get_traffic_summary(async_db)
    assert summary["active_connections"] == 2
    assert summary["total_dns_queries"] == 1
    assert summary["total_bytes"] == (2048 + 8192 + 100 + 300)
    assert summary["protocol_breakdown"]["TCP"] == 1
    assert summary["protocol_breakdown"]["UDP"] == 1
    assert len(summary["top_talkers"]) == 1
    assert summary["top_talkers"][0]["ip"] == "192.168.1.20"
