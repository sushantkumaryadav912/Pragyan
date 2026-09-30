import asyncio
import os
import json
from typing import Callable, Awaitable, Optional
from app.services.ids.suricata_parser import parse_suricata_eve_alert
from app.core.config import settings


class SuricataLogTailer:
    def __init__(self, eve_path: Optional[str] = None):
        self.eve_path = eve_path or settings.suricata_eve_path
        self.running = False
        self.alert_count = 0

    async def tail_eve_json(self, alert_handler: Callable[[dict], Awaitable[None]]):
        if not os.path.exists(self.eve_path):
            return

        with open(self.eve_path, "r", encoding="utf-8", errors="ignore") as f:
            f.seek(0, os.SEEK_END)
            while self.running:
                line = f.readline()
                if not line or not line.strip():
                    await asyncio.sleep(0.5)
                    continue
                try:
                    payload = json.loads(line)
                    alert_obj = parse_suricata_eve_alert(payload)
                    if alert_obj:
                        await alert_handler(alert_obj)
                        self.alert_count += 1

                except Exception:
                    pass

    async def start(self, alert_callback):
        self.running = True
        await self.tail_eve_json(alert_callback)

    def stop(self):
        self.running = False
