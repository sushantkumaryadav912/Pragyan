# Pragyan — Master Implementation Plan

> **Goal**: Complete full execution of the Pragyan Intelligent Network Security Monitoring, Detection & Response (NDR) Platform from Milestone 1 through Phase 16 production hardening.

---

## 🏗️ Architecture Overview

```
                               ┌───────────────────┐
                               │   Vite + React    │
                               │  Security Console │
                               └─────────┬─────────┘
                                         │
                                   REST / WebSockets
                                         │
                               ┌─────────▼─────────┐
                               │   FastAPI Engine  │
                               └─────────┬─────────┘
                                         │
       ┌───────────────────┬─────────────┴─────────────┬───────────────────┐
       ▼                   ▼                           ▼                   ▼
Discovery Service   Traffic Collector           Detection Engine     Response Engine
  (Nmap Engine)     (Zeek Telemetry)            (Rules + ML + IDS)   (Firewall/Block)
       │                   │                           │                   │
       ▼                   ▼                           ▼                   ▼
Asset Store        Event Storage Queue          Risk Correlation     Audit Logs
  (PostgreSQL)    (Redis + OpenSearch)             & Alerts
```

---

## 🗓️ Phased Execution Plan

### Phase 2 (Completion): Asset Intelligence & Change Detection History
- [ ] **Data Model Extension**: Add `DeviceChangeHistory` table tracking `device_id`, `change_type` (`NEW_PORT`, `CLOSED_PORT`, `SERVICE_CHANGE`, `STATUS_CHANGE`), `old_value`, `new_value`, `timestamp`.
- [ ] **Change Detection Engine**: Ingest scan results in [discovery/scanner.py](file:///home/sushant/Projects/Pragyan/backend/app/services/discovery/scanner.py), perform diff against previous state, log changes automatically.
- [ ] **APIs**: Implement `/api/v1/devices/{id}/changes` and `/api/v1/devices/changes` endpoints.
- [ ] **Frontend**: Build History Timeline tab in `DeviceDetail.tsx` and Asset Change notification badges on the Dashboard.

### Phase 3: Traffic Monitoring & Telemetry Engine
- [ ] **Zeek Log Collector**: Build background daemon service to ingest and parse Zeek logs (`conn.log`, `dns.log`, `http.log`, `ssl.log`).
- [ ] **Event Pipeline**: Push parsed network telemetry into Redis Streams / OpenSearch index.
- [ ] **Traffic APIs**: Implement `/api/v1/traffic/connections`, `/api/v1/traffic/dns`, `/api/v1/traffic/protocols`, `/api/v1/traffic/top-talkers`.
- [ ] **Traffic UI**: Build interactive dashboard widgets in `TrafficPage.tsx` using Recharts (bandwidth timeline, protocol breakdown, top talkers, DNS query logs).

### Phase 4: Rule-Based Detection Engine & WebSockets
- [ ] **Real-Time WebSocket Server**: Implement `/ws/events`, `/ws/alerts`, `/ws/traffic` using FastAPI WebSockets and Redis Pub/Sub broadcast manager.
- [ ] **Rule Engine**: Declarative YAML/JSON rule evaluator ([detection/rule_engine.py](file:///home/sushant/Projects/Pragyan/backend/app/services/detection/rule_engine.py)).
- [ ] **Core Detectors**:
  - `PORT_SCAN`: >30 unique ports hit within 60s.
  - `BRUTE_FORCE`: >20 authentication failures (SSH/RDP/FTP) in 5 minutes.
  - `HOST_RECON`: Probing multiple IP addresses sequentially.
  - `DNS_TUNNELING` / `DNS_ANOMALY`: High entropy or high frequency NXDOMAIN queries.
  - `TRAFFIC_SPIKE`: Sudden outbound volume surge.
  - `ROGUE_DEVICE`: Unrecognized MAC/IP on subnet.
- [ ] **Alert Pipeline**: Construct unified alert records, insert into PostgreSQL `alerts` table, and push real-time WebSocket alerts to frontend console.

### Phase 5: Suricata IDS Integration
- [ ] **Suricata Log Parser**: Read Suricata `eve.json` log stream.
- [ ] **Event Mapping**: Map signature-based IDS alerts to Pragyan's unified `Alert` domain model.
- [ ] **Alert Enrichment**: Cross-reference Suricata signatures with asset inventory to assign vulnerability/asset context.

### Phase 6 & 7: ML Anomaly Detection & Multi-Dimensional Risk Engine
- [ ] **Feature Engineering Engine**: Aggregate traffic window metrics (`bytes_in`, `bytes_out`, `unique_destinations`, `unique_ports`, `connection_duration`, `failed_connections`, `dns_frequency`).
- [ ] **Machine Learning Model**: Train scikit-learn `IsolationForest` model to detect statistical network anomalies and output an `anomaly_score` (0.0 to 1.0).
- [ ] **Composite Risk Engine**: Dynamic composite host score:
  $$\text{Risk Score} = w_1 \cdot \text{RuleScore} + w_2 \cdot \text{MLScore} + w_3 \cdot \text{ThreatIntel} + w_4 \cdot \text{AssetCriticality}$$
- [ ] **Risk Classification**: Classify assets into `Informational` (0-24), `Low` (25-49), `Medium` (50-74), `High` (75-89), `Critical` (90-100).

### Phase 8 & 9: Incident Correlation, Investigation & Network Topology
- [ ] **Incident Correlation Engine**: Group multiple alerts hitting the same target host or temporal window into unified Incidents (`#INC-1042`).
- [ ] **Alert & Incident Triage APIs**: Status transition workflows (`NEW` → `ACKNOWLEDGED` → `INVESTIGATING` → `FALSE_POSITIVE` / `CONFIRMED` → `CLOSED`).
- [ ] **Interactive Network Topology Graph**: Integrate React Flow or Canvas graph visualization showing hosts, routers, servers, active connections, and risk heatmaps.
- [ ] **Investigation Workbench**: Build interactive investigation timeline, evidence log viewer, and packet artifact drilldown.

### Phase 10 & 11: Response Engine & Threat Intelligence
- [ ] **Analyst Triage Actions**: Acknowledge, Suppress, Add to Watchlist, Allowlist.
- [ ] **Remediation Firewall Service**: Execute controlled IP block, port filter, or host quarantine commands via lab firewall / iptables API wrapper.
- [ ] **Threat Intelligence (IOC) Matcher**: Maintain IOC repository (IPs, domains, hashes) and match against flow logs.
- [ ] **Response Audit Logging**: Persist immutable log of all response actions in `action_logs` table.

### Phase 12, 13 & 14: Authentication, Audit Logging & Executive Reporting
- [ ] **Auth & RBAC**: JWT authentication with roles (`Admin`, `Analyst`, `Viewer`).
- [ ] **System Audit Logging**: Record user activities (logins, scans initiated, rule edits, response actions).
- [ ] **Executive PDF/HTML Reporting**: Generate downloadable SOC executive summaries and incident reports.

### Phase 15 & 16: Synthetic Traffic Simulator & Production Deployment
- [ ] **Synthetic Traffic Generator**: Python utility scripts (`port_scan.py`, `brute_force_sim.py`, `dns_anomaly.py`, `beacon_sim.py`) for lab testing.
- [ ] **Automated Detection Test Suite**: End-to-end integration tests validating detection rules and risk scoring.
- [ ] **Docker Compose Production Hardening**: Full compose setup containing Zeek, Suricata, OpenSearch, Redis, Postgres, FastAPI, and Vite production build.

---

## 🧪 Verification & Acceptance Criteria

1. **Asset Intelligence**: Port/Service change logged and visible on host timeline after successive scans.
2. **Telemetry & Traffic**: Real-time traffic throughput and protocol graphs render dynamically.
3. **Detection Engine**: Synthetic port scan or brute force test triggers a real-time WebSocket alert popup on the frontend within <2 seconds.
4. **Incidents**: Multiple related alerts against a single host automatically group into an Incident ticket.
5. **Topology**: Network graph updates node colors to red/orange dynamically when host risk score increases.
6. **Response**: Clicking "Block IP" logs an audit record and executes quarantine rule.
