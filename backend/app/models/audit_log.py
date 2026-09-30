from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.core.db import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    username = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False, index=True)  # LOGIN, BLOCK_IP, ISOLATE_HOST, TRIGGER_SCAN, etc.
    target = Column(String(255), nullable=True)
    details = Column(String(500), nullable=True)
    status = Column(String(20), default="SUCCESS")  # SUCCESS, FAILED, REJECTED
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
