import type { Alert, AuditLog, AuthToken, ConnectionEvent, Device, DeviceChange, DeviceDetail, DNSEvent, Incident, ResponseAction, RiskScoreBreakdown, Scan, ThreatIntelIOC, TrafficSummary, User } from "./types";
import { DEMO_ALERTS, DEMO_CHANGES, DEMO_CONNECTIONS, DEMO_DEVICES, DEMO_DNS_LOGS, DEMO_INCIDENTS, DEMO_RESPONSE_ACTIONS, DEMO_SCANS, DEMO_THREAT_INTEL, DEMO_TRAFFIC_SUMMARY } from "./demoData";
import { 
  syncAlertToFirestore, 
  syncAuditLogToFirestore, 
  syncDeviceToFirestore, 
  syncIncidentToFirestore, 
  syncResponseActionToFirestore, 
  syncScanToFirestore, 
  syncThreatIntelToFirestore 
} from "./firestoreSync";



const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000";
const API = `${BASE}/api/v1`;

export function setDemoMode(enable: boolean) {
  localStorage.setItem("pragyan_demo_mode", enable ? "true" : "false");
}

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem("pragyan_demo_mode");
  if (stored !== null) {
    return stored === "true";
  }
  return false; // Default to real-time live telemetry
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

export const api = {
  checkHealth: async () => {
    try {
      return await request<{ status: string; db: string; redis: string }>("/health");
    } catch {
      return { status: "offline", db: "offline", redis: "offline" };
    }
  },

  listDevices: async (): Promise<Device[]> => {
    if (isDemoMode()) return DEMO_DEVICES;
    try {
      const devices = await request<Device[]>("/devices");
      devices.forEach(syncDeviceToFirestore);
      return devices;
    } catch (err) {
      console.warn("Backend unavailable while Demo Mode is OFF.", err);
      return [];
    }
  },

  getDevice: async (id: number): Promise<DeviceDetail> => {
    if (isDemoMode()) {
      const found = DEMO_DEVICES.find((d) => d.id === id);
      if (found) return found;
    }
    const dev = await request<DeviceDetail>(`/devices/${id}`);
    syncDeviceToFirestore(dev);
    return dev;
  },

  listDeviceChanges: async (): Promise<DeviceChange[]> => {
    if (isDemoMode()) return DEMO_CHANGES;
    try {
      return await request<DeviceChange[]>("/devices/changes");
    } catch {
      return [];
    }
  },

  getDeviceChanges: async (deviceId: number): Promise<DeviceChange[]> => {
    if (isDemoMode()) return DEMO_CHANGES.filter((c) => c.device_id === deviceId);
    try {
      return await request<DeviceChange[]>(`/devices/${deviceId}/changes`);
    } catch {
      return [];
    }
  },

  listScans: async (): Promise<Scan[]> => {
    if (isDemoMode()) return DEMO_SCANS;
    try {
      const scans = await request<Scan[]>("/scans");
      scans.forEach(syncScanToFirestore);
      return scans;
    } catch {
      return [];
    }
  },

  getScan: async (id: number): Promise<Scan> => {
    if (isDemoMode()) {
      const found = DEMO_SCANS.find((s) => s.id === id);
      if (found) return found;
    }
    const scan = await request<Scan>(`/scans/${id}`);
    syncScanToFirestore(scan);
    return scan;
  },

  cancelScan: async (id: number): Promise<Scan> => {
    if (isDemoMode()) {
      const found = DEMO_SCANS.find((s) => s.id === id);
      if (found) {
        found.status = "failed";
        found.error = "Scan cancelled by user";
        return found;
      }
    }
    return await request<Scan>(`/scans/${id}/cancel`, {
      method: "POST",
    });
  },

  startScan: async (target_cidr: string): Promise<Scan> => {
    if (isDemoMode()) {
      const newScan: Scan = {
        id: Date.now(),
        target_cidr,
        status: "running",
        hosts_found: 0,
        error: null,
        started_at: new Date().toISOString(),
        finished_at: null,
        scan_type: "Simulated Nmap Subnet Scan",
      };
      DEMO_SCANS.unshift(newScan);
      
      setTimeout(() => {
        newScan.status = "completed";
        newScan.hosts_found = Math.floor(Math.random() * 4) + 2;
        newScan.finished_at = new Date().toISOString();
        newScan.duration_seconds = 6;
      }, 3000);
      
      return newScan;
    }

    return await request<Scan>("/networks/scan", {
      method: "POST",
      body: JSON.stringify({ target_cidr }),
    });
  },

  getTrafficSummary: async (): Promise<TrafficSummary> => {
    if (isDemoMode()) return DEMO_TRAFFIC_SUMMARY;
    try {
      return await request<TrafficSummary>("/traffic/summary");
    } catch {
      return DEMO_TRAFFIC_SUMMARY;
    }
  },

  listConnections: async (): Promise<ConnectionEvent[]> => {
    if (isDemoMode()) return DEMO_CONNECTIONS;
    try {
      return await request<ConnectionEvent[]>("/traffic/connections");
    } catch {
      return DEMO_CONNECTIONS;
    }
  },

  listDNSQueries: async (): Promise<DNSEvent[]> => {
    if (isDemoMode()) return DEMO_DNS_LOGS;
    try {
      return await request<DNSEvent[]>("/traffic/dns");
    } catch {
      return DEMO_DNS_LOGS;
    }
  },

  listAlerts: async (status?: string, severity?: string): Promise<Alert[]> => {
    if (isDemoMode()) {
      let filtered = [...DEMO_ALERTS];
      if (status) filtered = filtered.filter((a) => a.status === status);
      if (severity) filtered = filtered.filter((a) => a.severity === severity);
      return filtered as Alert[];
    }
    try {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (severity) params.append("severity", severity);
      const query = params.toString() ? `?${params.toString()}` : "";
      const alerts = await request<Alert[]>(`/alerts${query}`);
      alerts.forEach(syncAlertToFirestore);
      return alerts;
    } catch {
      return DEMO_ALERTS as Alert[];
    }
  },

  getAlert: async (id: number): Promise<Alert> => {
    if (isDemoMode()) {
      const found = DEMO_ALERTS.find((a) => a.id === id);
      if (found) return found as Alert;
    }
    const alert = await request<Alert>(`/alerts/${id}`);
    syncAlertToFirestore(alert);
    return alert;
  },

  updateAlertStatus: async (id: number, status: string): Promise<Alert> => {
    if (isDemoMode()) {
      const found = DEMO_ALERTS.find((a) => a.id === id);
      if (found) {
        found.status = status;
        return found as Alert;
      }
    }
    const alert = await request<Alert>(`/alerts/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    syncAlertToFirestore(alert);
    return alert;
  },

  getDeviceRiskBreakdown: async (deviceId: number): Promise<RiskScoreBreakdown> => {
    if (isDemoMode()) {
      return {
        composite_risk_score: 84,
        risk_tier: "High",
        rule_score: 85,
        ml_anomaly_score: 0.78,
        threat_intel_score: 40,
        asset_importance_score: 80,
        history_score: 36,
        active_alerts_count: 2,
        total_alerts_count: 4,
      };
    }
    try {
      return await request<RiskScoreBreakdown>(`/risk/devices/${deviceId}`);
    } catch {
      return {
        composite_risk_score: 50,
        risk_tier: "Medium",
        rule_score: 50,
        ml_anomaly_score: 0.35,
        threat_intel_score: 0,
        asset_importance_score: 40,
        history_score: 10,
        active_alerts_count: 1,
        total_alerts_count: 1,
      };
    }
  },
  listIncidents: async (status?: string, severity?: string): Promise<Incident[]> => {
    if (isDemoMode()) {
      let filtered = [...DEMO_INCIDENTS];
      if (status) filtered = filtered.filter((i) => i.status === status);
      if (severity) filtered = filtered.filter((i) => i.severity === severity);
      return filtered as Incident[];
    }
    try {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (severity) params.append("severity", severity);
      const query = params.toString() ? `?${params.toString()}` : "";
      const incidents = await request<Incident[]>(`/incidents${query}`);
      incidents.forEach(syncIncidentToFirestore);
      return incidents;
    } catch {
      return DEMO_INCIDENTS as Incident[];
    }
  },

  getIncident: async (id: number): Promise<Incident> => {
    if (isDemoMode()) {
      const found = DEMO_INCIDENTS.find((i) => i.id === id);
      if (found) return found as Incident;
    }
    const incident = await request<Incident>(`/incidents/${id}`);
    syncIncidentToFirestore(incident);
    return incident;
  },

  updateIncidentStatus: async (id: number, status: string): Promise<Incident> => {
    if (isDemoMode()) {
      const found = DEMO_INCIDENTS.find((i) => i.id === id);
      if (found) {
        (found as any).status = status;
        return found as Incident;
      }
    }
    const incident = await request<Incident>(`/incidents/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    syncIncidentToFirestore(incident);
    return incident;
  },

  triggerCorrelation: async (): Promise<{ created_count: number; incidents: Incident[] }> => {
    if (isDemoMode()) {
      return { created_count: 0, incidents: DEMO_INCIDENTS as Incident[] };
    }
    const res = await request<{ created_count: number; incidents: Incident[] }>("/incidents/correlate", {
      method: "POST",
    });
    res.incidents.forEach(syncIncidentToFirestore);
    return res;
  },

  listResponseActions: async (): Promise<ResponseAction[]> => {
    if (isDemoMode()) return DEMO_RESPONSE_ACTIONS as ResponseAction[];
    try {
      const actions = await request<ResponseAction[]>("/response/actions");
      actions.forEach(syncResponseActionToFirestore);
      return actions;
    } catch {
      return DEMO_RESPONSE_ACTIONS as ResponseAction[];
    }
  },

  executeResponseAction: async (action_type: string, target_ip: string, reason: string): Promise<ResponseAction> => {
    if (isDemoMode()) {
      const newAction: ResponseAction = {
        id: Date.now(),
        action_type: action_type as any,
        target_ip,
        reason,
        status: "EXECUTED",
        executed_at: new Date().toISOString(),
        details: `Simulated action execution [${action_type}] on target ${target_ip}`,
      };
      DEMO_RESPONSE_ACTIONS.unshift(newAction as any);
      return newAction;
    }
    const action = await request<ResponseAction>("/response/execute", {
      method: "POST",
      body: JSON.stringify({ action_type, target_ip, reason }),
    });
    syncResponseActionToFirestore(action);
    return action;
  },

  listThreatIntel: async (): Promise<ThreatIntelIOC[]> => {
    if (isDemoMode()) return DEMO_THREAT_INTEL as ThreatIntelIOC[];
    try {
      const iocs = await request<ThreatIntelIOC[]>("/threat-intel/iocs");
      iocs.forEach(syncThreatIntelToFirestore);
      return iocs;
    } catch {
      return DEMO_THREAT_INTEL as ThreatIntelIOC[];
    }
  },

  addThreatIntelIOC: async (ioc: { ioc_type: string; value: string; threat_category: string; severity: string; source?: string }): Promise<ThreatIntelIOC> => {
    if (isDemoMode()) {
      const newIoc: ThreatIntelIOC = {
        id: Date.now(),
        ioc_type: ioc.ioc_type as any,
        value: ioc.value,
        threat_category: ioc.threat_category,
        severity: ioc.severity as any,
        source: ioc.source || "Manual Admin Input",
        active: true,
        created_at: new Date().toISOString(),
      };
      DEMO_THREAT_INTEL.unshift(newIoc as any);
      return newIoc;
    }
    const newIoc = await request<ThreatIntelIOC>("/threat-intel/iocs", {
      method: "POST",
      body: JSON.stringify(ioc),
    });
    syncThreatIntelToFirestore(newIoc);
    return newIoc;
  },

  login: async (username: string, password: string): Promise<AuthToken> => {
    return await request<AuthToken>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },

  getMe: async (token: string): Promise<User> => {
    return await request<User>("/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  listAuditLogs: async (): Promise<AuditLog[]> => {
    if (isDemoMode()) {
      return [
        {
          id: 1,
          username: "admin",
          action: "ISOLATE_HOST",
          target: "192.168.1.45",
          details: "Host isolated via iptables drop rule on firewall interface eth0.",
          status: "SUCCESS",
          timestamp: new Date(Date.now() - 10 * 60000).toISOString()
        },
        {
          id: 2,
          username: "admin",
          action: "BLOCK_IP",
          target: "198.51.100.42",
          details: "Subnet firewall blocked all outbound traffic to 198.51.100.42/32.",
          status: "SUCCESS",
          timestamp: new Date(Date.now() - 25 * 60000).toISOString()
        }
      ];
    }
    try {
      const logs = await request<AuditLog[]>("/audit/logs");
      logs.forEach(syncAuditLogToFirestore);
      return logs;
    } catch {
      return [];
    }
  },

  getSensorsStatus: async () => {
    if (isDemoMode()) {
      return {
        zeek: { name: "Zeek Telemetry", status: "ONLINE", log_dir: "/var/log/zeek/current", active_logs: ["conn.log", "dns.log", "http.log"] },
        suricata: { name: "Suricata NIDS", status: "ONLINE", eve_path: "/var/log/suricata/eve.json", file_size_bytes: 4859000 },
        overall_status: "HEALTHY"
      };
    }
    try {
      return await request<any>("/sensors/status");
    } catch {
      return {
        zeek: { name: "Zeek Telemetry", status: "OFFLINE", log_dir: "/var/log/zeek/current", active_logs: [] },
        suricata: { name: "Suricata NIDS", status: "OFFLINE", eve_path: "/var/log/suricata/eve.json", file_size_bytes: 0 },
        overall_status: "OFFLINE"
      };
    }
  },
};








