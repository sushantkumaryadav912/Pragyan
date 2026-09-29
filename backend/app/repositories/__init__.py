"""Data-access helpers for scans and device upserts (incl. change detection)."""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Device, Scan, Service
from app.services.discovery.parser import ParsedHost


async def create_scan(db: AsyncSession, target_cidr: str) -> Scan:
    scan = Scan(target_cidr=target_cidr, status="pending")
    db.add(scan)
    await db.commit()
    await db.refresh(scan)
    return scan


async def get_scan(db: AsyncSession, scan_id: int) -> Scan | None:
    return await db.get(Scan, scan_id)


async def list_scans(db: AsyncSession, limit: int = 50) -> list[Scan]:
    res = await db.execute(select(Scan).order_by(Scan.id.desc()).limit(limit))
    return list(res.scalars().all())


async def set_scan_status(
    db: AsyncSession,
    scan_id: int,
    status: str,
    *,
    hosts_found: int | None = None,
    error: str | None = None,
    finished: bool = False,
) -> None:
    scan = await db.get(Scan, scan_id)
    if scan is None:
        return
    scan.status = status
    if hosts_found is not None:
        scan.hosts_found = hosts_found
    if error is not None:
        scan.error = error
    if finished:
        scan.finished_at = datetime.now(timezone.utc)
    await db.commit()


async def upsert_hosts(db: AsyncSession, hosts: list[ParsedHost]) -> int:
    """Insert/update devices and their services. Returns the count of hosts processed.

    Change detection: a device whose IP has never been seen is marked ``is_new``;
    previously-seen devices are un-flagged and have their ``last_seen`` refreshed.
    """
    now = datetime.now(timezone.utc)
    processed = 0

    for host in hosts:
        if host.status != "up":
            continue
        processed += 1

        existing = (
            await db.execute(select(Device).where(Device.ip == host.ip))
        ).scalar_one_or_none()

        if existing is None:
            device = Device(
                ip=host.ip,
                mac=host.mac,
                hostname=host.hostname,
                os=host.os,
                status="up",
                is_new=True,
                first_seen=now,
                last_seen=now,
            )
            db.add(device)
            await db.flush()  # assign device.id
        else:
            device = existing
            device.is_new = False
            device.status = "up"
            device.last_seen = now
            if host.mac:
                device.mac = host.mac
            if host.hostname:
                device.hostname = host.hostname
            if host.os:
                device.os = host.os

        # Replace the service set with the freshly observed open ports.
        current = (
            await db.execute(select(Service).where(Service.device_id == device.id))
        ).scalars().all()
        existing_keys = {(s.port, s.protocol): s for s in current}
        seen_keys: set[tuple[int, str]] = set()

        for svc in host.services:
            key = (svc.port, svc.protocol)
            seen_keys.add(key)
            row = existing_keys.get(key)
            if row is None:
                db.add(
                    Service(
                        device_id=device.id,
                        port=svc.port,
                        protocol=svc.protocol,
                        name=svc.name,
                        product=svc.product,
                        version=svc.version,
                        state=svc.state,
                    )
                )
            else:
                row.name = svc.name
                row.product = svc.product
                row.version = svc.version
                row.state = svc.state

        # Drop ports that are no longer open (closed-port change).
        for key, row in existing_keys.items():
            if key not in seen_keys:
                await db.delete(row)

    await db.commit()
    return processed
