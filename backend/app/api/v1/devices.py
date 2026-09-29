from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.models import Device
from app.schemas import DeviceDetailOut, DeviceOut

router = APIRouter(tags=["devices"])


@router.get("/devices", response_model=list[DeviceOut])
async def list_devices(db: AsyncSession = Depends(get_db)) -> list[DeviceOut]:
    res = await db.execute(select(Device).order_by(Device.last_seen.desc()))
    return [DeviceOut.model_validate(d) for d in res.scalars().all()]


@router.get("/devices/{device_id}", response_model=DeviceDetailOut)
async def get_device(device_id: int, db: AsyncSession = Depends(get_db)) -> DeviceDetailOut:
    device = await db.get(Device, device_id)
    if device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    return DeviceDetailOut.model_validate(device)
