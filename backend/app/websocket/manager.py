"""WebSocket Connection Manager — Broadcast real-time alerts and telemetry updates."""
from __future__ import annotations

import json
from typing import Any

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: dict[str, Any], websocket: WebSocket) -> None:
        await websocket.send_text(json.dumps(message))

    async def broadcast(self, event_type: str, payload: dict[str, Any]) -> None:
        """Broadcast event to all connected dashboard WebSocket clients."""
        if not self.active_connections:
            return

        message = {
            "type": event_type,
            "payload": payload,
        }
        data_str = json.dumps(message)
        disconnected = []

        for connection in self.active_connections:
            try:
                await connection.send_text(data_str)
            except Exception:
                disconnected.append(connection)

        for dead in disconnected:
            self.disconnect(dead)


ws_manager = ConnectionManager()
