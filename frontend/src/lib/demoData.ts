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

export const DEMO_CHANGES = [
  {
    id: 501,
    device_id: 103,
    change_type: "NEW_DEVICE",
    title: "New Device Discovered",
    description: "Device 192.168.1.45 first seen on network",
    old_value: null,
    new_value: "192.168.1.45",
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 502,
    device_id: 103,
    change_type: "NEW_PORT",
    title: "Port 5432/tcp Opened",
    description: "Service 'postgresql' detected on port 5432/tcp",
    old_value: null,
    new_value: "5432/tcp (postgresql)",
    timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
  },
  {
    id: 503,
    device_id: 102,
    change_type: "SERVICE_CHANGE",
    title: "Port 3389/tcp Service Updated",
    description: "Service banner updated on port 3389/tcp",
    old_value: "ms-wbt-server (10.0)",
    new_value: "Remote Desktop Services (RDP Active)",
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 504,
    device_id: 104,
    change_type: "CLOSED_PORT",
    title: "Port 80/tcp Closed",
    description: "Port 80/tcp (http) is no longer open",
    old_value: "80/tcp (http)",
    new_value: null,
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
];

export const DEMO_TRAFFIC_SUMMARY = {

  throughput_mbps: 48.6,
  total_bytes: 345000000,
  bytes_orig: 98000000,
  bytes_resp: 247000000,
  active_connections: 184,
  total_dns_queries: 1240,
  protocol_breakdown: {
    TCP: 112,
    UDP: 54,
    ICMP: 8,
    DNS: 6,
    HTTP: 4,
  },
  top_talkers: [
    { ip: "192.168.1.45", total_bytes: 145000000, connection_count: 42 },
    { ip: "192.168.1.10", total_bytes: 98000000, connection_count: 38 },
    { ip: "192.168.1.120", total_bytes: 42000000, connection_count: 24 },
    { ip: "192.168.1.88", total_bytes: 28000000, connection_count: 18 },
    { ip: "192.168.1.200", total_bytes: 14000000, connection_count: 12 },
  ],
};

export const DEMO_CONNECTIONS = [
  {
    id: 901,
    src_ip: "192.168.1.45",
    src_port: 49152,
    dst_ip: "192.168.1.200",
    dst_port: 9200,
    protocol: "tcp",
    service: "http",
    bytes_orig: 14500,
    bytes_resp: 89000,
    duration: 0.84,
    conn_state: "SF",
    timestamp: new Date().toISOString(),
  },
  {
    id: 902,
    src_ip: "192.168.1.120",
    src_port: 52400,
    dst_ip: "192.168.1.1",
    dst_port: 53,
    protocol: "udp",
    service: "dns",
    bytes_orig: 84,
    bytes_resp: 210,
    duration: 0.02,
    conn_state: "SF",
    timestamp: new Date(Date.now() - 15 * 1000).toISOString(),
  },
  {
    id: 903,
    src_ip: "192.168.1.10",
    src_port: 58912,
    dst_ip: "192.168.1.1",
    dst_port: 443,
    protocol: "tcp",
    service: "ssl",
    bytes_orig: 4800,
    bytes_resp: 19200,
    duration: 1.45,
    conn_state: "SF",
    timestamp: new Date(Date.now() - 45 * 1000).toISOString(),
  },
  {
    id: 904,
    src_ip: "192.168.1.88",
    src_port: 41200,
    dst_ip: "192.168.1.1",
    dst_port: 554,
    protocol: "tcp",
    service: "rtsp",
    bytes_orig: 1200,
    bytes_resp: 480000,
    duration: 30.0,
    conn_state: "S1",
    timestamp: new Date(Date.now() - 120 * 1000).toISOString(),
  },
];

export const DEMO_DNS_LOGS = [
  {
    id: 801,
    src_ip: "192.168.1.120",
    dst_ip: "192.168.1.1",
    query: "api.github.com",
    qtype: "A",
    rcode: "NOERROR",
    answers: "140.82.121.4",
    entropy: 2.84,
    timestamp: new Date().toISOString(),
  },
  {
    id: 802,
    src_ip: "192.168.1.45",
    dst_ip: "192.168.1.1",
    query: "x7q2m9z8p4n1.tunnel-c2.net",
    qtype: "TXT",
    rcode: "NOERROR",
    answers: "v=spf1 include:_spf.google.com ~all",
    entropy: 4.15,
    timestamp: new Date(Date.now() - 30 * 1000).toISOString(),
  },
  {
    id: 803,
    src_ip: "192.168.1.10",
    dst_ip: "192.168.1.1",
    query: "corp.internal",
    qtype: "SOA",
    rcode: "NOERROR",
    answers: "dc-01.corp.internal hostmaster.corp.internal",
    entropy: 2.12,
    timestamp: new Date(Date.now() - 60 * 1000).toISOString(),
  },
];

export const DEMO_ALERTS = [
  {
    id: 301,
    alert_type: "DNS_ANOMALY",
    title: "Suspicious DNS Tunneling / High-Entropy Query",
    severity: "CRITICAL",
    risk_score: 92,
    confidence: 0.94,
    source_ip: "192.168.1.45",
    destination_ip: "192.168.1.1",
    source_port: 52410,
    destination_port: 53,
    protocol: "udp",
    description: "High Shannon entropy (4.15) TXT record query 'x7q2m9z8p4n1.tunnel-c2.net' originating from Web App Server.",
    evidence: JSON.stringify({ query: "x7q2m9z8p4n1.tunnel-c2.net", qtype: "TXT", entropy: 4.15 }),
    detection_rule: "rule-dns-tunneling-entropy",
    status: "NEW",
    device_id: 103,
    timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
  },
  {
    id: 302,
    alert_type: "BRUTE_FORCE",
    title: "Possible SSH Brute Force Attack",
    severity: "HIGH",
    risk_score: 84,
    confidence: 0.89,
    source_ip: "192.168.1.88",
    destination_ip: "192.168.1.10",
    source_port: 41200,
    destination_port: 22,
    protocol: "tcp",
    description: "Host 192.168.1.88 generated 14 rapid authentication connection attempts on port 22 (SSH).",
    evidence: JSON.stringify({ attempts: 14, target_port: 22, protocol: "SSH" }),
    detection_rule: "rule-brute-force-auth",
    status: "ACKNOWLEDGED",
    device_id: 104,
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 303,
    alert_type: "PORT_SCAN",
    title: "Port Scan Activity Detected",
    severity: "HIGH",
    risk_score: 85,
    confidence: 0.92,
    source_ip: "192.168.1.88",
    destination_ip: "192.168.1.1",
    source_port: 49100,
    destination_port: null,
    protocol: "tcp",
    description: "Host 192.168.1.88 attempted connections across 42 unique ports within 60 seconds.",
    evidence: JSON.stringify({ unique_ports_count: 42, scanned_ports: [21, 22, 23, 25, 80, 443, 3389] }),
    detection_rule: "rule-excessive-port-scan",
    status: "NEW",
    device_id: 104,
    timestamp: new Date(Date.now() - 40 * 60000).toISOString(),
  },
  {
    id: 304,
    alert_type: "ROGUE_DEVICE",
    title: "High-Risk New Device Discovered",
    severity: "MEDIUM",
    risk_score: 68,
    confidence: 0.90,
    source_ip: "192.168.1.45",
    destination_ip: null,
    source_port: null,
    destination_port: null,
    protocol: null,
    description: "New host discovered with unencrypted vulnerable open ports (5432/tcp postgresql).",
    evidence: JSON.stringify({ ip: "192.168.1.45", vulnerable_ports: ["5432/tcp (postgresql)"] }),
    detection_rule: "rule-new-rogue-device",
    status: "CLOSED",
    device_id: 103,
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
  },
];

export const DEMO_INCIDENTS = [
  {
    id: 401,
    incident_number: "INC-1042",
    title: "Compromised Host & Active C2 Channel - app-prod-node01",
    severity: "CRITICAL" as const,
    status: "INVESTIGATING" as const,
    target_host: "192.168.1.45",
    risk_score: 94,
    summary: "Correlated 3 security alerts (DNS Tunneling, Port Scanning, Rogue Device) on host 192.168.1.45 indicating command & control exfiltration activity.",
    device_id: 103,
    created_at: new Date(Date.now() - 30 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
    alerts: DEMO_ALERTS.filter(a => a.device_id === 103 || a.source_ip === "192.168.1.45")
  },
  {
    id: 402,
    incident_number: "INC-1041",
    title: "Internal Reconnaissance & Telnet Exploit Attempt - IoT Cam",
    severity: "HIGH" as const,
    status: "ACKNOWLEDGED" as const,
    target_host: "192.168.1.88",
    risk_score: 82,
    summary: "Rogue IoT device 192.168.1.88 initiated multi-port sweeps against subnet gateway 192.168.1.1 followed by failed SSH brute force attempts.",
    device_id: 104,
    created_at: new Date(Date.now() - 120 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 45 * 60000).toISOString(),
    alerts: DEMO_ALERTS.filter(a => a.device_id === 104 || a.source_ip === "192.168.1.88")
  }
];

export const DEMO_RESPONSE_ACTIONS = [
  {
    id: 601,
    action_type: "ISOLATE_HOST" as const,
    target_ip: "192.168.1.45",
    reason: "Correlated incident INC-1042: Active DNS C2 Tunneling detected.",
    status: "EXECUTED" as const,
    executed_at: new Date(Date.now() - 10 * 60000).toISOString(),
    details: "Host isolated via iptables drop rule on firewall interface eth0."
  },
  {
    id: 602,
    action_type: "BLOCK_IP" as const,
    target_ip: "198.51.100.42",
    reason: "External IP flagged in Threat Intel feeds (Known Malicious C2).",
    status: "EXECUTED" as const,
    executed_at: new Date(Date.now() - 25 * 60000).toISOString(),
    details: "Subnet firewall blocked all outbound traffic to 198.51.100.42/32."
  },
  {
    id: 603,
    action_type: "TRIGGER_DEEP_SCAN" as const,
    target_ip: "192.168.1.88",
    reason: "Port scan activity trigger from rogue camera device.",
    status: "PENDING" as const,
    executed_at: undefined,
    details: "Scheduled full 65535-port Nmap probe with OS fingerprinting."
  }
];

export const DEMO_THREAT_INTEL = [
  {
    id: 701,
    ioc_type: "DOMAIN" as const,
    value: "tunnel-c2.net",
    threat_category: "Command & Control",
    severity: "CRITICAL" as const,
    source: "AlienVault OTX",
    active: true,
    created_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 702,
    ioc_type: "IP" as const,
    value: "198.51.100.42",
    threat_category: "Botnet C2 Node",
    severity: "HIGH" as const,
    source: "AbuseIPDB",
    active: true,
    created_at: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 703,
    ioc_type: "HASH" as const,
    value: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    threat_category: "Ransomware Payload",
    severity: "CRITICAL" as const,
    source: "VirusTotal",
    active: true,
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  }
];




