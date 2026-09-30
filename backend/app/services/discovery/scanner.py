"""Run nmap as an async subprocess and return parsed hosts with live terminal output logging."""
from __future__ import annotations

import asyncio
from typing import Callable, Awaitable
from app.core.config import settings
from app.services.discovery.parser import ParsedHost, parse_nmap_xml


class ScanError(RuntimeError):
    pass


async def run_scan(
    target: str, 
    on_log: Callable[[str], Awaitable[None]] | None = None
) -> list[ParsedHost]:
    """Run ``nmap <flags> -oX - <target>`` and parse the XML result.

    Raises ScanError if nmap is missing or exits non-zero with no usable output.
    """
    cmd = ["nmap", *settings.nmap_flag_list, "-oX", "-", target]
    
    if on_log:
        await on_log(f"Executing: {' '.join(cmd)}")
    
    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
    except FileNotFoundError as exc:
        raise ScanError("nmap executable not found on PATH") from exc

    try:
        stdout, stderr = await proc.communicate()
    except asyncio.CancelledError:
        try:
            proc.kill()
        except Exception:
            pass
        raise

    xml_text = stdout.decode("utf-8", errors="replace")

    if not xml_text.strip():
        err = stderr.decode("utf-8", errors="replace").strip()
        raise ScanError(f"nmap produced no output (exit {proc.returncode}): {err}")

    hosts = parse_nmap_xml(xml_text)
    
    if on_log:
        await on_log(f"Nmap raw sweep finished. Parsing XML result stream...")
        for host in hosts:
            if host.status == "up":
                await on_log(f"Discovered active host: {host.ip} | Hostname: {host.hostname or 'N/A'} | OS: {host.os or 'Generic Linux/Unix'}")
                for s in host.services:
                    await on_log(f"  └─ Port {s.port}/{s.protocol} [{s.state}] : {s.name or 'unknown'} {s.product or ''} {s.version or ''}")

    return hosts
