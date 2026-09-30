from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from app.core.db import Base


class ThreatIntelIOC(Base):
    __tablename__ = "threat_intel_iocs"

    id = Column(Integer, primary_key=True, index=True)
    ioc_type = Column(String(20), nullable=False) # IP, DOMAIN, HASH
    value = Column(String(255), nullable=False, unique=True, index=True)
    threat_category = Column(String(100), nullable=False) # C2, Botnet, Malware
    severity = Column(String(20), default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL
    source = Column(String(100), default="Manual")
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
