import asyncio
import os
from typing import Optional, Callable, Awaitable
from app.services.traffic.zeek_parser import parse_zeek_conn_line, parse_zeek_dns_line
from app.core.config import settings



class ZeekLogTailer:
    def __init__(self, log_dir: Optional[str] = None):
        self.log_dir = log_dir or settings.zeek_log_dir
        self.running = False
        self.processed_count = 0

    async def tail_file(self, filename: str, line_handler: Callable[[str], Awaitable[None]]):
        filepath = os.path.join(self.log_dir, filename)
        if not os.path.exists(filepath):
            return

        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            # Seek to end for live tailing
            f.seek(0, os.SEEK_END)
            while self.running:
                line = f.readline()
                if not line:
                    await asyncio.sleep(0.5)
                    continue
                if line.startswith("#"):
                    continue
                try:
                    await line_handler(line)
                    self.processed_count += 1
                except Exception:
                    pass

    async def start(self, conn_callback=None, dns_callback=None):
        self.running = True
        tasks = []
        if conn_callback:
            tasks.append(asyncio.create_task(self.tail_file("conn.log", conn_callback)))
        if dns_callback:
            tasks.append(asyncio.create_task(self.tail_file("dns.log", dns_callback)))
        
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

    def stop(self):
        self.running = False
