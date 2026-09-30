"""Pydantic v2 API schemas."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# --- Health ---
class HealthResponse(BaseModel):
    status: str
    db: str
    redis: str


# --- Services ---
class ServiceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    port: int
    protocol: str
    name: str | None = None
    product: str | None = None
    version: str | None = None
    state: str


# --- Devices ---
class DeviceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ip: str
    mac: str | None = None
    hostname: str | None = None
    os: str | None = None
    device_type: str | None = None
    status: str
    risk_score: int
    is_new: bool
    first_seen: datetime
    last_seen: datetime


class DeviceChangeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    device_id: int
    change_type: str
    title: str
    description: str | None = None
    old_value: str | None = None
    new_value: str | None = None
    timestamp: datetime


class DeviceDetailOut(DeviceOut):
    services: list[ServiceOut] = []
    changes: list[DeviceChangeOut] = []



# --- Scans ---
class ScanCreate(BaseModel):
    target_cidr: str = Field(..., examples=["192.168.1.0/24", "127.0.0.1/32"])


class ScanOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    target_cidr: str
    status: str
    hosts_found: int
    error: str | None = None
    log_output: str | None = None
    started_at: datetime
    finished_at: datetime | None = None


# --- Traffic ---
class ConnectionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    src_ip: str
    src_port: int
    dst_ip: str
    dst_port: int
    protocol: str
    service: str | None = None
    bytes_orig: int
    bytes_resp: int
    duration: float
    conn_state: str | None = None
    timestamp: datetime


class DNSOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    src_ip: str
    dst_ip: str
    query: str
    qtype: str
    rcode: str
    answers: str | None = None
    entropy: float
    timestamp: datetime


class TopTalkerOut(BaseModel):
    ip: str
    total_bytes: int
    connection_count: int


class TrafficSummaryOut(BaseModel):
    throughput_mbps: float
    total_bytes: int
    bytes_orig: int
    bytes_resp: int
    active_connections: int
    total_dns_queries: int
    protocol_breakdown: dict[str, int]
    top_talkers: list[TopTalkerOut]


# --- Alerts ---
class AlertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    alert_type: str
    title: str
    severity: str
    risk_score: int
    confidence: float
    source_ip: str | None = None
    destination_ip: str | None = None
    source_port: int | None = None
    destination_port: int | None = None
    protocol: str | None = None
    description: str
    evidence: str | None = None
    detection_rule: str
    status: str
    device_id: int | None = None
    timestamp: datetime


class AlertCreate(BaseModel):
    alert_type: str
    title: str
    severity: str = "MEDIUM"
    risk_score: int = 50
    confidence: float = 0.85
    source_ip: str | None = None
    destination_ip: str | None = None
    source_port: int | None = None
    destination_port: int | None = None
    protocol: str | None = None
    description: str
    evidence: str | None = None
    detection_rule: str = "custom-rule"


class AlertStatusUpdate(BaseModel):
    status: str  # NEW, ACKNOWLEDGED, INVESTIGATING, FALSE_POSITIVE, CONFIRMED, CLOSED


# --- Risk & ML ---
class RiskScoreBreakdownOut(BaseModel):
    composite_risk_score: int
    risk_tier: str
    rule_score: int
    ml_anomaly_score: float
    threat_intel_score: int
    asset_importance_score: int
    history_score: int
    active_alerts_count: int
    total_alerts_count: int


# --- Incidents ---
class IncidentOut(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: int
    incident_number: str
    title: str
    severity: str
    status: str
    target_host: str
    risk_score: int
    summary: str
    device_id: int | None = None
    created_at: datetime
    updated_at: datetime


class IncidentCreate(BaseModel):
    title: str
    severity: str = "HIGH"
    target_host: str
    risk_score: int = 75
    summary: str


class IncidentStatusUpdate(BaseModel):
    status: str  # OPEN, ACKNOWLEDGED, INVESTIGATING, CONTAINED, RESOLVED, CLOSED


# --- Response Actions ---
class ResponseActionCreate(BaseModel):
    action_type: str  # ISOLATE_HOST, BLOCK_IP, TERMINATE_SESSION, TRIGGER_DEEP_SCAN
    target_ip: str
    reason: str


class ResponseActionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    action_type: str
    target_ip: str
    reason: str
    status: str
    executed_at: datetime | None = None
    details: str | None = None


# --- Threat Intel IOCs ---
class ThreatIntelIOCCreate(BaseModel):
    ioc_type: str  # IP, DOMAIN, HASH
    value: str
    threat_category: str
    severity: str = "HIGH"
    source: str = "Manual"


class ThreatIntelIOCOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ioc_type: str
    value: str
    threat_category: str
    severity: str
    source: str
    active: bool
    created_at: datetime


# --- Auth & Users ---
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "ANALYST"  # ADMIN, ANALYST, VIEWER


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    role: str
    is_active: bool
    created_at: datetime


class LoginRequest(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# --- Audit Logs ---
class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int | None = None
    username: str
    action: str
    target: str | None = None
    details: str | None = None
    status: str
    timestamp: datetime






