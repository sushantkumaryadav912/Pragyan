from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.models import Device
from app.repositories import get_device_changes, list_recent_changes
from app.schemas import DeviceChangeOut, DeviceDetailOut, DeviceOut

router = APIRouter(tags=["devices"])


@router.get("/devices", response_model=list[DeviceOut])
async def list_devices(db: AsyncSession = Depends(get_db)) -> list[DeviceOut]:
    res = await db.execute(select(Device).order_by(Device.last_seen.desc()))
    return [DeviceOut.model_validate(d) for d in res.scalars().all()]


@router.get("/devices/changes", response_model=list[DeviceChangeOut])
async def list_all_device_changes(
    limit: int = 50, db: AsyncSession = Depends(get_db)
) -> list[DeviceChangeOut]:
    changes = await list_recent_changes(db, limit=limit)
    return [DeviceChangeOut.model_validate(c) for c in changes]


@router.get("/devices/{device_id}", response_model=DeviceDetailOut)
async def get_device(device_id: int, db: AsyncSession = Depends(get_db)) -> DeviceDetailOut:
    device = await db.get(Device, device_id)
    if device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    return DeviceDetailOut.model_validate(device)


@router.get("/devices/{device_id}/changes", response_model=list[DeviceChangeOut])
async def get_device_change_history(
    device_id: int, limit: int = 50, db: AsyncSession = Depends(get_db)
) -> list[DeviceChangeOut]:
    device = await db.get(Device, device_id)
    if device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    changes = await get_device_changes(db, device_id, limit=limit)
    return [DeviceChangeOut.model_validate(c) for c in changes]

