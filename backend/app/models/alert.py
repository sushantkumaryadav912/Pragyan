"""Alert model — security detection alert record."""
from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base

if TYPE_CHECKING:
    from app.models.device import Device


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    alert_type: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    severity: Mapped[str] = mapped_column(String(16), default="MEDIUM", index=True, nullable=False)
    risk_score: Mapped[int] = mapped_column(Integer, default=50, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.85, nullable=False)
    source_ip: Mapped[str | None] = mapped_column(String(45), index=True, nullable=True)
    destination_ip: Mapped[str | None] = mapped_column(String(45), index=True, nullable=True)
    source_port: Mapped[int | None] = mapped_column(Integer, nullable=True)
    destination_port: Mapped[int | None] = mapped_column(Integer, nullable=True)
    protocol: Mapped[str | None] = mapped_column(String(16), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    evidence: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON or text evidence payload
    detection_rule: Mapped[str] = mapped_column(String(128), default="rule-engine-v1", nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="NEW", index=True, nullable=False)
    device_id: Mapped[int | None] = mapped_column(
        ForeignKey("devices.id", ondelete="SET NULL"), nullable=True, index=True
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )

    device: Mapped["Device | None"] = relationship(lazy="selectin")
