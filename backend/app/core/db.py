"""Async SQLAlchemy engine, session factory, and declarative base."""
from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

engine = create_async_engine(settings.database_url, echo=False, pool_pre_ping=True)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session


async def init_db() -> None:
    """Create tables and seed default operational data for all platform screens."""
    # Import models so they register on Base.metadata before create_all.
    from app import models
    from app.models import (
        User, Device, Service, DeviceChange, Scan, Alert, Incident, 
        ResponseAction, ThreatIntelIOC, AuditLog, ConnectionEvent, DNSEvent
    )
    from app.repositories.users import get_user_by_username, create_user
    from sqlalchemy import select, func
    from datetime import datetime, timezone

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as session:
        # Seed Admin user
        admin = await get_user_by_username(session, "admin")
        if not admin:
            await create_user(
                session,
                username="admin",
                email="admin@pragyan.internal",
                password="admin123",
                role="ADMIN"
            )

        now = datetime.now(timezone.utc)

        # Seed Devices if empty
        device_count = (await session.execute(select(func.count(Device.id)))).scalar_one()
        if device_count == 0:
            dev1 = Device(ip="10.24.81.1", mac="00:11:22:33:44:55", hostname="gateway.local", os="Linux 5.15 RouterOS", status="up", is_new=False, first_seen=now, last_seen=now)
            dev2 = Device(ip="10.24.81.106", mac="be:81:c3:35:f3:59", hostname="sushants-fedora", os="Fedora Linux 39", status="up", is_new=True, first_seen=now, last_seen=now)
            dev3 = Device(ip="10.24.81.200", mac="70:85:c2:10:99:a1", hostname="soc-analytics-01", os="Ubuntu 22.04 LTS", status="up", is_new=False, first_seen=now, last_seen=now)
            dev4 = Device(ip="10.24.81.250", mac="90:e2:ba:44:11:02", hostname="db-cluster-node1", os="Red Hat Enterprise Linux 9", status="up", is_new=False, first_seen=now, last_seen=now)
            session.add_all([dev1, dev2, dev3, dev4])
            await session.flush()

            # Services
            svc1 = Service(device_id=dev1.id, port=80, protocol="tcp", name="http", product="nginx", version="1.24.0", state="open")
            svc2 = Service(device_id=dev1.id, port=443, protocol="tcp", name="https", product="nginx", version="1.24.0", state="open")
            svc3 = Service(device_id=dev2.id, port=22, protocol="tcp", name="ssh", product="OpenSSH", version="9.3p1", state="open")
            svc4 = Service(device_id=dev3.id, port=8000, protocol="tcp", name="http", product="uvicorn", version="0.28.0", state="open")
            svc5 = Service(device_id=dev4.id, port=5432, protocol="tcp", name="postgresql", product="PostgreSQL", version="15.2", state="open")
            session.add_all([svc1, svc2, svc3, svc4, svc5])

            # Device Change
            change = DeviceChange(device_id=dev2.id, change_type="NEW_DEVICE", title="New Host Discovered", description="Device 10.24.81.106 first detected on local subnet scan", new_value="10.24.81.106", timestamp=now)
            session.add(change)

        # Seed Scans if empty
        scan_count = (await session.execute(select(func.count(Scan.id)))).scalar_one()
        if scan_count == 0:
            init_scan = Scan(
                target_cidr="10.24.81.0/24",
                status="completed",
                hosts_found=4,
                scan_type="Simulated Nmap Subnet Scan",
                started_at=now,
                finished_at=now,
                log_output="[SYSTEM] Initial Subnet Fast Scan executed. Discovered 4 live hosts."
            )
            session.add(init_scan)

        # Seed Alerts if empty
        alert_count = (await session.execute(select(func.count(Alert.id)))).scalar_one()
        if alert_count == 0:
            alt1 = Alert(title="Unusual Inbound SSH Brute-Force Attempt", description="High frequency TCP SYN connections detected targeting port 22", severity="HIGH", alert_type="BRUTE_FORCE", status="NEW", source_ip="198.51.100.42", destination_ip="10.24.81.106", timestamp=now)
            alt2 = Alert(title="Suspicious DNS Tunneling Query", description="High domain entropy query matching known C2 beaconing structure", severity="CRITICAL", alert_type="DNS_TUNNEL", status="NEW", source_ip="10.24.81.200", destination_ip="8.8.8.8", timestamp=now)
            alt3 = Alert(title="Outbound Connection to Malicious IP", description="Flow matched threat intelligence IOC feed", severity="MEDIUM", alert_type="MALICIOUS_IP", status="ACKNOWLEDGED", source_ip="10.24.81.106", destination_ip="203.0.113.195", timestamp=now)
            session.add_all([alt1, alt2, alt3])

        # Seed Incidents if empty
        incident_count = (await session.execute(select(func.count(Incident.id)))).scalar_one()
        if incident_count == 0:
            inc1 = Incident(title="Potential Data Exfiltration & C2 Activity", description="Correlated multiple CRITICAL alerts involving host 10.24.81.200.", severity="CRITICAL", status="OPEN", alert_ids="[1, 2]", created_at=now, updated_at=now)
            inc2 = Incident(title="Subnet Port Scan Activity", description="Sequential TCP probes across multiple internal targets", severity="HIGH", status="INVESTIGATING", alert_ids="[3]", created_at=now, updated_at=now)
            session.add_all([inc1, inc2])

        # Seed Response Actions if empty
        resp_count = (await session.execute(select(func.count(ResponseAction.id)))).scalar_one()
        if resp_count == 0:
            act1 = ResponseAction(action_type="ISOLATE_HOST", target_ip="10.24.81.200", reason="Prevent potential C2 data exfiltration", status="EXECUTED", executed_at=now, details="Added iptables DROP rule on ingress/egress interface.")
            act2 = ResponseAction(action_type="BLOCK_IP", target_ip="198.51.100.42", reason="Block external brute-force attacker", status="EXECUTED", executed_at=now, details="Added subnet null-route BGP entry.")
            session.add_all([act1, act2])

        # Seed Threat Intel IOCs if empty
        ioc_count = (await session.execute(select(func.count(ThreatIntelIOC.id)))).scalar_one()
        if ioc_count == 0:
            ioc1 = ThreatIntelIOC(ioc_type="IP", value="198.51.100.42", threat_category="Brute Force Attacker", severity="HIGH", source="AbuseIPDB Feed", active=True, created_at=now)
            ioc2 = ThreatIntelIOC(ioc_type="DOMAIN", value="malicious-c2-beacon.xyz", threat_category="C2 Server", severity="CRITICAL", source="ThreatConnect Feed", active=True, created_at=now)
            ioc3 = ThreatIntelIOC(ioc_type="FILE_HASH", value="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", threat_category="Ransomware Loader", severity="CRITICAL", source="VirusTotal API", active=True, created_at=now)
            session.add_all([ioc1, ioc2, ioc3])

        # Seed Audit Logs if empty
        audit_count = (await session.execute(select(func.count(AuditLog.id)))).scalar_one()
        if audit_count == 0:
            log1 = AuditLog(username="admin", action="ISOLATE_HOST", target="10.24.81.200", details="Host isolated via iptables drop rule on interface eth0.", status="SUCCESS", timestamp=now)
            log2 = AuditLog(username="admin", action="BLOCK_IP", target="198.51.100.42", details="Subnet firewall blocked all outbound traffic to 198.51.100.42/32.", status="SUCCESS", timestamp=now)
            log3 = AuditLog(username="admin", action="ADD_THREAT_IOC", target="malicious-c2-beacon.xyz", details="Added domain indicator to active threat intelligence feed.", status="SUCCESS", timestamp=now)
            session.add_all([log1, log2, log3])

        # Seed Traffic Connections & DNS if empty
        conn_count = (await session.execute(select(func.count(ConnectionEvent.id)))).scalar_one()
        if conn_count == 0:
            c1 = ConnectionEvent(src_ip="10.24.81.106", src_port=49200, dst_ip="10.24.81.1", dst_port=443, protocol="tcp", service="https", bytes_orig=1450, bytes_resp=8920, state="SF", timestamp=now)
            c2 = ConnectionEvent(src_ip="10.24.81.200", src_port=51234, dst_ip="8.8.8.8", dst_port=53, protocol="udp", service="dns", bytes_orig=120, bytes_resp=240, state="SF", timestamp=now)
            session.add_all([c1, c2])

            d1 = DNSEvent(src_ip="10.24.81.200", query="malicious-c2-beacon.xyz", qtype="A", answers="203.0.113.195", rcode="NOERROR", timestamp=now)
            session.add(d1)

        await session.commit()


