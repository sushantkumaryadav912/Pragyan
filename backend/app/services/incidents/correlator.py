"""Incident Correlation Engine — Groups multiple related security alerts into unified incidents."""
from __future__ import annotations

import random
from typing import Sequence

from app.models.alert import Alert
from app.models.incident import Incident


def correlate_alerts_into_incidents(alerts: Sequence[Alert]) -> list[Incident]:
    """Group un-correlated alerts by target or source host into unified Incident objects."""
    host_alerts_map: dict[str, list[Alert]] = {}

    for alert in alerts:
        # Group by target IP or source IP
        host = alert.destination_ip or alert.source_ip
        if host:
            host_alerts_map.setdefault(host, []).append(alert)

    incidents: list[Incident] = []
    for host, host_alerts in host_alerts_map.items():
        # Only create an Incident if host has multiple alerts or at least one CRITICAL/HIGH alert
        has_critical_or_high = any(a.severity in ("CRITICAL", "HIGH") for a in host_alerts)
        if len(host_alerts) >= 2 or has_critical_or_high:
            max_risk = max(a.risk_score for a in host_alerts)
            highest_sev = "CRITICAL" if any(a.severity == "CRITICAL" for a in host_alerts) else "HIGH" if any(a.severity == "HIGH" for a in host_alerts) else "MEDIUM"
            alert_types = sorted(list({a.alert_type for a in host_alerts}))
            inc_num = f"INC-{random.randint(1000, 9999)}"

            summary_lines = [f"- {a.title} [{a.severity}]: {a.description}" for a in host_alerts[:5]]
            summary_text = f"Correlated {len(host_alerts)} security alert(s) targeting host {host}:\n" + "\n".join(summary_lines)

            title = f"Possible Compromised Host ({host})" if len(host_alerts) >= 3 else f"Correlated Incident ({', '.join(alert_types[:2])})"

            incidents.append(
                Incident(
                    incident_number=inc_num,
                    title=title,
                    severity=highest_sev,
                    status="OPEN",
                    target_host=host,
                    risk_score=max_risk,
                    summary=summary_text,
                    device_id=host_alerts[0].device_id if host_alerts[0].device_id else None,
                )
            )

    return incidents
