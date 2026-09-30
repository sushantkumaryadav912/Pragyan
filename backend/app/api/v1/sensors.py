from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.services.sensors.sensor_manager import SensorManager

router = APIRouter(prefix="/sensors", tags=["Sensors & Telemetry"])

@router.get("/status")
async def get_sensors_status() -> Dict[str, Any]:
    """Get live operational health status of Zeek & Suricata network sensors."""
    return SensorManager.get_sensors_status()
