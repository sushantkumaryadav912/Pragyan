"""Incidents package."""
from app.services.incidents.correlator import correlate_alerts_into_incidents

__all__ = ["correlate_alerts_into_incidents"]
