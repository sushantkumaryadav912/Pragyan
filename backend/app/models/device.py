"""Device model — a discovered network asset."""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


class Device(Base):
    __tablename__ = "devices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ip: Mapped[str] = mapped_column(String(45), unique=True, index=True, nullable=False)
    mac: Mapped[str | None] = mapped_column(String(32), nullable=True)
    hostname: Mapped[str | None] = mapped_column(String(255), nullable=True)
    os: Mapped[str | None] = mapped_column(String(255), nullable=True)
    device_type: Mapped[str | None] = mapped_column(String(64), nullable=True)
    status: Mapped[str] = mapped_column(String(16), default="up", nullable=False)
    risk_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_new: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    first_seen: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    last_seen: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    services: Mapped[list["Service"]] = relationship(  # noqa: F821
        back_populates="device", cascade="all, delete-orphan", lazy="selectin"
    )
    changes: Mapped[list["DeviceChange"]] = relationship(  # noqa: F821
        back_populates="device", cascade="all, delete-orphan", lazy="selectin"
    )

