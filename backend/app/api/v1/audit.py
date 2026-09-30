from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.db import get_db
from app.core.dependencies import require_role
from app.schemas import AuditLogOut
from app.repositories.audit import list_audit_logs
from app.models.user import User

router = APIRouter(prefix="/audit", tags=["Audit Logs"])

@router.get("/logs", response_model=List[AuditLogOut])
async def get_audit_logs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "ANALYST"]))
):
    """List non-repudiable audit logs of sensitive system actions."""
    return await list_audit_logs(db, limit=100)
