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

