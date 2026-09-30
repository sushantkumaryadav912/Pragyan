import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Globe,
  Radio,
  Search,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";


const PROTOCOL_COLORS: Record<string, string> = {
  TCP: "#00f0ff",
  UDP: "#a855f7",
  ICMP: "#e11d48",
  DNS: "#3b82f6",
  HTTP: "#10b981",
};

// Mock bandwidth timeline trend data
const BANDWIDTH_SERIES = [
  { time: "12:00", orig: 14.2, resp: 32.4 },
  { time: "12:05", orig: 18.5, resp: 41.2 },
  { time: "12:10", orig: 12.1, resp: 28.9 },
  { time: "12:15", orig: 24.8, resp: 64.1 },
  { time: "12:20", orig: 31.2, resp: 82.5 },
  { time: "12:25", orig: 22.4, resp: 58.0 },
  { time: "12:30", orig: 28.6, resp: 68.4 },
];

export function TrafficPage() {
  const [activeTab, setActiveTab] = useState<"flows" | "dns">("flows");
  const [search, setSearch] = useState("");

  const { data: summary } = useQuery({
    queryKey: ["traffic-summary"],
    queryFn: () => api.getTrafficSummary(),
    refetchInterval: 5000,
  });

  const { data: connections = [] } = useQuery({
    queryKey: ["traffic-connections"],
    queryFn: () => api.listConnections(),
    refetchInterval: 5000,
  });

  const { data: dnsLogs = [] } = useQuery({
    queryKey: ["traffic-dns"],
    queryFn: () => api.listDNSQueries(),
    refetchInterval: 5000,
  });

  const pieData = Object.entries(summary?.protocol_breakdown ?? { TCP: 70, UDP: 30 }).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const filteredConns = connections.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.src_ip.includes(q) ||
      c.dst_ip.includes(q) ||
      c.protocol.toLowerCase().includes(q) ||
      (c.service && c.service.toLowerCase().includes(q))
    );
  });

  const filteredDNS = dnsLogs.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.src_ip.includes(q) ||
      d.query.toLowerCase().includes(q) ||
      d.qtype.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-2xl font-extrabold text-slate-100 tracking-tight">
              Network Traffic Telemetry
            </h1>
            <Badge tone="purple" pulse className="font-mono text-[10px]">
              ZEEK ENGINE LIVE
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time flow telemetry, bandwidth throughput analysis, protocol distribution, and DNS anomaly observation.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card glow>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                Live Throughput
              </span>
              <span className="font-mono text-2xl font-bold text-cyan-400">
                {summary?.throughput_mbps ?? 48.6} <span className="text-xs text-slate-400">Mbps</span>
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card glow>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                Active Connections
              </span>
              <span className="font-mono text-2xl font-bold text-purple-400">
                {summary?.active_connections ?? 184}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <Activity className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card glow>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                Total DNS Queries
              </span>
              <span className="font-mono text-2xl font-bold text-emerald-400">
                {summary?.total_dns_queries ?? 1240}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Globe className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card glow>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                Data Transfer Volume
              </span>
              <span className="font-mono text-xl font-bold text-slate-200">
                {((summary?.total_bytes ?? 345000000) / (1024 * 1024)).toFixed(1)} <span className="text-xs text-slate-400">MB</span>
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300">
              <Radio className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bandwidth Throughput Chart */}
        <Card glow className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Bandwidth Throughput Stream (Mbps)</span>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1 text-cyan-400">
                  <ArrowUpRight className="w-3.5 h-3.5" /> Outbound (Resp)
                </span>
                <span className="flex items-center gap-1 text-purple-400">
                  <ArrowDownRight className="w-3.5 h-3.5" /> Inbound (Orig)
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={BANDWIDTH_SERIES}>
                  <defs>
                    <linearGradient id="colorResp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOrig" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#090d16",
                      borderColor: "#1e293b",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                      fontFamily: "monospace",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="resp"
                    stroke="#00f0ff"
                    fillOpacity={1}
                    fill="url(#colorResp)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="orig"
                    stroke="#a855f7"
                    fillOpacity={1}
                    fill="url(#colorOrig)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Protocol Distribution Pie Chart */}
        <Card glow>
          <CardHeader>
            <CardTitle>Protocol Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={PROTOCOL_COLORS[entry.name] || "#64748b"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#090d16",
                      borderColor: "#1e293b",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2 text-xs font-mono">
              {pieData.map((entry) => (
                <span key={entry.name} className="flex items-center gap-1 text-slate-300">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PROTOCOL_COLORS[entry.name] || "#64748b" }}
                  />
                  {entry.name}: {entry.value}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Talkers Leaderboard */}
      <Card glow>
        <CardHeader>
          <CardTitle>Top Talkers (Data Volume Leaderboard)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {(summary?.top_talkers ?? []).map((talker, idx) => (
              <div
                key={talker.ip}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold text-cyan-400">
                    #{idx + 1}
                  </span>
                  <Badge tone="muted" className="text-[10px]">
                    {talker.connection_count} flows
                  </Badge>
                </div>
                <div>
                  <span className="font-mono text-sm font-semibold text-slate-100 block truncate">
                    {talker.ip}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {(talker.total_bytes / (1024 * 1024)).toFixed(1)} MB transferred
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Flow & Telemetry Logs Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("flows")}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
              activeTab === "flows"
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <Activity className="w-4 h-4" /> Live Flow Connections ({filteredConns.length})
          </button>
          <button
            onClick={() => setActiveTab("dns")}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
              activeTab === "dns"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <Globe className="w-4 h-4" /> DNS Query Telemetry ({filteredDNS.length})
          </button>
        </div>

        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search IPs, domains, ports..."
            className="pl-9 h-8 text-xs bg-slate-950/80 border-slate-800"
          />
        </div>
      </div>

      {/* Live Flow Connections Table */}
      {activeTab === "flows" && (
        <Card glow>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                  <tr>
                    <th className="py-3 px-4">Source Host</th>
                    <th className="py-3 px-4">Destination Host</th>
                    <th className="py-3 px-4">Protocol</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Volume (In / Out)</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4 text-right">State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredConns.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-cyan-400">
                        {c.src_ip}:{c.src_port}
                      </td>
                      <td className="py-3 px-4 font-mono text-purple-400">
                        {c.dst_ip}:{c.dst_port}
                      </td>
                      <td className="py-3 px-4 font-mono uppercase text-slate-300">
                        {c.protocol}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-200">
                        {c.service || "—"}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {c.bytes_orig} B / {c.bytes_resp} B
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {c.duration}s
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Badge tone={c.conn_state === "SF" ? "normal" : "high"}>
                          {c.conn_state || "SF"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* DNS Query Telemetry Table */}
      {activeTab === "dns" && (
        <Card glow>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                  <tr>
                    <th className="py-3 px-4">Client Source IP</th>
                    <th className="py-3 px-4">Queried Domain Name</th>
                    <th className="py-3 px-4">Query Type</th>
                    <th className="py-3 px-4">Result Code</th>
                    <th className="py-3 px-4">Entropy Score</th>
                    <th className="py-3 px-4 text-right">Answers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredDNS.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-cyan-400">{d.src_ip}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                        {d.query}
                      </td>
                      <td className="py-3 px-4 font-mono text-purple-400">{d.qtype}</td>
                      <td className="py-3 px-4 font-mono text-emerald-400">{d.rcode}</td>
                      <td className="py-3 px-4 font-mono">
                        <Badge tone={d.entropy > 3.8 ? "critical" : d.entropy > 3.0 ? "high" : "normal"}>
                          {d.entropy} {d.entropy > 3.8 && "⚠️ High"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400 text-right truncate max-w-xs">
                        {d.answers || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
