import type { Device, DeviceDetail, Scan } from "./types";
import { DEMO_DEVICES, DEMO_SCANS } from "./demoData";

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
};


