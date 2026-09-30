export interface Service {
  id: number;
  port: number;
  protocol: string;
  name: string | null;
  product: string | null;
  version: string | null;
  state: string;
  banner?: string | null;
  risk_level?: "low" | "medium" | "high" | "critical";
}

export interface Device {
  id: number;
  ip: string;
  mac: string | null;
  hostname: string | null;
  os: string | null;
  device_type: string | null;
  status: "up" | "down" | string;
  risk_score: number;
  is_new: boolean;
  first_seen: string;
  last_seen: string;
  vendor?: string | null;
}

export interface DeviceDetail extends Device {
  services: Service[];
  vulnerabilities?: Array<{
    id: string;
    cve?: string;
    title: string;
    severity: "low" | "medium" | "high" | "critical";
    port?: number;
    description: string;
  }>;
  recent_activity?: Array<{
    timestamp: string;
    type: string;
    details: string;
  }>;
}

export type ScanStatus = "pending" | "running" | "completed" | "failed";

export interface Scan {
  id: number;
  target_cidr: string;
  status: ScanStatus;
  hosts_found: number;
  error: string | null;
  started_at: string;
  finished_at: string | null;
  scanned_ports_count?: number;
  scan_type?: string;
  duration_seconds?: number;
}

export interface TopologyNode {
  id: string;
  label: string;
  ip: string;
  type: "router" | "server" | "workstation" | "iot" | "gateway" | "unknown";
  risk_score: number;
  status: "up" | "down";
  ports_count: number;
  x?: number;
  y?: number;
}

export interface TopologyLink {
  source: string;
  target: string;
  traffic: "high" | "medium" | "low";
  protocol?: string;
}

export interface SecuritySummary {
  total_devices: number;
  online_devices: number;
  new_devices: number;
  high_risk_devices: number;
  active_ports: number;
  last_scan_time?: string;
  threat_level: "Optimal" | "Elevated" | "High Risk" | "Critical";
}

