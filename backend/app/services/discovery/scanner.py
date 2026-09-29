"""Run nmap as an async subprocess and return parsed hosts."""
from __future__ import annotations

import asyncio

from app.core.config import settings
from app.services.discovery.parser import ParsedHost, parse_nmap_xml


class ScanError(RuntimeError):
    pass


async def run_scan(target: str) -> list[ParsedHost]:
    """Run ``nmap <flags> -oX - <target>`` and parse the XML result.

    Raises ScanError if nmap is missing or exits non-zero with no usable output.
    """
    cmd = ["nmap", *settings.nmap_flag_list, "-oX", "-", target]
    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
    except FileNotFoundError as exc:
        raise ScanError("nmap executable not found on PATH") from exc

    stdout, stderr = await proc.communicate()
    xml_text = stdout.decode("utf-8", errors="replace")

    # nmap can exit non-zero while still emitting valid XML; prefer parsing.
    if not xml_text.strip():
        err = stderr.decode("utf-8", errors="replace").strip()
        raise ScanError(f"nmap produced no output (exit {proc.returncode}): {err}")

    return parse_nmap_xml(xml_text)
