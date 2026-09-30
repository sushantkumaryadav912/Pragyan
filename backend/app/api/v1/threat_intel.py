from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.db import get_db
from app.schemas import ThreatIntelIOCOut, ThreatIntelIOCCreate
from app.services.threat_intel.matcher import ThreatIntelMatcher


router = APIRouter(prefix="/threat-intel", tags=["Threat Intelligence"])

@router.get("/iocs", response_model=List[ThreatIntelIOCOut])
async def list_iocs(db: AsyncSession = Depends(get_db)):
    """List threat intelligence indicators of compromise (IOCs)."""
    return await ThreatIntelMatcher.list_iocs(db)

@router.post("/iocs", response_model=ThreatIntelIOCOut)
async def add_ioc(body: ThreatIntelIOCCreate, db: AsyncSession = Depends(get_db)):
    """Add a new threat intelligence IOC indicator."""
    return await ThreatIntelMatcher.add_ioc(
        db, body.ioc_type, body.value, body.threat_category, body.severity, body.source
    )
