# 🛡️ Pragyan NDR — Intelligent Network Detection & Response Platform

![Pragyan Banner](frontend/public/Pragyan_Logo.png)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB.svg?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.0-4169E1.svg?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%26%20Auth-FFCA28.svg?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

**Pragyan** is an enterprise-grade, high-performance **Network Detection & Response (NDR)** platform designed for modern Security Operations Centers (SOC). It provides autonomous host asset discovery, real-time telemetry observation, rule-based threat detection, correlated incident management, and automated defensive active response across authorized subnets.

> ⚠️ **Authorization Disclaimer**: Only scan networks you are explicitly authorized to assess. Pragyan enforces strict RFC1918 private CIDR subnet allowlisting in code (`SCAN_ALLOWLIST`), but legal authorization remains the operator's responsibility.

---

## 🏗️ System Architecture

```
                  ┌─────────────────────────────────────────────────────────┐
                  │              Pragyan Operations Console                 │
                  │             (React 19 + Vite + Tailwind)                │
                  └────────────┬──────────────────────────────┬─────────────┘
                               │                              │
                    REST API & │                              │ Real-Time
                     WebSockets│                              │ Firestore Sync
                               ▼                              ▼
                  ┌─────────────────────────┐     ┌─────────────────────────┐
                  │  FastAPI Control Plane  │     │   Google Cloud          │
                  │  (Python 3.13 Async)    │     │   Firestore Database    │
                  └────┬───────┬───────┬────┘     └─────────────────────────┘
                       │       │       │
      ┌────────────────┘       │       └────────────────┐
      ▼                        ▼                        ▼
┌───────────┐            ┌───────────┐            ┌───────────┐
│ PostgreSQL│            │   Redis   │            │ Nmap Engine│
│ Database  │            │ Event Bus │            │ Subprocess│
└───────────┘            └───────────┘            └───────────┘
```

---

## 🌟 Key Platform Modules & Capabilities

### 1. 📊 Security Operations Console (Dashboard)
- Executive summary of discovered subnet assets, online hosts, high-risk assets, and active scans.
- Interactive protocol service distribution pie charts and composite risk severity bar charts.
- Subnet threat telemetry feed rendering live security detection alerts.

### 2. 💻 Asset Inventory & Change Detection
- Deep inspection of host IP addresses, MAC vendor fingerprints, hostnames, and operating systems.
- Granular tracking of open/closed ports and service version upgrades over time.
- Automated `is_new` flagging for newly observed network devices.

### 3. 🎯 Network Asset Discovery Scanner
- Authorized Nmap subnet discovery agent with target CIDR validation against RFC1918 allowlists.
- Fast parallel scanning (`-F -n --max-parallelism 100 --host-timeout 5s`).
- Live terminal log streaming into the console with asynchronous job cancellation support.

### 4. 🚨 Security Alerts & Triage Workbench
- Real-time rule-based detection stream with WebSocket live alert broadcasting.
- Categorization by risk severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and alert type.
- Triage lifecycle state management (`NEW`, `ACKNOWLEDGED`, `INVESTIGATING`, `CLOSED`).

### 5. 📑 Correlated Incident Workbench
- Automatic correlation of unclosed security alerts into unified incident tickets.
- Risk score calculation and primary target host assignment.
- Incident lifecycle management (`OPEN`, `INVESTIGATING`, `RESOLVED`, `CLOSED`).

### 6. ⚡ Active Response & Remediation Engine
- Automated defensive action execution: Host Isolation, IP Null-Routing, and Session Termination.
- Direct alignment with firewalls and system security controls safely managed via software.

### 7. 🎯 Active Threat Intelligence (IOCs)
- Indicators of Compromise (IOC) registry for malicious IPs, domains, and malware file hashes.
- Automated matching against active network connection flows and DNS query telemetry.

### 8. 🌐 Traffic Telemetry & Flow Logs
- High-throughput bandwidth measurement, byte counts, and top talkers.
- Network flow logs and DNS query inspection powered by Zeek and Suricata NIDS telemetry.

### 9. 🕸️ Interactive Topology Graph
- Dynamic SVG graph visualization mapping internal subnet relationships, gateway routers, and connected host nodes.
- Color-coded risk indicators and node inspection drawers.

### 10. 🔒 Compliance Audit Trail
- Non-repudiable audit logs recorded for every sensitive operator action (scans, alert triage, incident updates, response actions, and IOC creation).

---

## 🚀 Quick Start Guide

### Prerequisites
- **Docker & Docker Compose** (for PostgreSQL & Redis containers)
- **Python 3.11+** (Python 3.13 recommended)
- **Node.js 18+** and **npm**
- **Nmap** binary installed on system PATH (`sudo dnf install nmap` / `sudo apt install nmap`)

---

### 1. Clone & Configure Environment

```bash
git clone https://github.com/sushantkumaryadav912/Pragyan.git
cd Pragyan
cp .env.example .env
```

Review `.env` settings:
```env
NMAP_FLAGS=-F -n --max-parallelism 100 --host-timeout 5s
SCAN_ALLOWLIST=192.168.0.0/16,10.0.0.0/8,172.16.0.0/12,127.0.0.0/8
DATABASE_URL=postgresql+asyncpg://pragyan:pragyan_dev_pw@localhost:55432/pragyan
REDIS_URL=redis://localhost:6381/0
```

---

### 2. Start Infrastructure Containers

```bash
docker compose up -d
```
*Launches PostgreSQL on port `55432` and Redis on port `6381`.*

---

### 3. Start Backend Control Plane

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- **REST API Base**: `http://localhost:8000/api/v1`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Health Check**: `curl http://localhost:8000/api/v1/health`

---

### 4. Start Frontend Console

```bash
cd frontend
npm install
npm run dev
```
- Open **`http://localhost:5173`** in your browser.

---

## 🔑 Authentication & Demo Access

- **Official Demo Mode Credentials**:
  - **Email**: `admin@pragyan.internal` (or username `admin`)
  - **Password**: `admin123`
  - *Runs in local demo state.*

- **Live Real-Time Operational Access**:
  - Sign up via the **Signup Page** with your full name, organization, SOC role, email, and password.
  - Authenticates via Firebase Auth and syncs live data with PostgreSQL & Cloud Firestore.

---

## 🧪 Testing & Verification

### Run Backend Pytest Suite
```bash
cd backend
source .venv/bin/activate
pytest
```

### Build Production Frontend Bundle
```bash
cd frontend
npm run build
```

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.
