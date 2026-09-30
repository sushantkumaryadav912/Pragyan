# Pragyan NDR — Comprehensive Production Implementation Plan

> **Product Vision**: **Pragyan** is an Intelligent Network Security Monitoring, Detection & Response (NDR) platform designed for continuous asset discovery, real-time threat detection, automated incident correlation, and defensive response.
> **Current Platform Status**: Core Functionality Implemented (Phases 1–14). Expanding to Production-Grade Sensor Pipelines, Auth/RBAC, OpenSearch Storage, Response Safeguards, E2E Testing & Security Lab Validation (Phases 15–34).

---

## 🏗️ Production Architecture Diagram

```
                                      ┌─────────────────────────────────┐
                                      │   React 19 + Tailwind v4 UI     │
                                      │ (Dashboard, Topology, Triage)   │
                                      └────────────────┬────────────────┘
                                                       │
                                            JWT Auth / WebSockets
                                                       │
                                      ┌────────────────▼────────────────┐
                                      │  FastAPI Control-Plane Engine   │
                                      │  (Auth, RBAC, Audit, REST API)  │
                                      └────────────────┬────────────────┘
                                                       │
         ┌───────────────────────────┬─────────────────┴─────────────────┬───────────────────────────┐
         ▼                           ▼                                   ▼                           ▼
  Discovery Service          Sensor Ingestion                     Detection Engine             Response Engine
  (Nmap Subnet Scan)       (Zeek & Suricata Tail)               (Rules + ML + Correlation)   (Policy Safeguarded Firewall)
         │                           │                                   │                           │
         ▼                           ▼                                   ▼                           ▼
   Asset Inventory            Hot Event Queue                     Incident & Alert             Audit Logging System
(PostgreSQL Asset Store)      (Redis Streams)                    (PostgreSQL / Redis)           (Structured Audit Store)
                                     │                                   │
                                     └─────────────────┬─────────────────┘
                                                       ▼
                                             OpenSearch Event Index
                                          (Connection, DNS, HTTP Logs)
```

---

## 🗓️ Comprehensive Phased Roadmap

### Phase 1: Core Foundation Verification ✅ (Status: Verified)
- [x] **FastAPI Application Structure**: Router modularization (`/api/v1`).
- [x] **Database & Models**: Async SQLAlchemy 2.0 ORM with SQLite (dev) / PostgreSQL (prod).
- [x] **Nmap Discovery Service**: Async execution, host & port extraction.
- [x] **Scan Lifecycle & Error Handling**: Background task execution, state transition handling.
- [x] **Frontend Shell**: Dark operations-mode visual layout, responsive sidebar, breadcrumbs, command palette.

---

### Phase 2 – 14: Core Functionality Implemented ✅ (Status: Implemented)
- [x] **Phase 2 (Asset Intelligence)**: `DeviceChange` diff engine & timeline UI.
- [x] **Phase 3 (Traffic Telemetry)**: Zeek parser (`conn.log`, `dns.log` Shannon entropy) & Recharts dashboard.
- [x] **Phase 4 (Rule Detection)**: Rule engine (`PORT_SCAN`, `BRUTE_FORCE`, `DNS_ANOMALY`, `ROGUE_DEVICE`) & WebSocket stream manager.
- [x] **Phase 5 (Suricata NIDS)**: EVE JSON alert parser & ingestion endpoint.
- [x] **Phase 6 & 7 (ML Anomaly & Risk Engine)**: 8-D feature extractor, scikit-learn `IsolationForest`, composite risk engine (0–100 score).
- [x] **Phase 8 & 9 (Incidents & Topology)**: Incident correlation engine (`INC-1042`), Triage Workbench, interactive SVG topology map.
- [x] **Phase 10 – 14 (Response & Threat Intel)**: Defensive action executor (host isolation, IP block), Threat Intel IOC catalog, executive report summary API.

---

### Phase 15: Production Authentication, RBAC & Audit Logging ⏳ (Next Immediate Phase)
#### 15.1 Authentication (JWT & Session Management)
- [ ] **User Model**: Table `users` (`id`, `username`, `email`, `hashed_password`, `role`, `is_active`, `created_at`).
- [ ] **Security Utilities**: Password hashing with Passlib/Bcrypt; JWT access/refresh token issue & verification.
- [ ] **Auth Endpoints**: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`.
- [ ] **Protected Routes**: FastAPI `Depends(get_current_user)` middleware.

#### 15.2 Role-Based Access Control (RBAC)
- [ ] **Roles**:
  - `ADMIN`: Full access (system configuration, user management, response action execution, rule authoring).
  - `ANALYST`: Incident investigation, alert triage, executing pre-approved response actions.
  - `VIEWER`: Read-only access to dashboards, topology, and reports.
- [ ] **Role Enforcer**: FastAPI dependency `require_role(["ADMIN", "ANALYST"])`.

#### 15.3 Audit Logging
- [ ] **Audit Model**: Table `audit_logs` (`id`, `user_id`, `username`, `action`, `target`, `details`, `status`, `timestamp`).
- [ ] **Audit Decorator/Middleware**: Intercept sensitive endpoints (`BLOCK_IP`, `ISOLATE_HOST`, `CREATE_RULE`, `SCAN_START`) to write non-repudiable audit logs.

---

### Phase 16: Real Sensor Pipeline (Zeek & Suricata Tail Daemons)
- [ ] **Zeek File Tailer Daemon**: Async file-system watcher (or `tail -f` / `watchdog`) parsing live `/var/log/zeek/current/{conn.log,dns.log,http.log,ssl.log}`.
- [ ] **Suricata EVE Log Listener**: Continuous reader of `/var/log/suricata/eve.json` feeding live signature alerts directly into the Pragyan detection pipeline.
- [ ] **Sensor Health Monitor**: Track heartbeats and log lines/sec per sensor node; trigger `SENSOR_DOWN` alert if feed pauses.

---

### Phase 17: Production Event Pipeline (Redis Streams + OpenSearch)
- [ ] **Hot Event Queue (Redis Streams)**: Buffer incoming high-frequency network events in Redis streams to prevent DB backpressure.
- [ ] **OpenSearch Indexing Pipeline**: Asynchronous worker pushing high-volume connection, DNS, and HTTP events to OpenSearch (`pragyan-events-YYYY.MM.DD`).
- [ ] **PostgreSQL Dual Storage**: Store durable domain entities (devices, alerts, incidents, rules, audit logs, users) in PostgreSQL.

---

### Phase 18: Detection Engine Hardening & Structured Evidence
- [ ] **Detector Architecture Standard**: Ensure every detector conforms to a strict contract:
  - Input Schema & Feature Extraction
  - Configurable threshold values (e.g. `unique_ports > 30`, `time_window = 60s`)
  - Normalized confidence score (0.0 to 1.0)
  - Rich structured JSON evidence (e.g. `{"scanned_ports": [...], "frequency_hz": 12.4}`)
- [ ] **Detector Unit & Integration Test Suite**: Dedicated test cases per detection rule.

---

### Phase 19: ML Model Lifecycle, Training & Versioning
- [ ] **Model Artifact Store**: Directory structure `backend/app/models/ml_registry/isolation_forest/v1/`:
  - `model.pkl` (Trained Scikit-learn IsolationForest)
  - `scaler.pkl` (StandardScaler / MinMaxScaler)
  - `metadata.json` (`version`, `trained_at`, `feature_count`, `training_sample_count`)
- [ ] **Training Pipeline**: CLI / API command `python -m app.services.ml.trainer` to fit baseline network telemetry.
- [ ] **Graceful Fallback**: Default to baseline heuristic scores if ML pickle is uninitialized or missing.

---

### Phase 20: Risk Engine Calibration & Scenarios
- [ ] **Configurable Scoring Weights**: Externalize risk coefficients in `app/core/config.py`.
- [ ] **Non-Linear Stacking Protection**: Dampen multiple correlated signals on the same host to prevent artificial risk inflation.
- [ ] **Validation Test Suite**:
  - Normal Workstation: Expected Risk 5–20
  - Active Port Scanner: Expected Risk 50–75
  - Compromised C2 Host: Expected Risk 80–100

---

### Phase 21: Threat Intelligence Feed Integration
- [ ] **Feed Normalizer**: Ingest external threat feeds (e.g. AbuseIPDB, AlienVault OTX, Cybercrime tracker) into `ThreatIntelIOC` table.
- [ ] **Indicator Enrichment**: Add fields `first_seen`, `last_seen`, `expiration_date`, `confidence_score`, `tags`.
- [ ] **Real-time Traffic Matcher**: Automatic lookup for every new outbound IP / DNS query against the active IOC catalog.

---

### Phase 22: Response Engine Safeguards & Policy Check
- [ ] **Safeguard Pipeline**:
  `API Request -> Authentication -> RBAC Check -> Policy Check -> Analyst Confirmation -> Execution -> Target Adapter -> Audit Record`
- [ ] **Policy Rules**: Prevent accidental isolation of critical infrastructure (e.g., Subnet Gateway `192.168.1.1` or Domain Controller).
- [ ] **Dry-Run Mode**: Option to simulate firewall rule generation prior to execution.

---

### Phase 23: Enhanced Network Topology & Interactive Filters
- [ ] **Subnet Grouping**: Visual bounding boxes grouping devices by subnet (`192.168.1.0/24`, `10.0.0.0/24`).
- [ ] **Dynamic Node Filtering & Search**: Filter map nodes by risk tier, device type, or IP string match.
- [ ] **Protocol Link Matrix**: Highlight traffic direction and bandwidth volume on connected edges.

---

### Phase 24: Unified Investigation Search Console
- [ ] **Global Search Bar (⌘K)**: Multi-entity search across Devices, Alerts, Incidents, Connection Logs, DNS Queries, and Audit Logs.
- [ ] **Search API**: Endpoint `GET /api/v1/search?q={query}` returning structured grouped results.

---

### Phase 25: SOC Workflow Dashboard Consolidation
- [ ] **Unified Operational Layout**: Connect live network traffic charts, critical alert triage, top risky hosts, active incidents, and quick scan launcher into a single coherent SOC dashboard layout.

---

### Phase 26 & 27: Frontend Quality, Testing & E2E Workflows
- [ ] **Vitest & React Testing Library**: Component tests for Dashboard, DeviceDetail, AlertsPage, IncidentsPage, TopologyPage, and ResponsePage.
- [ ] **WebSocket Reconnection Handling**: Auto-reconnect exponential backoff for live alert stream.
- [ ] **Playwright E2E Test**: Full flow automation:
  `Login -> Dashboard -> Trigger Scan -> View New Asset -> Inspect Risk Radar -> Triage Correlated Incident -> Execute Containment Action`

---

### Phase 28 & 29: Observability, Metrics & Graceful Fallbacks
- [ ] **Structured Logging**: JSON log format with correlation ID tracking.
- [ ] **Prometheus Metrics**: Expose `/metrics` tracking event rate, detection latency, scan durations, active WS clients.
- [ ] **Graceful Degradation**: Banner indicators when sensor feeds (Zeek/Suricata) or backend sub-components are offline.

---

### Phase 30 & 31: Dockerization & CI/CD Pipeline
- [ ] **Containerization**:
  - `docker-compose.dev.yml` (FastAPI, React Vite, PostgreSQL, Redis, Zeek container, Suricata container)
  - `docker-compose.prod.yml` (Production build, Nginx reverse proxy, OpenSearch stack)
- [ ] **GitHub Actions Workflow**: Linting, unit tests, frontend build, container image verification.

---

### Phase 32: Production Security Hardening
- [ ] **API Security**: Rate limiting (SlowAPI), strict CORS, OWASP security headers, request payload validation.
- [ ] **DB & Secret Security**: Environment variable isolation (`.env`), parameterization, non-root database execution.

---

### Phase 33: Documentation & Portfolio Standard
- [ ] **Docs Directory**:
  - `docs/architecture.md`, `docs/installation.md`, `docs/api.md`, `docs/detection-engine.md`, `docs/response-engine.md`, `docs/security-lab.md`
- [ ] **Repository README**: Architecture diagram, screenshot gallery, tech stack overview, rapid start guide.

---

### Phase 34: Authorized Security Lab End-to-End Validation
- [ ] **Lab Environment Setup**: Multi-container / VM test environment (Ubuntu Attacker, Pragyan Server, Target Web Server, Windows VM).
- [ ] **Controlled Attack Scenarios**:
  - Subnet Reconnaissance (Nmap port sweep)
  - Authentication Attack (SSH brute force)
  - Command & Control Exfiltration (High-entropy DNS TXT queries)
- [ ] **Validation Verification**: Verify full telemetry pipeline:
  `Traffic -> Zeek/Suricata -> Sensor Collector -> Pragyan Rule & ML Engine -> Composite Risk Engine -> Correlated Incident INC-1042 -> Firewall Containment Action -> Non-repudiable Audit Log`
