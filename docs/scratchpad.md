# Pragyan Development Scratchpad

> **Purpose**: Dynamic scratchpad for tracking immediate step-by-step tasks, temporary notes, test outputs, and implementation state as we execute the Pragyan development plan.

---

## 📌 Active Development Focus
- **Current Milestone**: Milestone 1 → Milestone 2 Transition
- **Current Step**: Completing Phase 2 (Asset Intelligence Change Tracking) & Phase 3 (Telemetry & Traffic Pipeline)
- **Active Workspace**: `/home/sushant/Projects/Pragyan`

---

## 📝 Subtask Tracker

### Step 1: Change Tracking & Asset Intelligence (In Progress)
- [ ] Implement `DeviceChangeHistory` database model in `backend/app/models/device.py`
- [ ] Update `NmapScanner` / parser workflow to compare incoming scan results against existing stored host state
- [ ] Create `/api/v1/devices/{id}/changes` REST endpoint
- [ ] Create Change History timeline tab in `frontend/src/pages/DeviceDetail.tsx`

### Step 2: Traffic Telemetry Pipeline & Storage (Upcoming)
- [ ] Create Zeek log parser service in `backend/app/services/traffic/`
- [ ] Create telemetry event schemas for `Connection`, `DNS`, `HTTP`, `TLS`
- [ ] Create `/api/v1/traffic` endpoints for live flow monitoring
- [ ] Build Recharts visualization components in `frontend/src/pages/TrafficPage.tsx`

### Step 3: Detection Engine & Real-Time Alert Pipeline (Upcoming)
- [ ] Implement WebSocket manager (`backend/app/websocket/`)
- [ ] Implement Rule Engine & detectors (Port Scan, Brute Force, Reconnaissance)
- [ ] Implement `/api/v1/alerts` and live alert toast notifications in frontend

---

## 🧪 Quick Test Logs & Validation Scratch
* **Backend Health Check**: Verified `{"status": "ok", "db": "ok", "redis": "ok"}`
* **Scan Engine**: Verified `Nmap` scanner service executes background scans safely on private IP ranges.

---

## 💡 Key Design Notes & Decisions
1. **Database Schema**: Store `device_changes` with JSON payload for flexible before/after attribute diffs.
2. **WebSockets**: Use Redis Pub/Sub backend so FastAPI worker processes can seamlessly stream alert notifications to connected frontend clients.
3. **Lab Safety**: Enforce RFC 1918 subnet restriction in `allowlist.py` across all active discovery and scan tasks.
