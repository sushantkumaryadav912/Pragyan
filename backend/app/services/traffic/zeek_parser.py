"""Zeek Telemetry Log Parser — Ingests Zeek conn.log, dns.log, and http.log streams."""
from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Any

from app.models.traffic import ConnectionEvent, DNSEvent, HTTPEvent


def calculate_domain_entropy(domain: str) -> float:
    """Calculate Shannon entropy for a domain name string to detect DNS tunneling."""
    if not domain:
        return 0.0
    prob = [float(domain.count(c)) / len(domain) for c in set(domain)]
    return -sum(p * math.log2(p) for p in prob)


def parse_zeek_conn_line(data: dict[str, Any]) -> ConnectionEvent:
    """Parse a single JSON / dictionary Zeek conn event into a ConnectionEvent instance."""
    ts = data.get("ts")
    dt = datetime.fromtimestamp(ts, tz=timezone.utc) if isinstance(ts, (int, float)) else datetime.now(timezone.utc)

    return ConnectionEvent(
        src_ip=str(data.get("id.orig_h", "0.0.0.0")),
        src_port=int(data.get("id.orig_p", 0)),
        dst_ip=str(data.get("id.resp_h", "0.0.0.0")),
        dst_port=int(data.get("id.resp_p", 0)),
        protocol=str(data.get("proto", "tcp")).lower(),
        service=data.get("service"),
        bytes_orig=int(data.get("orig_bytes") or 0),
        bytes_resp=int(data.get("resp_bytes") or 0),
        duration=float(data.get("duration") or 0.0),
        conn_state=data.get("conn_state"),
        timestamp=dt,
    )


def parse_zeek_dns_line(data: dict[str, Any]) -> DNSEvent:
    """Parse a single JSON / dictionary Zeek dns event into a DNSEvent instance."""
    ts = data.get("ts")
    dt = datetime.fromtimestamp(ts, tz=timezone.utc) if isinstance(ts, (int, float)) else datetime.now(timezone.utc)
    query = str(data.get("query", ""))
    entropy = calculate_domain_entropy(query)

    answers = data.get("answers")
    answers_str = ", ".join(answers) if isinstance(answers, list) else str(answers) if answers else None

    return DNSEvent(
        src_ip=str(data.get("id.orig_h", "0.0.0.0")),
        dst_ip=str(data.get("id.resp_h", "0.0.0.0")),
        query=query,
        qtype=str(data.get("qtype_name", "A")),
        rcode=str(data.get("rcode_name", "NOERROR")),
        answers=answers_str,
        entropy=round(entropy, 2),
        timestamp=dt,
    )


def parse_zeek_http_line(data: dict[str, Any]) -> HTTPEvent:
    """Parse a single JSON / dictionary Zeek http event into an HTTPEvent instance."""
    ts = data.get("ts")
    dt = datetime.fromtimestamp(ts, tz=timezone.utc) if isinstance(ts, (int, float)) else datetime.now(timezone.utc)

    return HTTPEvent(
        src_ip=str(data.get("id.orig_h", "0.0.0.0")),
        dst_ip=str(data.get("id.resp_h", "0.0.0.0")),
        method=str(data.get("method", "GET")),
        host=data.get("host"),
        uri=data.get("uri"),
        status_code=int(data.get("status_code")) if data.get("status_code") else None,
        user_agent=data.get("user_agent"),
        timestamp=dt,
    )
