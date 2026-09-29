"""Parse nmap XML output into plain Python structures."""
from __future__ import annotations

import xml.etree.ElementTree as ET
from dataclasses import dataclass, field


@dataclass
class ParsedService:
    port: int
    protocol: str
    state: str
    name: str | None = None
    product: str | None = None
    version: str | None = None


@dataclass
class ParsedHost:
    ip: str
    hostname: str | None = None
    mac: str | None = None
    os: str | None = None
    status: str = "up"
    services: list[ParsedService] = field(default_factory=list)


def parse_nmap_xml(xml_text: str) -> list[ParsedHost]:
    """Convert nmap ``-oX`` output into a list of ParsedHost objects."""
    hosts: list[ParsedHost] = []
    if not xml_text.strip():
        return hosts

    root = ET.fromstring(xml_text)
    for host_el in root.findall("host"):
        status_el = host_el.find("status")
        state = status_el.get("state", "up") if status_el is not None else "up"

        ip = None
        mac = None
        for addr in host_el.findall("address"):
            addr_type = addr.get("addrtype")
            if addr_type in ("ipv4", "ipv6"):
                ip = addr.get("addr")
            elif addr_type == "mac":
                mac = addr.get("addr")
        if ip is None:
            continue

        hostname = None
        hostnames_el = host_el.find("hostnames")
        if hostnames_el is not None:
            hn = hostnames_el.find("hostname")
            if hn is not None:
                hostname = hn.get("name")

        os_name = None
        os_el = host_el.find("os")
        if os_el is not None:
            match = os_el.find("osmatch")
            if match is not None:
                os_name = match.get("name")

        services: list[ParsedService] = []
        ports_el = host_el.find("ports")
        if ports_el is not None:
            for port_el in ports_el.findall("port"):
                pstate_el = port_el.find("state")
                pstate = pstate_el.get("state", "unknown") if pstate_el is not None else "unknown"
                if pstate != "open":
                    continue
                svc_el = port_el.find("service")
                services.append(
                    ParsedService(
                        port=int(port_el.get("portid", 0)),
                        protocol=port_el.get("protocol", "tcp"),
                        state=pstate,
                        name=svc_el.get("name") if svc_el is not None else None,
                        product=svc_el.get("product") if svc_el is not None else None,
                        version=svc_el.get("version") if svc_el is not None else None,
                    )
                )

        hosts.append(
            ParsedHost(
                ip=ip,
                hostname=hostname,
                mac=mac,
                os=os_name,
                status=state,
                services=services,
            )
        )
    return hosts
