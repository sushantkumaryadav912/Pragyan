from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any
from app.core.db import get_db
from app.repositories import get_devices, list_incidents

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/summary")
async def get_security_report_summary(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """
    Generates an executive NDR posture & security summary report.
    """
    devices = await get_devices(db)
    incidents = await list_incidents(db)


    high_risk_devices = [d for d in devices if d.risk_score >= 70]
    critical_incidents = [i for i in incidents if i.severity == "CRITICAL"]

    return {
        "report_title": "Pragyan Intelligent NDR Executive Security Assessment",
        "generated_at": "2026-09-30T19:30:00Z",
        "total_monitored_hosts": len(devices),
        "high_risk_hosts_count": len(high_risk_devices),
        "total_incidents_count": len(incidents),
        "critical_incidents_count": len(critical_incidents),
        "overall_posture": "ATTENTION_REQUIRED" if high_risk_devices else "HEALTHY",
        "summary": f"Pragyan platform monitored {len(devices)} active network devices. Identified {len(high_risk_devices)} high-risk hosts and {len(incidents)} correlated security incidents requiring analyst review."
    }
