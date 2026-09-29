export interface Service {
  id: number;
  port: number;
  protocol: string;
  name: string | null;
  product: string | null;
  version: string | null;
  state: string;
}

export interface Device {
  id: number;
  ip: string;
  mac: string | null;
  hostname: string | null;
  os: string | null;
  device_type: string | null;
  status: string;
  risk_score: number;
  is_new: boolean;
  first_seen: string;
  last_seen: string;
}

export interface DeviceDetail extends Device {
  services: Service[];
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
}
