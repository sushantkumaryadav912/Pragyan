import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertOctagon,
  CheckCircle2,
  Eye,
  Filter,
  Radio,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import type { Alert, AlertStatus } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatTimeAgo } from "@/lib/utils";


export function AlertsPage() {
  const queryClient = useQueryClient();
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [selectedEvidence, setSelectedEvidence] = useState<Alert | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  // Live WebSocket listener for real-time alert notifications
  useEffect(() => {
    const wsUrl = (import.meta.env.VITE_WS_URL as string | undefined) ?? "ws://localhost:8000/api/v1/ws/events";
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => setWsConnected(false);
      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          if (msg.type === "ALERT_NEW" || msg.type === "ALERT_UPDATE") {
            queryClient.invalidateQueries({ queryKey: ["alerts"] });
          }
        } catch {
          /* ignore */
        }
      };
    } catch {
      setWsConnected(false);
    }
    return () => {
      ws?.close();
    };
  }, [queryClient]);

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["alerts", statusFilter, severityFilter],
    queryFn: () =>
      api.listAlerts(
        statusFilter === "ALL" ? undefined : statusFilter,
        severityFilter === "ALL" ? undefined : severityFilter
      ),
    refetchInterval: 5000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: AlertStatus }) =>
      api.updateAlertStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });

  const filteredAlerts = alerts.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.alert_type.toLowerCase().includes(q) ||
      (a.source_ip && a.source_ip.includes(q)) ||
      (a.destination_ip && a.destination_ip.includes(q)) ||
      a.description.toLowerCase().includes(q)
    );
  });

  const criticalCount = alerts.filter((a) => a.severity === "CRITICAL").length;
  const highCount = alerts.filter((a) => a.severity === "HIGH").length;
  const newCount = alerts.filter((a) => a.status === "NEW").length;

  return (
    <div className="space-y-6">
      {/* Page Title & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-2xl font-extrabold text-slate-100 tracking-tight">
              Security Alerts & Triage Console
            </h1>
            <Badge tone={wsConnected ? "purple" : "muted"} pulse={wsConnected}>
              <Radio className="w-3 h-3 mr-1" />
              {wsConnected ? "WS REALTIME LIVE" : "TELEMETRY BUS"}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time rule-based detection alert stream, risk severity classification, and incident triage.
          </p>
        </div>

        {/* Top Summary Pill Count Badges */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="bg-rose-500/15 border border-rose-500/30 text-rose-400 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>CRITICAL: {criticalCount}</span>
          </div>
          <div className="bg-amber-500/15 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>HIGH: {highCount}</span>
          </div>
          <div className="bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <span>NEW UNACK: {newCount}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card glow>
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Severity Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <span className="text-[11px] text-slate-400 px-2 flex items-center gap-1">
                <Filter className="w-3 h-3 text-cyan-400" /> Severity:
              </span>
              {(["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    severityFilter === sev
                      ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <span className="text-[11px] text-slate-400 px-2">Status:</span>
              {(["ALL", "NEW", "ACKNOWLEDGED", "INVESTIGATING", "CLOSED"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    statusFilter === st
                      ? "bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search alert title, IP, rule..."
              className="pl-9 h-8 text-xs bg-slate-950/80 border-slate-800"
            />
          </div>
        </CardContent>
      </Card>

      {/* Alert Stream Table */}
      <Card glow>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Active Security Alerts ({filteredAlerts.length})
          </CardTitle>
          <span className="text-xs font-mono text-slate-500">
            Auto-refreshing stream
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs font-mono">
              Loading detection alert stream...
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No matching security alerts found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                  <tr>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Alert Details & Rule</th>
                    <th className="py-3 px-4">Source Host</th>
                    <th className="py-3 px-4">Target Host</th>
                    <th className="py-3 px-4">Risk Index</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Triage Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredAlerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <Badge
                          tone={
                            alert.severity === "CRITICAL"
                              ? "critical"
                              : alert.severity === "HIGH"
                              ? "high"
                              : "normal"
                          }
                          pulse={alert.status === "NEW" && alert.severity === "CRITICAL"}
                        >
                          {alert.severity}
                        </Badge>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-100 flex items-center gap-2">
                          <span>{alert.title}</span>
                          <span className="text-[10px] font-mono text-slate-500">
                            [{alert.alert_type}]
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {alert.description}
                        </p>
                        <span className="text-[10px] font-mono text-cyan-400 block mt-0.5">
                          Rule: {alert.detection_rule} &bull; {formatTimeAgo(alert.timestamp)}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-cyan-400">
                        {alert.source_ip ? (
                          <span>
                            {alert.source_ip}
                            {alert.source_port && <span className="text-slate-500">:{alert.source_port}</span>}
                          </span>
                        ) : (
                          " Global"
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-purple-400">
                        {alert.destination_ip ? (
                          <span>
                            {alert.destination_ip}
                            {alert.destination_port && <span className="text-slate-500">:{alert.destination_port}</span>}
                          </span>
                        ) : (
                          " Local Subnet"
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-200">
                        <span className="text-sm">{alert.risk_score}</span> / 100
                      </td>

                      <td className="py-3 px-4">
                        <Badge
                          tone={
                            alert.status === "NEW"
                              ? "purple"
                              : alert.status === "ACKNOWLEDGED"
                              ? "muted"
                              : alert.status === "CLOSED"
                              ? "normal"
                              : "high"
                          }
                        >
                          {alert.status}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Evidence JSON Modal Trigger */}
                          {alert.evidence && (
                            <button
                              onClick={() => setSelectedEvidence(alert)}
                              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors cursor-pointer"
                              title="Inspect Evidence Payload"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Quick Triage Action Buttons */}
                          {alert.status === "NEW" && (
                            <button
                              onClick={() =>
                                updateStatusMutation.mutate({ id: alert.id, status: "ACKNOWLEDGED" })
                              }
                              className="px-2 py-1 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 text-[11px] font-mono hover:bg-cyan-500/25 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Ack
                            </button>
                          )}

                          {alert.status !== "CLOSED" && (
                            <button
                              onClick={() =>
                                updateStatusMutation.mutate({ id: alert.id, status: "CLOSED" })
                              }
                              className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-mono hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <XCircle className="w-3 h-3" /> Close
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evidence Viewer Modal */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" /> Evidence Payload — Alert #{selectedEvidence.id}
              </h3>
              <button
                onClick={() => setSelectedEvidence(null)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 overflow-x-auto">
              <pre className="font-mono text-xs text-cyan-300 leading-relaxed whitespace-pre-wrap">
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(selectedEvidence.evidence || "{}"), null, 2);
                  } catch {
                    return selectedEvidence.evidence;
                  }
                })()}
              </pre>
            </div>
            <div className="text-right">
              <button
                onClick={() => setSelectedEvidence(null)}
                className="px-4 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono hover:bg-cyan-500/30 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
