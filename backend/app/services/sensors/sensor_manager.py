from datetime import datetime
from typing import Dict, Any
import os
from app.core.config import settings

class SensorManager:
    """
    Monitors and tracks health status, throughput metrics, and file paths
    for real Zeek and Suricata sensor instances.
    """
    @staticmethod
    def get_sensors_status() -> Dict[str, Any]:
        zeek_exists = os.path.exists(settings.zeek_log_dir)
        suricata_exists = os.path.exists(settings.suricata_eve_path)

        zeek_logs = []
        if zeek_exists and os.path.isdir(settings.zeek_log_dir):
            try:
                zeek_logs = os.listdir(settings.zeek_log_dir)
            except Exception:
                pass

        return {
            "zeek": {
                "name": "Zeek Network Security Monitor",
                "status": "ONLINE" if zeek_exists else "OFFLINE",
                "log_dir": settings.zeek_log_dir,
                "active_logs": zeek_logs,
                "last_heartbeat": datetime.utcnow().isoformat()
            },
            "suricata": {
                "name": "Suricata NIDS Engine",
                "status": "ONLINE" if suricata_exists else "OFFLINE",
                "eve_path": settings.suricata_eve_path,
                "file_size_bytes": os.path.getsize(settings.suricata_eve_path) if suricata_exists else 0,
                "last_heartbeat": datetime.utcnow().isoformat()
            },
            "overall_status": "HEALTHY" if (zeek_exists or suricata_exists) else "DEGRADED_DEMO_MODE"
        }
