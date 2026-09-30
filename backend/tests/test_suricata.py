"""Tests for Suricata EVE JSON parsing and NIDS alert mapping."""
from __future__ import annotations

from app.services.ids import parse_suricata_eve_alert


def test_suricata_eve_alert_parser():
    raw_eve = {
        "timestamp": "2026-09-30T13:00:00.000000+0000",
        "event_type": "alert",
        "src_ip": "192.168.1.105",
        "src_port": 54321,
        "dest_ip": "192.168.1.10",
        "dest_port": 445,
        "proto": "TCP",
        "alert": {
            "action": "allowed",
            "gid": 1,
            "signature_id": 2024897,
            "rev": 1,
            "signature": "ET EXPLOIT Possible EternalBlue SMB MS17-010 Probe",
            "category": "Attempted Administrator Privilege Gain",
            "severity": 1,
        },
    }

    alert = parse_suricata_eve_alert(raw_eve)
    assert alert is not None
    assert alert.severity == "CRITICAL"
    assert alert.risk_score == 95
    assert alert.source_ip == "192.168.1.105"
    assert alert.destination_ip == "192.168.1.10"
    assert alert.destination_port == 445
    assert alert.detection_rule == "suricata-sid-2024897"
    assert "ET EXPLOIT" in alert.title


def test_suricata_non_alert_event_ignored():
    flow_eve = {
        "timestamp": "2026-09-30T13:00:00.000000+0000",
        "event_type": "flow",
        "src_ip": "192.168.1.50",
        "dest_ip": "8.8.8.8",
    }
    assert parse_suricata_eve_alert(flow_eve) is None
