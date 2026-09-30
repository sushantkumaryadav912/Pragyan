"""Traffic and network telemetry models (Connection, DNS, HTTP events)."""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base


class ConnectionEvent(Base):
    __tablename__ = "connection_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    src_ip: Mapped[str] = mapped_column(String(45), index=True, nullable=False)
    src_port: Mapped[int] = mapped_column(Integer, nullable=False)
    dst_ip: Mapped[str] = mapped_column(String(45), index=True, nullable=False)
    dst_port: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
    protocol: Mapped[str] = mapped_column(String(16), default="tcp", nullable=False)
    service: Mapped[str | None] = mapped_column(String(32), nullable=True)
    bytes_orig: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    bytes_resp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    duration: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    conn_state: Mapped[str | None] = mapped_column(String(16), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )


class DNSEvent(Base):
    __tablename__ = "dns_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    src_ip: Mapped[str] = mapped_column(String(45), index=True, nullable=False)
    dst_ip: Mapped[str] = mapped_column(String(45), nullable=False)
    query: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    qtype: Mapped[str] = mapped_column(String(16), default="A", nullable=False)
    rcode: Mapped[str] = mapped_column(String(16), default="NOERROR", nullable=False)
    answers: Mapped[str | None] = mapped_column(String(512), nullable=True)
    entropy: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )


class HTTPEvent(Base):
    __tablename__ = "http_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    src_ip: Mapped[str] = mapped_column(String(45), index=True, nullable=False)
    dst_ip: Mapped[str] = mapped_column(String(45), nullable=False)
    method: Mapped[str] = mapped_column(String(16), default="GET", nullable=False)
    host: Mapped[str | None] = mapped_column(String(255), nullable=True)
    uri: Mapped[str | None] = mapped_column(String(512), nullable=True)
    status_code: Mapped[int | None] = mapped_column(Integer, nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(255), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )
