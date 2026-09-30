from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.audit_log import AuditLog

async def log_audit_event(
    db: AsyncSession,
    username: str,
    action: str,
    target: Optional[str] = None,
    details: Optional[str] = None,
    user_id: Optional[int] = None,
    status: str = "SUCCESS"
) -> AuditLog:
    entry = AuditLog(
        user_id=user_id,
        username=username,
        action=action,
        target=target,
        details=details,
        status=status
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry

async def list_audit_logs(db: AsyncSession, limit: int = 100) -> List[AuditLog]:
    result = await db.execute(select(AuditLog).order_by(AuditLog.id.desc()).limit(limit))
    return list(result.scalars().all())
