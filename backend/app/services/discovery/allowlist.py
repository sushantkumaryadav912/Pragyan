"""Validate that a scan target falls entirely within the configured allowlist."""
from __future__ import annotations

import ipaddress

from app.core.config import settings


class TargetNotAllowed(ValueError):
    """Raised when a scan target is outside the permitted networks."""


def validate_target(target: str) -> str:
    """Return a normalized CIDR/host string if permitted, else raise TargetNotAllowed.

    The target must be a valid IPv4/IPv6 address or CIDR and must be fully
    contained within one of the allowlisted networks.
    """
    target = target.strip()
    try:
        net = ipaddress.ip_network(target, strict=False)
    except ValueError as exc:
        raise TargetNotAllowed(f"Invalid target '{target}': {exc}") from exc

    allowed = [ipaddress.ip_network(c, strict=False) for c in settings.allowlist_networks]
    for allow_net in allowed:
        if net.version == allow_net.version and net.subnet_of(allow_net):
            return str(net)

    raise TargetNotAllowed(
        f"Target '{target}' is not within the scan allowlist ({settings.scan_allowlist}). "
        "Only authorized private networks may be scanned."
    )
