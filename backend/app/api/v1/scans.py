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
from app.services.discovery.scanner import ScanError, run_scan

router = APIRouter(tags=["scans"])


async def _run_scan_job(scan_id: int, target: str) -> None:
    """Background worker: run nmap, persist devices, update scan status.

    Uses its own DB session since the request-scoped session is already closed.
    """
    async with SessionLocal() as db:
        await set_scan_status(db, scan_id, "running")
        try:
            hosts = await run_scan(target)
            count = await upsert_hosts(db, hosts)
            await set_scan_status(
                db, scan_id, "completed", hosts_found=count, finished=True
            )
        except (ScanError, Exception) as exc:  # noqa: BLE001 - record any failure
            await set_scan_status(
                db, scan_id, "failed", error=str(exc), finished=True
            )


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
    # Launch the scan as a detached task so the request returns immediately.
    import asyncio

    asyncio.create_task(_run_scan_job(scan.id, target))
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
