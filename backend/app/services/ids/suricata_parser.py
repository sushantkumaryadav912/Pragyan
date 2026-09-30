"""Suricata EVE JSON Parser — Maps signature-based IDS alerts into unified Pragyan Security Alerts."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

from app.models.alert import Alert


SURICATA_SEVERITY_MAP: dict[int, str] = {
    1: "CRITICAL",
    2: "HIGH",
    3: "MEDIUM",
    4: "LOW",
}


def parse_suricata_eve_alert(eve_data: dict[str, Any]) -> Alert | None:
    """Parse a single Suricata eve.json record.

    If event_type is 'alert', map it to a Pragyan Alert instance.
    """
    event_type = eve_data.get("event_type")
    if event_type != "alert":
        return None

    alert_obj = eve_data.get("alert", {})
    signature = alert_obj.get("signature", "Suricata IDS Alert")
    category = alert_obj.get("category", "Network Intrusion")
    raw_sev = alert_obj.get("severity", 2)
    severity = SURICATA_SEVERITY_MAP.get(raw_sev, "MEDIUM")

    src_ip = eve_data.get("src_ip")
    dst_ip = eve_data.get("dest_ip")
    src_port = eve_data.get("src_port")
    dst_port = eve_data.get("dest_port")
    proto = eve_data.get("proto", "TCP").upper()

    # Risk score based on Suricata severity
    risk_score = 95 if severity == "CRITICAL" else 80 if severity == "HIGH" else 60 if severity == "MEDIUM" else 30

    # Extract timestamp
    ts_str = eve_data.get("timestamp")
    if ts_str:
        try:
            ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
        except Exception:
            ts = datetime.now(timezone.utc)
    else:
        ts = datetime.now(timezone.utc)

    return Alert(
        alert_type=f"IDS_{category.upper().replace(' ', '_')}",
        title=f"IDS: {signature}",
        severity=severity,
        risk_score=risk_score,
        confidence=0.95,
        source_ip=src_ip,
        destination_ip=dst_ip,
        source_port=src_port,
        destination_port=dst_port,
        protocol=proto.lower(),
        description=f"Suricata NIDS signature alert '{signature}' (Category: {category}) from {src_ip} -> {dst_ip}.",
        evidence=json.dumps(
            {
                "signature_id": alert_obj.get("signature_id"),
                "category": category,
                "action": alert_obj.get("action", "allowed"),
                "payload_printable": eve_data.get("payload_printable"),
                "app_proto": eve_data.get("app_proto"),
            }
        ),
        detection_rule=f"suricata-sid-{alert_obj.get('signature_id', 'custom')}",
        status="NEW",
        timestamp=ts,
    )
