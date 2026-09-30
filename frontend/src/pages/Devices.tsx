import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Download,
  Filter,
  LayoutGrid,
  List,
  Server,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatTimeAgo, riskTone, exportToCSV } from "@/lib/utils";




export function Devices() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const { data, isLoading, error } = useQuery({ queryKey: ["devices"], queryFn: api.listDevices });

  const list = data ?? [];

  // Filter logic
  const filtered = list.filter((device) => {
    const matchesQuery =
      device.ip.toLowerCase().includes(query.toLowerCase()) ||
      (device.hostname && device.hostname.toLowerCase().includes(query.toLowerCase())) ||
      (device.mac && device.mac.toLowerCase().includes(query.toLowerCase())) ||
      (device.os && device.os.toLowerCase().includes(query.toLowerCase()));

    if (!matchesQuery) return false;

    if (riskFilter === "critical") return device.risk_score >= 80;
    if (riskFilter === "high") return device.risk_score >= 60 && device.risk_score < 80;
    if (riskFilter === "medium") return device.risk_score >= 35 && device.risk_score < 60;
    if (riskFilter === "low") return device.risk_score < 35;
    return true;
  });

  const handleExport = () => {
    const exportData = filtered.map((d) => ({
      IP: d.ip,
      Hostname: d.hostname || "",
      MAC: d.mac || "",
      Vendor: d.vendor || "",
      OS: d.os || "",
      Type: d.device_type || "",
      Status: d.status,
      RiskScore: d.risk_score,
      LastSeen: d.last_seen,
    }));
    exportToCSV(`pragyan_assets_${new Date().toISOString().slice(0, 10)}.csv`, exportData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 font-mono">
            DISCOVERED ASSET INVENTORY
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Layer 2/3 active network devices, open ports & host risk indices ({filtered.length} visible)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
        </div>
      </div>


      {/* Filter & View Switcher Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by IP, Hostname, MAC, or OS..."
              className="pl-9 text-xs bg-slate-950/80 border-slate-800"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Risk Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-slate-950 text-slate-200 text-xs rounded-lg border border-slate-800 px-2.5 py-1.5 outline-none cursor-pointer"
            >
              <option value="all">All Risk Levels</option>
              <option value="critical">Critical (&ge;80)</option>
              <option value="high">High (&ge;60)</option>
              <option value="medium">Medium (35-59)</option>
              <option value="low">Low (&lt;35)</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-0.5">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "table" ? "bg-slate-800 text-cyan-400" : "text-slate-500 hover:text-slate-300"}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-slate-800 text-cyan-400" : "text-slate-500 hover:text-slate-300"}`}
              title="Grid Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {isLoading && (
        <div className="p-12 text-center text-slate-400 text-sm">Querying active network hosts...</div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          Failed to retrieve devices: {(error as Error).message}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center text-slate-500 text-xs">
            No assets match current search criteria or no scans run yet.
          </CardContent>
        </Card>
      )}

      {viewMode === "table" && filtered.length > 0 && (
        <Card glow className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3.5">Asset / IP</th>
                  <th className="px-4 py-3.5">Hostname</th>
                  <th className="px-4 py-3.5">MAC / Vendor</th>
                  <th className="px-4 py-3.5">Operating System</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Risk Exposure</th>
                  <th className="px-4 py-3.5">Last Seen</th>
                  <th className="px-4 py-3.5 text-right font-normal">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filtered.map((device) => (
                  <tr
                    key={device.id}
                    onClick={() => navigate(`/devices/${device.id}`)}
                    className="cursor-pointer hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                          {device.ip}
                        </span>
                        {device.is_new && <Badge tone="purple">NEW</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300 font-mono">
                      {device.hostname || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 font-mono">
                      <div>{device.mac || "—"}</div>
                      {device.vendor && <div className="text-[10px] text-slate-500">{device.vendor}</div>}
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">{device.os || "Unknown"}</td>
                    <td className="px-4 py-3.5">
                      <Badge tone={device.status === "up" ? "normal" : "muted"} pulse={device.status === "up"}>
                        {device.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone={riskTone(device.risk_score)}>
                        Risk Score: {device.risk_score}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                      {formatTimeAgo(device.last_seen)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {viewMode === "grid" && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((device) => (
            <Card
              key={device.id}
              glow
              onClick={() => navigate(`/devices/${device.id}`)}
              className="cursor-pointer hover:border-cyan-500/50 p-5 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-800 text-cyan-400 border border-slate-700">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-bold text-slate-100">{device.ip}</span>
                      {device.is_new && <Badge tone="purple">NEW</Badge>}
                    </div>
                    <span className="text-xs text-slate-400">{device.hostname || "No Hostname"}</span>
                  </div>
                </div>
                <Badge tone={riskTone(device.risk_score)}>Risk {device.risk_score}</Badge>
              </div>

              <div className="space-y-2 border-t border-b border-slate-800/80 py-3 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">MAC Address:</span>
                  <span className="font-mono text-slate-300">{device.mac || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Operating System:</span>
                  <span className="text-slate-200">{device.os || "Unknown OS"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Asset Category:</span>
                  <span className="text-slate-200 capitalize">{device.device_type || "Generic Network Host"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="font-mono">{formatTimeAgo(device.last_seen)}</span>
                <span className="text-cyan-400 font-medium flex items-center gap-1 group-hover:underline">
                  Inspect Ports &rarr;
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

