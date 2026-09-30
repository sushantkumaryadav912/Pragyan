"""Data-access helpers for scans and device upserts (incl. change detection)."""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Alert, Device, DeviceChange, Scan, Service
from app.services.discovery.parser import ParsedHost


async def create_alert(db: AsyncSession, alert: Alert) -> Alert:
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    return alert


async def get_alert(db: AsyncSession, alert_id: int) -> Alert | None:
    return await db.get(Alert, alert_id)


async def list_alerts(
    db: AsyncSession,
    status: str | None = None,
    severity: str | None = None,
    limit: int = 50,
) -> list[Alert]:
    stmt = select(Alert).order_by(Alert.timestamp.desc(), Alert.id.desc()).limit(limit)
    if status:
        stmt = stmt.where(Alert.status == status)
    if severity:
        stmt = stmt.where(Alert.severity == severity)
    res = await db.execute(stmt)
    return list(res.scalars().all())


async def update_alert_status(
    db: AsyncSession, alert_id: int, status: str
) -> Alert | None:
    alert = await db.get(Alert, alert_id)
    if alert is None:
        return None
    alert.status = status
    await db.commit()
    await db.refresh(alert)
    return alert



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


async def get_device_changes(
    db: AsyncSession, device_id: int, limit: int = 50
) -> list[DeviceChange]:
    res = await db.execute(
        select(DeviceChange)
        .where(DeviceChange.device_id == device_id)
        .order_by(DeviceChange.timestamp.desc(), DeviceChange.id.desc())
        .limit(limit)
    )
    return list(res.scalars().all())


async def list_recent_changes(
    db: AsyncSession, limit: int = 50
) -> list[DeviceChange]:
    res = await db.execute(
        select(DeviceChange)
        .order_by(DeviceChange.timestamp.desc(), DeviceChange.id.desc())
        .limit(limit)
    )
    return list(res.scalars().all())


async def upsert_hosts(db: AsyncSession, hosts: list[ParsedHost]) -> int:
    """Insert/update devices and their services. Returns the count of hosts processed.

    Change detection: a device whose IP has never been seen is marked ``is_new``;
    previously-seen devices are un-flagged, and state/port diffs are stored as ``DeviceChange``.
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

            db.add(
                DeviceChange(
                    device_id=device.id,
                    change_type="NEW_DEVICE",
                    title="New Device Discovered",
                    description=f"Device {host.ip} first seen on network",
                    new_value=host.ip,
                    timestamp=now,
                )
            )
        else:
            device = existing
            device.is_new = False
            device.status = "up"
            device.last_seen = now

            if host.mac and device.mac != host.mac:
                db.add(
                    DeviceChange(
                        device_id=device.id,
                        change_type="METADATA_CHANGE",
                        title="MAC Address Updated",
                        description=f"MAC address changed to {host.mac}",
                        old_value=device.mac,
                        new_value=host.mac,
                        timestamp=now,
                    )
                )
                device.mac = host.mac

            if host.hostname and device.hostname != host.hostname:
                db.add(
                    DeviceChange(
                        device_id=device.id,
                        change_type="METADATA_CHANGE",
                        title="Hostname Changed",
                        description=f"Hostname updated from '{device.hostname or ''}' to '{host.hostname}'",
                        old_value=device.hostname,
                        new_value=host.hostname,
                        timestamp=now,
                    )
                )
                device.hostname = host.hostname

            if host.os and device.os != host.os:
                db.add(
                    DeviceChange(
                        device_id=device.id,
                        change_type="METADATA_CHANGE",
                        title="OS Fingerprint Updated",
                        description=f"Operating system detected as '{host.os}'",
                        old_value=device.os,
                        new_value=host.os,
                        timestamp=now,
                    )
                )
                device.os = host.os

        # Compare service set with freshly observed open ports.
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
                db.add(
                    DeviceChange(
                        device_id=device.id,
                        change_type="NEW_PORT",
                        title=f"Port {svc.port}/{svc.protocol} Opened",
                        description=f"Service '{svc.name or 'unknown'}' detected on port {svc.port}/{svc.protocol}",
                        new_value=f"{svc.port}/{svc.protocol} ({svc.name or 'unknown'})",
                        timestamp=now,
                    )
                )
            else:
                old_ver = f"{row.product or ''} {row.version or ''}".strip()
                new_ver = f"{svc.product or ''} {svc.version or ''}".strip()
                if old_ver != new_ver or row.name != svc.name:
                    db.add(
                        DeviceChange(
                            device_id=device.id,
                            change_type="SERVICE_CHANGE",
                            title=f"Port {svc.port}/{svc.protocol} Service Updated",
                            description=f"Service info updated on port {svc.port}/{svc.protocol}",
                            old_value=f"{row.name or 'unknown'} ({old_ver})",
                            new_value=f"{svc.name or 'unknown'} ({new_ver})",
                            timestamp=now,
                        )
                    )
                row.name = svc.name
                row.product = svc.product
                row.version = svc.version
                row.state = svc.state

        # Drop ports that are no longer open (CLOSED_PORT).
        for key, row in existing_keys.items():
            if key not in seen_keys:
                db.add(
                    DeviceChange(
                        device_id=device.id,
                        change_type="CLOSED_PORT",
                        title=f"Port {row.port}/{row.protocol} Closed",
                        description=f"Port {row.port}/{row.protocol} ({row.name or 'unknown'}) is no longer open",
                        old_value=f"{row.port}/{row.protocol} ({row.name or 'unknown'})",
                        timestamp=now,
                    )
                )
                await db.delete(row)

    await db.commit()
    return processed

