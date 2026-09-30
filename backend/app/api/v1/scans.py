import asyncio
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import SessionLocal, get_db
from app.repositories import (
    create_scan,
    get_scan,
    list_scans,
    set_scan_status,
    upsert_hosts,
)
from app.schemas import ScanCreate, ScanOut
from app.services.discovery.allowlist import TargetNotAllowed, validate_target
from app.services.discovery.scanner import run_scan

router = APIRouter(tags=["scans"])

# Active scan tasks mapped by scan_id
_scan_tasks: dict[int, asyncio.Task] = {}


async def _run_scan_job(scan_id: int, target: str) -> None:
    """Background worker: run nmap, persist devices, update scan status.

    Uses its own DB session since the request-scoped session is already closed.
    """
    async with SessionLocal() as db:
        log_lines: list[str] = [
            f"[{datetime.now().strftime('%I:%M:%S %p')}] Initializing Pragyan Nmap Discovery Agent...",
            f"[{datetime.now().strftime('%I:%M:%S %p')}] Target CIDR validated: {target}",
            f"[{datetime.now().strftime('%I:%M:%S %p')}] Launching Nmap engine scan process..."
        ]
        
        await set_scan_status(db, scan_id, "running", log_output="\n".join(log_lines))

        async def handle_log(msg: str):
            log_lines.append(f"[{datetime.now().strftime('%I:%M:%S %p')}] {msg}")
            await set_scan_status(db, scan_id, "running", log_output="\n".join(log_lines))

        try:
            hosts = await run_scan(target, on_log=handle_log)
            count = await upsert_hosts(db, hosts)
            log_lines.append(f"[{datetime.now().strftime('%I:%M:%S %p')}] Scan completed successfully. Discovered {count} active host(s).")
            await set_scan_status(
                db, scan_id, "completed", hosts_found=count, log_output="\n".join(log_lines), finished=True
            )
        except asyncio.CancelledError:
            log_lines.append(f"[{datetime.now().strftime('%I:%M:%S %p')}] [CANCELLED] Scan cancelled by user.")
            await set_scan_status(
                db, scan_id, "failed", error="Scan cancelled by user", log_output="\n".join(log_lines), finished=True
            )
        except Exception as exc:  # noqa: BLE001 - record any failure on the scan row
            log_lines.append(f"[{datetime.now().strftime('%I:%M:%S %p')}] [ERROR] Scan failed: {exc}")
            await set_scan_status(
                db, scan_id, "failed", error=str(exc), log_output="\n".join(log_lines), finished=True
            )
        finally:
            _scan_tasks.pop(scan_id, None)


@router.post("/networks/scan", response_model=ScanOut, status_code=202)
async def start_scan(
    body: ScanCreate,
    db: AsyncSession = Depends(get_db),
) -> ScanOut:
    try:
        target = validate_target(body.target_cidr)
    except TargetNotAllowed as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    scan = await create_scan(db, target)
    from app.repositories.audit import log_audit_event
    await log_audit_event(
        db,
        username="admin",
        action="START_SCAN",
        target=target,
        details=f"Dispatched Nmap network discovery scan for CIDR {target}",
        status="SUCCESS"
    )

    # Launch the scan as a tracked detached task
    task = asyncio.create_task(_run_scan_job(scan.id, target))
    _scan_tasks[scan.id] = task
    return ScanOut.model_validate(scan)


@router.post("/scans/{scan_id}/cancel", response_model=ScanOut)
async def cancel_scan(
    scan_id: int,
    db: AsyncSession = Depends(get_db),
) -> ScanOut:
    task = _scan_tasks.pop(scan_id, None)
    if task and not task.done():
        task.cancel()

    await set_scan_status(db, scan_id, "failed", error="Scan cancelled by user", finished=True)
    scan = await get_scan(db, scan_id)
    if scan is None:
        raise HTTPException(status_code=404, detail="Scan not found")

    from app.repositories.audit import log_audit_event
    await log_audit_event(
        db,
        username="admin",
        action="CANCEL_SCAN",
        target=f"Scan #{scan_id}",
        details=f"Network scan process #{scan_id} cancelled by user",
        status="SUCCESS"
    )

    return ScanOut.model_validate(scan)


@router.get("/scans", response_model=list[ScanOut])
async def get_scans(db: AsyncSession = Depends(get_db)) -> list[ScanOut]:
    return [ScanOut.model_validate(s) for s in await list_scans(db)]


@router.get("/scans/{scan_id}", response_model=ScanOut)
async def get_scan_by_id(scan_id: int, db: AsyncSession = Depends(get_db)) -> ScanOut:
    scan = await get_scan(db, scan_id)
    if scan is None:
        raise HTTPException(status_code=404, detail="Scan not found")
    return ScanOut.model_validate(scan)
