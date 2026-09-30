from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.threat_intel import ThreatIntelIOC

class ThreatIntelMatcher:
    @staticmethod
    async def match_indicator(db: AsyncSession, value: str) -> Optional[ThreatIntelIOC]:
        """
        Matches a given IP, domain, or hash against active threat intelligence IOC database.
        """
        result = await db.execute(
            select(ThreatIntelIOC).where(
                ThreatIntelIOC.value == value,
                ThreatIntelIOC.active == True
            )
        )
        return result.scalars().first()

    @staticmethod
    async def add_ioc(
        db: AsyncSession,
        ioc_type: str,
        value: str,
        threat_category: str,
        severity: str = "HIGH",
        source: str = "Manual"
    ) -> ThreatIntelIOC:
        ioc = ThreatIntelIOC(
            ioc_type=ioc_type,
            value=value,
            threat_category=threat_category,
            severity=severity,
            source=source,
            active=True
        )
        db.add(ioc)

        from app.repositories.audit import log_audit_event
        await log_audit_event(
            db,
            username="admin",
            action="ADD_THREAT_IOC",
            target=value,
            details=f"Added {ioc_type} IOC indicator [{threat_category}] severity {severity}",
            status="SUCCESS"
        )

        await db.commit()
        await db.refresh(ioc)
        return ioc

    @staticmethod
    async def list_iocs(db: AsyncSession) -> List[ThreatIntelIOC]:
        result = await db.execute(select(ThreatIntelIOC).order_by(ThreatIntelIOC.id.desc()))
        return list(result.scalars().all())
