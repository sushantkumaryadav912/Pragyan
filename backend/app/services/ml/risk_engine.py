"""Composite Risk Engine — Multi-dimensional risk score evaluator combining Rules, ML, Threat Intel & History."""
from __future__ import annotations

from typing import Any, Sequence

from app.models.alert import Alert
from app.models.device import Device
from app.services.ml.anomaly_detector import anomaly_detector
from app.services.ml.feature_extractor import extract_host_features


def calculate_composite_risk_score(
    device: Device,
    alerts: Sequence[Alert],
    feature_dict: dict[str, float],
    threat_intel_score: float = 0.0,
) -> dict[str, Any]:
    """Compute multi-dimensional host risk score breakdown.

    Formula:
    Risk Score = 0.35 * RuleScore + 0.25 * MLScore + 0.20 * ThreatIntel + 0.10 * AssetImportance + 0.10 * HistoryScore

    Tiers:
    0-24: Informational
    25-49: Low Risk
    50-74: Medium Risk
    75-89: High Risk
    90-100: Critical Risk
    """
    # 1. Rule Score (highest risk score among active alerts)
    active_alerts = [a for a in alerts if a.status in ("NEW", "ACKNOWLEDGED", "INVESTIGATING")]
    rule_score = max([a.risk_score for a in active_alerts], default=0)

    # 2. ML Anomaly Score (0.0 to 1.0 -> scaled to 0-100)
    ml_score_norm = anomaly_detector.predict_anomaly_score(feature_dict)
    ml_score = ml_score_norm * 100.0

    # 3. Asset Importance / Criticality (based on device type / open ports)
    open_ports_count = len(device.services) if hasattr(device, "services") and device.services else 0
    asset_importance = min(100.0, 20.0 + (open_ports_count * 15.0))

    # 4. History Score (total historical alert penalty)
    history_score = min(100.0, len(alerts) * 12.0)

    # Weighted composite sum
    composite = (
        (0.35 * rule_score)
        + (0.25 * ml_score)
        + (0.20 * threat_intel_score)
        + (0.10 * asset_importance)
        + (0.10 * history_score)
    )
    final_score = min(100, max(0, int(round(composite))))

    # Determine risk tier
    if final_score >= 90:
        tier = "Critical"
    elif final_score >= 75:
        tier = "High"
    elif final_score >= 50:
        tier = "Medium"
    elif final_score >= 25:
        tier = "Low"
    else:
        tier = "Informational"

    return {
        "composite_risk_score": final_score,
        "risk_tier": tier,
        "rule_score": rule_score,
        "ml_anomaly_score": round(ml_score_norm, 2),
        "threat_intel_score": int(threat_intel_score),
        "asset_importance_score": int(asset_importance),
        "history_score": int(history_score),
        "active_alerts_count": len(active_alerts),
        "total_alerts_count": len(alerts),
    }
