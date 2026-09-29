import type { Device, DeviceDetail, Scan } from "./types";

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000";
const API = `${BASE}/api/v1`;

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
  listDevices: () => request<Device[]>("/devices"),
  getDevice: (id: number) => request<DeviceDetail>(`/devices/${id}`),
  listScans: () => request<Scan[]>("/scans"),
  getScan: (id: number) => request<Scan>(`/scans/${id}`),
  startScan: (target_cidr: string) =>
    request<Scan>("/networks/scan", {
      method: "POST",
      body: JSON.stringify({ target_cidr }),
    }),
};
