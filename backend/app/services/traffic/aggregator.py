"""Traffic Aggregator — Query & compute network bandwidth, top talkers, and protocol statistics."""
from __future__ import annotations

from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.traffic import ConnectionEvent, DNSEvent


async def get_traffic_summary(db: AsyncSession) -> dict[str, Any]:
    """Compute aggregate traffic metrics: total throughput, connections, protocol distribution, top talkers."""
    # 1. Total bytes originating / responding
    tot_bytes_res = await db.execute(
        select(
            func.coalesce(func.sum(ConnectionEvent.bytes_orig), 0),
            func.coalesce(func.sum(ConnectionEvent.bytes_resp), 0),
            func.count(ConnectionEvent.id),
        )
    )
    tot_orig, tot_resp, active_conns = tot_bytes_res.one()
    total_bytes = tot_orig + tot_resp

    # 2. Protocol Breakdown
    proto_res = await db.execute(
        select(ConnectionEvent.protocol, func.count(ConnectionEvent.id))
        .group_by(ConnectionEvent.protocol)
    )
    protocol_counts = {proto.upper(): count for proto, count in proto_res.all()}

    # 3. Top Talkers by volume (src_ip)
    top_src_res = await db.execute(
        select(
            ConnectionEvent.src_ip,
            func.sum(ConnectionEvent.bytes_orig + ConnectionEvent.bytes_resp).label("total_vol"),
            func.count(ConnectionEvent.id).label("conn_count"),
        )
        .group_by(ConnectionEvent.src_ip)
        .order_by(func.sum(ConnectionEvent.bytes_orig + ConnectionEvent.bytes_resp).desc())
        .limit(5)
    )
    top_talkers = [
        {
            "ip": ip,
            "total_bytes": int(vol or 0),
            "connection_count": int(cnt),
        }
        for ip, vol, cnt in top_src_res.all()
    ]

    # 4. Total DNS queries count
    dns_cnt_res = await db.execute(select(func.count(DNSEvent.id)))
    total_dns_queries = dns_cnt_res.scalar_one()

    # Calculate throughput in Mbps (assuming 60s sample window default)
    throughput_mbps = round((total_bytes * 8) / (1024 * 1024 * 60), 2) if total_bytes > 0 else 0.0

    return {
        "throughput_mbps": throughput_mbps,
        "total_bytes": total_bytes,
        "bytes_orig": tot_orig,
        "bytes_resp": tot_resp,
        "active_connections": active_conns,
        "total_dns_queries": total_dns_queries,
        "protocol_breakdown": protocol_counts,
        "top_talkers": top_talkers,
    }


async def list_recent_connections(
    db: AsyncSession, limit: int = 50
) -> list[ConnectionEvent]:
    """Fetch latest network connection flows."""
    res = await db.execute(
        select(ConnectionEvent)
        .order_by(ConnectionEvent.timestamp.desc(), ConnectionEvent.id.desc())
        .limit(limit)
    )
    return list(res.scalars().all())


async def list_recent_dns(
    db: AsyncSession, limit: int = 50
) -> list[DNSEvent]:
    """Fetch latest DNS query logs."""
    res = await db.execute(
        select(DNSEvent)
        .order_by(DNSEvent.timestamp.desc(), DNSEvent.id.desc())
        .limit(limit)
    )
    return list(res.scalars().all())
