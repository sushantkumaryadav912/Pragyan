import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  HardDrive,
  Wifi,
  Network,
  Clock,
  ShieldAlert,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Server,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadarSweep } from "@/components/RadarSweep";
import { formatTimeAgo, riskTone } from "@/lib/utils";

const PROTOCOL_COLORS = ["#00f0ff", "#8b5cf6", "#f59e0b", "#ff0055", "#10b981", "#3b82f6"];

export function Dashboard() {
  const devicesQuery = useQuery({ queryKey: ["devices"], queryFn: api.listDevices });
  const scansQuery = useQuery({ queryKey: ["scans"], queryFn: api.listScans });
  const alertsQuery = useQuery({ queryKey: ["alerts"], queryFn: () => api.listAlerts() });

  const devices = devicesQuery.data ?? [];
  const scans = scansQuery.data ?? [];
  const liveAlerts = alertsQuery.data ?? [];

  const onlineCount = devices.filter((d) => d.status === "up").length;
  const newCount = devices.filter((d) => d.is_new).length;
  const highRiskCount = devices.filter((d) => d.risk_score >= 60).length;

  const lastScan = scans[0];

  // Prepare chart data for protocol distribution
  const serviceCounts: Record<string, number> = {};
  devices.forEach((d) => {
    if ("services" in d && Array.isArray((d as unknown as { services: Array<{ name: string | null }> }).services)) {
      (d as unknown as { services: Array<{ name: string | null }> }).services.forEach((s) => {
        const name = (s.name || "other").toUpperCase();
        serviceCounts[name] = (serviceCounts[name] || 0) + 1;
      });
    }
  });

  const protocolData = Object.keys(serviceCounts).length
    ? Object.entries(serviceCounts).map(([name, value]) => ({ name, value }))
    : [
        { name: "HTTP/S", value: 1 },
        { name: "SSH", value: 1 },
        { name: "POSTGRESQL", value: 1 },
      ];

  // Risk Score Distribution
  const riskDistribution = [
    { name: "Critical (80+)", count: devices.filter((d) => d.risk_score >= 80).length, fill: "#ff0055" },
    { name: "High (60-79)", count: devices.filter((d) => d.risk_score >= 60 && d.risk_score < 80).length, fill: "#f59e0b" },
    { name: "Medium (35-59)", count: devices.filter((d) => d.risk_score >= 35 && d.risk_score < 60).length, fill: "#eab308" },
    { name: "Low (1-34)", count: devices.filter((d) => d.risk_score > 0 && d.risk_score < 35).length, fill: "#00f0ff" },
    { name: "Secure (0)", count: devices.filter((d) => d.risk_score === 0).length, fill: "#10b981" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 font-mono">
            SECURITY OPERATIONS CONSOLE
          </h1>
          <Badge tone={highRiskCount > 0 ? "critical" : "normal"} pulse>
            {highRiskCount > 0 ? `${highRiskCount} High Risk Assets` : "Subnet Optimal"}
          </Badge>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Real-time Nmap asset discovery, service inspection & threat exposure telemetry
        </p>
      </div>


      {/* 4 Stat Overview Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card glow className="relative overflow-hidden">
          <CardHeader>
            <CardTitle>Total Discovered Assets</CardTitle>
            <HardDrive className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold font-mono text-slate-100">{devices.length}</span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <Wifi className="w-3 h-3" /> {onlineCount} online
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Active devices observed on network</p>
          </CardContent>
        </Card>

        <Card glow className="relative overflow-hidden">
          <CardHeader>
            <CardTitle>New Assets (24h)</CardTitle>
            <Network className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold font-mono text-purple-300">{newCount}</span>
              <Badge tone="purple">NEW</Badge>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Recently discovered host IPs</p>
          </CardContent>
        </Card>

        <Card glow className="relative overflow-hidden">
          <CardHeader>
            <CardTitle>High Exposure Assets</CardTitle>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold font-mono text-rose-400">{highRiskCount}</span>
              <Badge tone={highRiskCount > 0 ? "critical" : "normal"}>
                {highRiskCount > 0 ? "Attention Required" : "Protected"}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Risk score &gt; 60/100</p>
          </CardContent>
        </Card>

        <Card glow className="relative overflow-hidden">
          <CardHeader>
            <CardTitle>Discovery Scans</CardTitle>
            <Clock className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold font-mono text-slate-100">{scans.length}</span>
              <span className="text-xs text-slate-400 font-mono">
                {lastScan ? formatTimeAgo(lastScan.started_at) : "No scans"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Last status: <span className="text-slate-300 capitalize">{lastScan?.status ?? "—"}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts & Radar Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recharts Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Protocol Distribution & Risk Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card glow>
              <CardHeader>
                <CardTitle>Discovered Services</CardTitle>
                <Activity className="w-4 h-4 text-cyan-400" />
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={protocolData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {protocolData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PROTOCOL_COLORS[index % PROTOCOL_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#090d16", borderColor: "#1e293b", borderRadius: "8px" }}
                      itemStyle={{ color: "#00f0ff", fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 -mt-2">
                  {protocolData.slice(0, 4).map((entry, idx) => (
                    <span key={entry.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PROTOCOL_COLORS[idx % PROTOCOL_COLORS.length] }} />
                      {entry.name} ({entry.value})
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card glow>
              <CardHeader>
                <CardTitle>Risk Severity Breakdown</CardTitle>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#090d16", borderColor: "#1e293b", borderRadius: "8px" }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recently Seen Devices Table */}
          <Card glow>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Recently Observed Assets</CardTitle>
              <Link to="/devices" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                View All Assets <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {devices.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No devices discovered yet. Run a subnet scan to populate inventory.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80 overflow-x-auto">
                  {devices.slice(0, 5).map((device) => (
                    <div key={device.id} className="flex items-center justify-between py-3 text-xs hover:bg-slate-800/40 px-2 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-800 text-cyan-400">
                          <Server className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 font-mono text-sm font-semibold text-slate-100">
                            <Link to={`/devices/${device.id}`} className="hover:text-cyan-400 transition-colors">
                              {device.ip}
                            </Link>
                            {device.hostname && <span className="text-xs text-slate-400 font-sans font-normal">({device.hostname})</span>}
                            {device.is_new && <Badge tone="purple">NEW</Badge>}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {device.os || "Unknown OS"} &bull; {device.vendor || "NIC"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge tone={riskTone(device.risk_score)}>Risk {device.risk_score}</Badge>
                        <span className="text-[11px] text-slate-500 font-mono hidden sm:inline-block">
                          {formatTimeAgo(device.last_seen)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Radar HUD + Threat Feed */}
        <div className="space-y-6">
          <RadarSweep discoveredCount={devices.length} />

          {/* Quick Threat Intelligence Alerts Feed */}
          <Card glow>
            <CardHeader>
              <CardTitle>Subnet Threat Telemetry</CardTitle>
              <Zap className="w-4 h-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {liveAlerts.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-xs">
                    No active threat alerts detected.
                  </div>
                ) : (
                  liveAlerts.slice(0, 3).map((alt) => (
                    <div
                      key={alt.id}
                      className={`p-3 rounded-lg border text-xs ${
                        alt.severity === "CRITICAL"
                          ? "bg-rose-500/10 border-rose-500/20 text-rose-300"
                          : alt.severity === "HIGH"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                          : "bg-slate-900 border-slate-800 text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold mb-1">
                        <span>{alt.title}</span>
                        <Badge tone={alt.severity === "CRITICAL" ? "critical" : alt.severity === "HIGH" ? "high" : "normal"}>
                          {alt.severity}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {alt.description}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

