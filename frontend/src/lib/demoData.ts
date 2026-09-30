import type { DeviceDetail, Scan, TopologyNode, TopologyLink } from "./types";


export const DEMO_DEVICES: DeviceDetail[] = [
  {
    id: 101,
    ip: "192.168.1.1",
    mac: "70:69:5A:11:22:33",
    hostname: "gateway.internal",
    os: "pfSense / FreeBSD 14.0-RELEASE",
    device_type: "Router / Firewall",
    status: "up",
    risk_score: 12,
    is_new: false,
    first_seen: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    last_seen: new Date().toISOString(),
    vendor: "Cisco Systems",
    services: [
      { id: 1001, port: 53, protocol: "udp", name: "domain", product: "dnsmasq", version: "2.89", state: "open", banner: "DNS Resolver v2.89", risk_level: "low" },
      { id: 1002, port: 80, protocol: "tcp", name: "http", product: "nginx", version: "1.24.0", state: "open", banner: "HTTP/1.1 200 OK", risk_level: "low" },
      { id: 1003, port: 443, protocol: "tcp", name: "https", product: "nginx", version: "1.24.0", state: "open", banner: "TLSv1.3 AES-256-GCM", risk_level: "low" },
      { id: 1004, port: 22, protocol: "tcp", name: "ssh", product: "OpenSSH", version: "9.6p1", state: "open", banner: "SSH-2.0-OpenSSH_9.6p1", risk_level: "medium" },
    ],
    vulnerabilities: [
      { id: "VULN-001", cve: "CVE-2023-48795", title: "SSH Terrapin Attack Susceptibility", severity: "medium", port: 22, description: "SSH protocol flaw allowing sequence number manipulation." }
    ],
    recent_activity: [
      { timestamp: new Date(Date.now() - 5 * 60000).toISOString(), type: "Port Scan", details: "Scanned by Nmap worker #1" },
      { timestamp: new Date(Date.now() - 120 * 60000).toISOString(), type: "Traffic Spike", details: "Outbound UDP throughput exceeded baseline by 15%" },
    ]
  },
  {
    id: 102,
    ip: "192.168.1.10",
    mac: "00:50:56:AB:88:12",
    hostname: "dc-01.corp.internal",
    os: "Windows Server 2022 Datacenter",
    device_type: "Domain Controller",
    status: "up",
    risk_score: 84,
    is_new: false,
    first_seen: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
    last_seen: new Date().toISOString(),
    vendor: "VMware Inc.",
    services: [
      { id: 1005, port: 88, protocol: "tcp", name: "kerberos", product: "Microsoft Kerberos", version: "10.0", state: "open", risk_level: "low" },
      { id: 1006, port: 135, protocol: "tcp", name: "msrpc", product: "Microsoft RPC", version: "10.0", state: "open", risk_level: "medium" },
      { id: 1007, port: 389, protocol: "tcp", name: "ldap", product: "Active Directory LDAP", version: "2022", state: "open", risk_level: "high" },
      { id: 1008, port: 445, protocol: "tcp", name: "microsoft-ds", product: "Windows SMB v2/v3", version: "10.0", state: "open", risk_level: "high" },
      { id: 1009, port: 3389, protocol: "tcp", name: "ms-wbt-server", product: "Remote Desktop Services", version: "10.0", state: "open", banner: "RDP Protocol Active", risk_level: "critical" },
    ],
    vulnerabilities: [
      { id: "VULN-002", cve: "CVE-2022-26925", title: "Active Directory Domain Services Elevation of Privilege", severity: "critical", port: 389, description: "Unauthenticated attacker could spoof domain controller credentials." },
      { id: "VULN-003", cve: "CVE-2020-0609", title: "Remote Desktop Gateway RCE Vulnerability", severity: "high", port: 3389, description: "RCE flaw in Windows RDP Gateway service." }
    ],
    recent_activity: [
      { timestamp: new Date(Date.now() - 2 * 60000).toISOString(), type: "Auth Audit", details: "14 failed Kerberos authentication attempts detected" },
    ]
  },
  {
    id: 103,
    ip: "192.168.1.45",
    mac: "00:14:22:44:99:EE",
    hostname: "app-prod-node01",
    os: "Ubuntu Linux 22.04 LTS",
    device_type: "Web Application Server",
    status: "up",
    risk_score: 42,
    is_new: true,
    first_seen: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    last_seen: new Date().toISOString(),
    vendor: "Dell Inc.",
    services: [
      { id: 1010, port: 80, protocol: "tcp", name: "http", product: "Apache httpd", version: "2.4.52", state: "open", banner: "Apache/2.4.52 (Ubuntu)", risk_level: "low" },
      { id: 1011, port: 5432, protocol: "tcp", name: "postgresql", product: "PostgreSQL DB", version: "15.3", state: "open", banner: "PostgreSQL 15.3 Database Server", risk_level: "high" },
      { id: 1012, port: 6379, protocol: "tcp", name: "redis", product: "Redis key-value store", version: "7.0.11", state: "open", banner: "Redis Server v7.0.11", risk_level: "medium" },
    ],
    vulnerabilities: [
      { id: "VULN-004", title: "Exposed Database Port", severity: "high", port: 5432, description: "PostgreSQL is directly accessible on the primary interface." }
    ],
    recent_activity: [
      { timestamp: new Date(Date.now() - 10 * 60000).toISOString(), type: "Discovery", details: "Newly detected host during subnet discovery" }
    ]
  },
  {
    id: 104,
    ip: "192.168.1.88",
    mac: "B8:27:EB:D1:44:11",
    hostname: "iot-cam-north-entry",
    os: "Embedded Linux 4.19",
    device_type: "IoT IP Camera",
    status: "up",
    risk_score: 68,
    is_new: false,
    first_seen: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    last_seen: new Date().toISOString(),
    vendor: "Raspberry Pi Trading",
    services: [
      { id: 1013, port: 554, protocol: "tcp", name: "rtsp", product: "Real-Time Streaming Protocol", version: "1.0", state: "open", risk_level: "medium" },
      { id: 1014, port: 23, protocol: "tcp", name: "telnet", product: "BusyBox telnetd", version: "1.30.1", state: "open", banner: "BusyBox v1.30.1 built-in shell", risk_level: "critical" },
    ],
    vulnerabilities: [
      { id: "VULN-005", title: "Unencrypted Telnet Enabled", severity: "critical", port: 23, description: "Telnet protocol transmits plain-text admin credentials over wire." }
    ],
    recent_activity: [
      { timestamp: new Date(Date.now() - 45 * 60000).toISOString(), type: "Telnet Connection", details: "Inbound connection on port 23" }
    ]
  },
  {
    id: 105,
    ip: "192.168.1.120",
    mac: "AC:DE:48:00:11:AA",
    hostname: "sec-ops-macbook-pro",
    os: "macOS Sonoma 14.4.1",
    device_type: "Workstation",
    status: "up",
    risk_score: 18,
    is_new: false,
    first_seen: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    last_seen: new Date().toISOString(),
    vendor: "Apple Inc.",
    services: [
      { id: 1015, port: 5000, protocol: "tcp", name: "controlcenter", product: "AirPlay Receiver", version: "1.0", state: "open", risk_level: "low" }
    ],
    vulnerabilities: [],
    recent_activity: [
      { timestamp: new Date(Date.now() - 15 * 60000).toISOString(), type: "Heartbeat", details: "Host active in DHCP table" }
    ]
  },
  {
    id: 106,
    ip: "192.168.1.200",
    mac: "08:00:27:12:34:56",
    hostname: "siem-collector-01",
    os: "Debian GNU/Linux 12 (bookworm)",
    device_type: "Security Monitoring Node",
    status: "up",
    risk_score: 5,
    is_new: false,
    first_seen: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
    last_seen: new Date().toISOString(),
    vendor: "Oracle VirtualBox",
    services: [
      { id: 1016, port: 514, protocol: "udp", name: "syslog", product: "rsyslogd", version: "8.2302.0", state: "open", risk_level: "low" },
      { id: 1017, port: 9200, protocol: "tcp", name: "http", product: "OpenSearch API", version: "2.11.0", state: "open", risk_level: "low" },
      { id: 1018, port: 5601, protocol: "tcp", name: "http", product: "OpenSearch Dashboards", version: "2.11.0", state: "open", risk_level: "low" },
    ],
    vulnerabilities: [],
    recent_activity: [
      { timestamp: new Date(Date.now() - 1 * 60000).toISOString(), type: "Log Stream", details: "Processed 12,450 events/min" }
    ]
  }
];

export const DEMO_SCANS: Scan[] = [
  {
    id: 201,
    target_cidr: "192.168.1.0/24",
    status: "completed",
    hosts_found: 6,
    error: null,
    started_at: new Date(Date.now() - 15 * 60000).toISOString(),
    finished_at: new Date(Date.now() - 14 * 60000).toISOString(),
    scanned_ports_count: 1000,
    scan_type: "Nmap TCP Connect (-sV -F)",
    duration_seconds: 42
  },
  {
    id: 200,
    target_cidr: "10.0.0.0/24",
    status: "completed",
    hosts_found: 12,
    error: null,
    started_at: new Date(Date.now() - 120 * 60000).toISOString(),
    finished_at: new Date(Date.now() - 118 * 60000).toISOString(),
    scanned_ports_count: 1000,
    scan_type: "Nmap Fast Scan (-F)",
    duration_seconds: 88
  },
  {
    id: 199,
    target_cidr: "127.0.0.1/32",
    status: "completed",
    hosts_found: 1,
    error: null,
    started_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    finished_at: new Date(Date.now() - 24 * 3600 * 1000 + 4000).toISOString(),
    scanned_ports_count: 100,
    scan_type: "Local Loopback Verification",
    duration_seconds: 4
  }
];

export const DEMO_TOPOLOGY_NODES: TopologyNode[] = [
  { id: "node-1", label: "pfSense Gateway", ip: "192.168.1.1", type: "gateway", risk_score: 12, status: "up", ports_count: 4, x: 500, y: 70 },
  { id: "node-2", label: "Domain Controller", ip: "192.168.1.10", type: "server", risk_score: 84, status: "up", ports_count: 5, x: 250, y: 210 },
  { id: "node-3", label: "App Server", ip: "192.168.1.45", type: "server", risk_score: 42, status: "up", ports_count: 3, x: 750, y: 210 },
  { id: "node-4", label: "IoT Security Cam", ip: "192.168.1.88", type: "iot", risk_score: 68, status: "up", ports_count: 2, x: 180, y: 350 },
  { id: "node-5", label: "SecOps Workstation", ip: "192.168.1.120", type: "workstation", risk_score: 18, status: "up", ports_count: 1, x: 500, y: 350 },
  { id: "node-6", label: "SIEM Collector", ip: "192.168.1.200", type: "server", risk_score: 5, status: "up", ports_count: 3, x: 820, y: 350 },
];


export const DEMO_TOPOLOGY_LINKS: TopologyLink[] = [
  { source: "node-1", target: "node-2", traffic: "high", protocol: "Kerberos/LDAP" },
  { source: "node-1", target: "node-3", traffic: "high", protocol: "HTTP/HTTPS" },
  { source: "node-1", target: "node-4", traffic: "low", protocol: "RTSP" },
  { source: "node-1", target: "node-5", traffic: "medium", protocol: "SSH/AirPlay" },
  { source: "node-1", target: "node-6", traffic: "high", protocol: "Syslog 514" },
  { source: "node-3", target: "node-6", traffic: "high", protocol: "App Logs" },
  { source: "node-2", target: "node-6", traffic: "medium", protocol: "Audit Stream" },
];
