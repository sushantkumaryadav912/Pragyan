import type { Alert, ConnectionEvent, Device, DeviceChange, DeviceDetail, DNSEvent, Scan, TrafficSummary } from "./types";
import { DEMO_ALERTS, DEMO_CHANGES, DEMO_CONNECTIONS, DEMO_DEVICES, DEMO_DNS_LOGS, DEMO_SCANS, DEMO_TRAFFIC_SUMMARY } from "./demoData";

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
  return true; // Default to demo telemetry if first load, but toggleable
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
      return await request<Device[]>("/devices");
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
    return await request<DeviceDetail>(`/devices/${id}`);
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
      return await request<Scan[]>("/scans");
    } catch {
      return [];
    }
  },

  getScan: async (id: number): Promise<Scan> => {
    if (isDemoMode()) {
      const found = DEMO_SCANS.find((s) => s.id === id);
      if (found) return found;
    }
    return await request<Scan>(`/scans/${id}`);
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
      return await request<Alert[]>(`/alerts${query}`);
    } catch {
      return DEMO_ALERTS as Alert[];
    }
  },

  getAlert: async (id: number): Promise<Alert> => {
    if (isDemoMode()) {
      const found = DEMO_ALERTS.find((a) => a.id === id);
      if (found) return found as Alert;
    }
    return await request<Alert>(`/alerts/${id}`);
  },

  updateAlertStatus: async (id: number, status: string): Promise<Alert> => {
    if (isDemoMode()) {
      const found = DEMO_ALERTS.find((a) => a.id === id);
      if (found) {
        found.status = status;
        return found as Alert;
      }
    }
    return await request<Alert>(`/alerts/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};




