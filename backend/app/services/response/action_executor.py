from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.response import ResponseAction

class ResponseActionExecutor:
    @staticmethod
    async def execute_action(
        db: AsyncSession,
        action_type: str,
        target_ip: str,
        reason: str
    ) -> ResponseAction:
        """
        Executes defensive response actions (e.g. host isolation, IP blocking, deep scanning).
        Simulates network firewall / iptables rule application safely in software.
        """
        valid_types = ["ISOLATE_HOST", "BLOCK_IP", "TERMINATE_SESSION", "TRIGGER_DEEP_SCAN"]
        if action_type not in valid_types:
            raise ValueError(f"Invalid response action type: {action_type}")

        details = f"Action {action_type} executed against {target_ip}."
        if action_type == "ISOLATE_HOST":
            details += " Added iptables DROP rule for all interface ingress/egress."
        elif action_type == "BLOCK_IP":
            details += " Added subnet null-route BGP entry."
        elif action_type == "TERMINATE_SESSION":
            details += " Sent TCP RST packets to all active connection sockets."
        elif action_type == "TRIGGER_DEEP_SCAN":
            details += " Dispatched background Nmap 65535-port vulnerability probe."

        action_record = ResponseAction(
            action_type=action_type,
            target_ip=target_ip,
            reason=reason,
            status="EXECUTED",
            executed_at=datetime.utcnow(),
            details=details
        )
        db.add(action_record)
        await db.commit()
        await db.refresh(action_record)
        return action_record

    @staticmethod
    async def list_actions(db: AsyncSession) -> List[ResponseAction]:
        result = await db.execute(select(ResponseAction).order_by(ResponseAction.id.desc()))
        return list(result.scalars().all())
