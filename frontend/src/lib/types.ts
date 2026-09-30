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

export interface DeviceChange {
  id: number;
  device_id: number;
  change_type: "NEW_DEVICE" | "NEW_PORT" | "CLOSED_PORT" | "SERVICE_CHANGE" | "METADATA_CHANGE" | "STATUS_CHANGE" | string;
  title: string;
  description: string | null;
  old_value: string | null;
  new_value: string | null;
  timestamp: string;
}

export interface DeviceDetail extends Device {
  services: Service[];
  changes?: DeviceChange[];
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

export interface ConnectionEvent {
  id: number;
  src_ip: string;
  src_port: number;
  dst_ip: string;
  dst_port: number;
  protocol: string;
  service: string | null;
  bytes_orig: number;
  bytes_resp: number;
  duration: number;
  conn_state: string | null;
  timestamp: string;
}

export interface DNSEvent {
  id: number;
  src_ip: string;
  dst_ip: string;
  query: string;
  qtype: string;
  rcode: string;
  answers: string | null;
  entropy: number;
  timestamp: string;
}

export interface TopTalker {
  ip: string;
  total_bytes: number;
  connection_count: number;
}

export interface TrafficSummary {
  throughput_mbps: number;
  total_bytes: number;
  bytes_orig: number;
  bytes_resp: number;
  active_connections: number;
  total_dns_queries: number;
  protocol_breakdown: Record<string, number>;
  top_talkers: TopTalker[];
}

export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type AlertStatus = "NEW" | "ACKNOWLEDGED" | "INVESTIGATING" | "FALSE_POSITIVE" | "CONFIRMED" | "CLOSED";

export interface Alert {
  id: number;
  alert_type: string;
  title: string;
  severity: AlertSeverity;
  risk_score: number;
  confidence: number;
  source_ip: string | null;
  destination_ip: string | null;
  source_port: number | null;
  destination_port: number | null;
  protocol: string | null;
  description: string;
  evidence: string | null;
  detection_rule: string;
  status: AlertStatus;
  device_id: number | null;
  timestamp: string;
}

export interface RiskScoreBreakdown {
  composite_risk_score: number;
  risk_tier: string;
  rule_score: number;
  ml_anomaly_score: number;
  threat_intel_score: number;
  asset_importance_score: number;
  history_score: number;
  active_alerts_count: number;
  total_alerts_count: number;
}

export interface Incident {
  id: number;
  incident_number: string;
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "ACKNOWLEDGED" | "INVESTIGATING" | "CONTAINED" | "RESOLVED" | "CLOSED";
  target_host: string;
  risk_score: number;
  summary: string;
  device_id: number | null;
  created_at: string;
  updated_at: string;
  alerts?: Alert[];
}

export interface ResponseAction {
  id: number;
  action_type: "ISOLATE_HOST" | "BLOCK_IP" | "TERMINATE_SESSION" | "TRIGGER_DEEP_SCAN";
  target_ip: string;
  reason: string;
  status: "PENDING" | "EXECUTED" | "FAILED" | "ROLLED_BACK";
  executed_at?: string;
  details?: string;
}

export interface ThreatIntelIOC {
  id: number;
  ioc_type: "IP" | "DOMAIN" | "HASH";
  value: string;
  threat_category: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  source: string;
  active: boolean;
  created_at: string;
export interface User {
  id: number;
  username: string;
  email: string;
  role: "ADMIN" | "ANALYST" | "VIEWER";
  is_active: boolean;
  created_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AuditLog {
  id: number;
  user_id?: number | null;
  username: string;
  action: string;
  target?: string | null;
  details?: string | null;
  status: string;
  timestamp: string;
}








