# Pragyan

**Intelligent Network Detection & Response (NDR) platform.**

Pragyan discovers assets, observes network behavior, and (in later phases) detects,
correlates, and responds to threats. This repository is at **Milestone 1**: a running
foundation plus authorized Nmap-based network discovery and a device inventory dashboard.

> ⚠️ **Only scan networks you are authorized to scan.** Pragyan enforces a private-network
> allowlist in code and rejects public targets, but authorization is your responsibility.

## Architecture (current)

```
React (Vite) ──REST──> FastAPI ──> Postgres
                          │           ↑
                          └── nmap ────┘   (discovery)
                          └── Redis        (health now; detection windows later)
```

## Prerequisites

- Docker + Docker Compose (Postgres + Redis)
- Python 3.11+
- Node 18+ and `pnpm`
- `nmap` on the host PATH

## Setup

### 1. Infrastructure (Postgres + Redis)

```bash
cp .env.example .env
docker compose up -d
```

### 2. Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

- API: http://localhost:8000  ·  Docs: http://localhost:8000/docs
- Health check:

```bash
curl http://localhost:8000/api/v1/health
```

Expected: `{"status":"ok","db":"ok","redis":"ok"}`

### 3. Frontend

```bash
cd frontend
cp .env.example .env
pnpm install
pnpm dev
```

Open http://localhost:5173.

## Using it

1. Click **Start Scan** on the Dashboard or Devices page.
2. Enter an authorized target (default `127.0.0.1/32`; e.g. `192.168.1.0/24` for a LAN).
3. The scan runs in the background; discovered hosts appear under **Devices** with their
   open ports and services. New IPs are flagged `NEW`.

## Nmap privileges

`-sV` (the default) works unprivileged via a TCP connect scan. OS detection (`-O`) and
SYN scans (`-sS`) require root — either run uvicorn with `sudo`, or grant the capability:

```bash
sudo setcap cap_net_raw,cap_net_admin,cap_net_bind_service+eip $(which nmap)
```

Scan flags are configurable via `NMAP_FLAGS` in `.env`.

## Tests

```bash
cd backend && source .venv/bin/activate
pytest
```

## Roadmap

Milestone 1 (this): foundation + discovery + inventory. Next: change history, Zeek
traffic monitoring, rule-based detection + WebSockets, Suricata, ML anomaly scoring,
risk engine, incidents/investigation, topology, response, reporting, RBAC. Schema and
layout leave room for these; migrations move to Alembic when the schema starts evolving.
