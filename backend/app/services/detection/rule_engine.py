"""Rule-Based Detection Engine — Evaluates incoming flow telemetry & asset events against security rules."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Sequence

from app.models.alert import Alert
from app.models.device import Device
from app.models.traffic import ConnectionEvent, DNSEvent


def evaluate_port_scan(connections: Sequence[ConnectionEvent], threshold_ports: int = 15) -> list[Alert]:
    """Detect hosts scanning multiple destination ports in a short window."""
    src_ports_map: dict[str, set[int]] = {}
    src_target_map: dict[str, str] = {}

    for conn in connections:
        src = conn.src_ip
        if src not in src_ports_map:
            src_ports_map[src] = set()
            src_target_map[src] = conn.dst_ip
        src_ports_map[src].add(conn.dst_port)

    alerts: list[Alert] = []
    for src_ip, unique_ports in src_ports_map.items():
        if len(unique_ports) >= threshold_ports:
            alerts.append(
                Alert(
                    alert_type="PORT_SCAN",
                    title="Port Scan Activity Detected",
                    severity="HIGH",
                    risk_score=85,
                    confidence=0.92,
                    source_ip=src_ip,
                    destination_ip=src_target_map.get(src_ip),
                    description=f"Host {src_ip} attempted connections across {len(unique_ports)} unique ports.",
                    evidence=json.dumps({"unique_ports_count": len(unique_ports), "scanned_ports": sorted(list(unique_ports))[:10]}),
                    detection_rule="rule-excessive-port-scan",
                    status="NEW",
                    timestamp=datetime.now(timezone.utc),
                )
            )
    return alerts


def evaluate_brute_force(connections: Sequence[ConnectionEvent], threshold_attempts: int = 10) -> list[Alert]:
    """Detect repetitive rapid connections on authentication ports (22 SSH, 3389 RDP, 21 FTP)."""
    AUTH_PORTS = {22, 3389, 21, 445}
    src_auth_map: dict[str, list[ConnectionEvent]] = {}

    for conn in connections:
        if conn.dst_port in AUTH_PORTS:
            src_auth_map.setdefault(conn.src_ip, []).append(conn)

    alerts: list[Alert] = []
    for src_ip, conn_list in src_auth_map.items():
        if len(conn_list) >= threshold_attempts:
            target_port = conn_list[0].dst_port
            proto_name = "SSH" if target_port == 22 else "RDP" if target_port == 3389 else "SMB" if target_port == 445 else "FTP"
            alerts.append(
                Alert(
                    alert_type="BRUTE_FORCE",
                    title=f"Possible {proto_name} Brute Force Attack",
                    severity="HIGH",
                    risk_score=82,
                    confidence=0.88,
                    source_ip=src_ip,
                    destination_ip=conn_list[0].dst_ip,
                    destination_port=target_port,
                    protocol=conn_list[0].protocol,
                    description=f"Host {src_ip} generated {len(conn_list)} rapid auth connection attempts on port {target_port} ({proto_name}).",
                    evidence=json.dumps({"attempts": len(conn_list), "target_port": target_port, "protocol": proto_name}),
                    detection_rule="rule-brute-force-auth",
                    status="NEW",
                    timestamp=datetime.now(timezone.utc),
                )
            )
    return alerts


def evaluate_dns_anomalies(dns_events: Sequence[DNSEvent], entropy_threshold: float = 3.8) -> list[Alert]:
    """Detect DNS tunneling, DGA, or anomalous high-entropy queries."""
    alerts: list[Alert] = []
    for dns in dns_events:
        if dns.entropy >= entropy_threshold:
            alerts.append(
                Alert(
                    alert_type="DNS_ANOMALY",
                    title="Suspicious DNS Tunneling / High-Entropy Query",
                    severity="CRITICAL",
                    risk_score=90,
                    confidence=0.94,
                    source_ip=dns.src_ip,
                    destination_ip=dns.dst_ip,
                    destination_port=53,
                    protocol="udp",
                    description=f"High Shannon entropy ({dns.entropy}) query '{dns.query}' from {dns.src_ip}.",
                    evidence=json.dumps({"query": dns.query, "qtype": dns.qtype, "entropy": dns.entropy, "rcode": dns.rcode}),
                    detection_rule="rule-dns-tunneling-entropy",
                    status="NEW",
                    timestamp=datetime.now(timezone.utc),
                )
            )
    return alerts


def evaluate_rogue_device(device: Device) -> Alert | None:
    """Evaluate newly discovered device for high-risk open ports or rogue status."""
    if not device.is_new:
        return None

    high_risk_ports = {23: "Telnet", 445: "SMB", 3389: "RDP", 21: "FTP"}
    found_risks = [f"{s.port}/{s.protocol} ({s.name or high_risk_ports.get(s.port, '')})" for s in device.services if s.port in high_risk_ports]

    if found_risks:
        return Alert(
            alert_type="ROGUE_DEVICE",
            title="High-Risk New Device Discovered",
            severity="MEDIUM" if len(found_risks) == 1 else "HIGH",
            risk_score=75,
            confidence=0.90,
            source_ip=device.ip,
            device_id=device.id,
            description=f"New device {device.ip} discovered with vulnerable open ports: {', '.join(found_risks)}.",
            evidence=json.dumps({"ip": device.ip, "mac": device.mac, "hostname": device.hostname, "vulnerable_ports": found_risks}),
            detection_rule="rule-new-rogue-device",
            status="NEW",
            timestamp=datetime.now(timezone.utc),
        )
    return None
