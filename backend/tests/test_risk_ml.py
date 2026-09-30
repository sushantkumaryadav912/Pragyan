"""Tests for feature extraction, IsolationForest ML anomaly scoring, and composite risk engine."""
from __future__ import annotations

from app.models.alert import Alert
from app.models.device import Device
from app.models.traffic import ConnectionEvent, DNSEvent
from app.services.ml import (
    anomaly_detector,
    calculate_composite_risk_score,
    extract_host_features,
)


def test_feature_extraction():
    conns = [
        ConnectionEvent(src_ip="192.168.1.10", src_port=5000, dst_ip="192.168.1.1", dst_port=80, bytes_orig=100, bytes_resp=500, conn_state="SF"),
        ConnectionEvent(src_ip="192.168.1.10", src_port=5001, dst_ip="192.168.1.1", dst_port=443, bytes_orig=200, bytes_resp=800, conn_state="SF"),
    ]
    dns_events = [
        DNSEvent(src_ip="192.168.1.10", dst_ip="8.8.8.8", query="example.com", entropy=2.1),
    ]

    features = extract_host_features(conns, dns_events)
    assert features["connection_count"] == 2.0
    assert features["bytes_in"] == 1300.0
    assert features["bytes_out"] == 300.0
    assert features["unique_ports"] == 2.0
    assert features["dns_frequency"] == 1.0


def test_isolation_forest_anomaly_scoring():
    # Normal feature dict
    normal_features = {
        "connection_count": 10.0,
        "bytes_in": 5000.0,
        "bytes_out": 2000.0,
        "unique_destinations": 2.0,
        "unique_ports": 2.0,
        "dns_frequency": 5.0,
        "failed_connections": 0.0,
        "port_entropy": 0.5,
    }
    score_normal = anomaly_detector.predict_anomaly_score(normal_features)

    # Highly anomalous outlier feature dict (port scan / exfiltration spike)
    anomalous_features = {
        "connection_count": 500.0,
        "bytes_in": 50000000.0,
        "bytes_out": 95000000.0,
        "unique_destinations": 150.0,
        "unique_ports": 120.0,
        "dns_frequency": 250.0,
        "failed_connections": 80.0,
        "port_entropy": 4.5,
    }
    score_anomalous = anomaly_detector.predict_anomaly_score(anomalous_features)

    assert score_anomalous > score_normal
    assert score_anomalous >= 0.5


def test_composite_risk_engine():
    dev = Device(ip="192.168.1.10", status="up")
    alerts = [
        Alert(alert_type="PORT_SCAN", title="Port scan", severity="HIGH", risk_score=85, status="NEW"),
    ]
    features = {
        "connection_count": 50.0,
        "bytes_in": 10000.0,
        "bytes_out": 5000.0,
        "unique_destinations": 5.0,
        "unique_ports": 10.0,
        "dns_frequency": 10.0,
        "failed_connections": 1.0,
        "port_entropy": 1.2,
    }

    breakdown = calculate_composite_risk_score(dev, alerts, features, threat_intel_score=50.0)
    assert breakdown["composite_risk_score"] > 0
    assert breakdown["risk_tier"] in ("Medium", "High", "Critical")
    assert breakdown["rule_score"] == 85
