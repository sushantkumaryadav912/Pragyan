"""NIDS / Suricata processing package."""
from app.services.ids.suricata_parser import parse_suricata_eve_alert

__all__ = ["parse_suricata_eve_alert"]
