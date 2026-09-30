from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.db import get_db
from app.schemas import ResponseActionOut, ResponseActionCreate
from app.services.response.action_executor import ResponseActionExecutor


router = APIRouter(prefix="/response", tags=["Response Engine"])

@router.get("/actions", response_model=List[ResponseActionOut])
async def list_actions(db: AsyncSession = Depends(get_db)):
    """List all defensive response actions executed."""
    return await ResponseActionExecutor.list_actions(db)

@router.post("/execute", response_model=ResponseActionOut)
async def execute_action(body: ResponseActionCreate, db: AsyncSession = Depends(get_db)):
    """Execute a defensive response action (isolate host, block IP, terminate session)."""
    try:
        return await ResponseActionExecutor.execute_action(
            db, body.action_type, body.target_ip, body.reason
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
