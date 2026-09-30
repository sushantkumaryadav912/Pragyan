"""Feature Extractor — Extract behavioral metric vectors from host connection flows."""
from __future__ import annotations

import math
from typing import Sequence

from app.models.traffic import ConnectionEvent, DNSEvent


def calculate_entropy(values: list[int]) -> float:
    """Calculate Shannon entropy for a list of integer ports or states."""
    if not values:
        return 0.0
    total = len(values)
    counts = [values.count(val) for val in set(values)]
    return -sum((c / total) * math.log2(c / total) for c in counts)


def extract_host_features(
    connections: Sequence[ConnectionEvent], dns_events: Sequence[DNSEvent]
) -> dict[str, float]:
    """Extract an 8-dimensional feature dict from a host's recent traffic windows.

    Features:
    1. connection_count
    2. bytes_in
    3. bytes_out
    4. unique_destinations
    5. unique_ports
    6. dns_frequency
    7. failed_connections
    8. port_entropy
    """
    if not connections:
        return {
            "connection_count": 0.0,
            "bytes_in": 0.0,
            "bytes_out": 0.0,
            "unique_destinations": 0.0,
            "unique_ports": 0.0,
            "dns_frequency": float(len(dns_events)),
            "failed_connections": 0.0,
            "port_entropy": 0.0,
        }

    conn_count = len(connections)
    bytes_in = sum(c.bytes_resp for c in connections)
    bytes_out = sum(c.bytes_orig for c in connections)
    unique_dsts = len({c.dst_ip for c in connections})
    ports = [c.dst_port for c in connections]
    unique_ports = len(set(ports))
    failed_conns = sum(1 for c in connections if c.conn_state and c.conn_state != "SF")
    port_entropy = calculate_entropy(ports)

    return {
        "connection_count": float(conn_count),
        "bytes_in": float(bytes_in),
        "bytes_out": float(bytes_out),
        "unique_destinations": float(unique_dsts),
        "unique_ports": float(unique_ports),
        "dns_frequency": float(len(dns_events)),
        "failed_connections": float(failed_conns),
        "port_entropy": round(port_entropy, 2),
    }
