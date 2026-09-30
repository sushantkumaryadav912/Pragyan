"""Real-Time WebSocket Router for Security Console."""
from __future__ import annotations

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.websocket import ws_manager

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/events")
async def websocket_events_endpoint(websocket: WebSocket) -> None:
    """Real-time event stream endpoint broadcasting alerts and telemetry events."""
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection open and listen for ping/heartbeat messages
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
