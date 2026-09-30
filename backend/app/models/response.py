from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.core.db import Base


class ResponseAction(Base):
    __tablename__ = "response_actions"

    id = Column(Integer, primary_key=True, index=True)
    action_type = Column(String(50), nullable=False) # ISOLATE_HOST, BLOCK_IP, TERMINATE_SESSION, TRIGGER_DEEP_SCAN
    target_ip = Column(String(50), nullable=False, index=True)
    reason = Column(String(255), nullable=False)
    status = Column(String(50), default="PENDING") # PENDING, EXECUTED, FAILED
    executed_at = Column(DateTime, nullable=True)
    details = Column(String(500), nullable=True)
