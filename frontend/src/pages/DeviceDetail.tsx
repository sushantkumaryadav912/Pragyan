import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Server,
  ShieldAlert,
  Search,
  History,
  Activity,
  Radio,
} from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate, formatTimeAgo, riskTone, riskLabel, getVendorFromMac } from "@/lib/utils";


export function DeviceDetail() {
  const { id } = useParams();
  const [serviceSearch, setServiceSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"services" | "history">("services");

  const { data: device, isLoading, error } = useQuery({
    queryKey: ["device", id],
    queryFn: () => api.getDevice(Number(id)),
    enabled: !!id,
  });

  const { data: changes = [] } = useQuery({
    queryKey: ["device-changes", id],
    queryFn: () => api.getDeviceChanges(Number(id)),
    enabled: !!id,
  });


  const filteredServices = (device?.services ?? []).filter((s) => {
    const q = serviceSearch.toLowerCase();
    return (
      String(s.port).includes(q) ||
      s.protocol.toLowerCase().includes(q) ||
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.product && s.product.toLowerCase().includes(q)) ||
      (s.banner && s.banner.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Back Navigation Link */}
      <Link
        to="/devices"
        className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> &larr; Return to Asset Inventory
      </Link>

      {isLoading && <div className="p-12 text-center text-slate-400 text-sm">Fetching host details...</div>}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {(error as Error).message}
        </div>
      )}

      {device && (
        <>
          {/* Top Asset Title Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-xl border border-slate-800 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                <Server className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-mono text-2xl font-extrabold text-slate-100">{device.ip}</h1>
                  <Badge tone={device.status === "up" ? "normal" : "muted"} pulse={device.status === "up"}>
                    {device.status.toUpperCase()}
                  </Badge>
                  {device.is_new && <Badge tone="purple">NEW ASSET</Badge>}
                </div>
                <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                  <span>Hostname: <strong className="text-slate-200 font-mono">{device.hostname || "Unresolved"}</strong></span>
                  <span>&bull;</span>
                  <span>Vendor: <strong className="text-slate-200">{device.vendor || getVendorFromMac(device.mac)}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block uppercase tracking-wider">Host Risk Index</span>
                <span className="text-xl font-bold font-mono text-slate-100">{device.risk_score} / 100</span>
              </div>
              <Badge tone={riskTone(device.risk_score)} className="px-3 py-1 text-xs">
                {riskLabel(device.risk_score)}
              </Badge>
            </div>
          </div>

          {/* Asset Telemetry & Hardware Metadata Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card glow>
              <CardContent className="p-4">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Hardware MAC Address</span>
                <span className="font-mono text-sm text-slate-200 font-semibold">{device.mac || "Not Discovered"}</span>
              </CardContent>
            </Card>

            <Card glow>
              <CardContent className="p-4">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">OS Fingerprint</span>
                <span className="text-sm text-slate-200 font-medium truncate block">{device.os || "Generic OS"}</span>
              </CardContent>
            </Card>

            <Card glow>
              <CardContent className="p-4">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">First Observed</span>
                <span className="font-mono text-xs text-slate-300">{formatDate(device.first_seen)}</span>
              </CardContent>
            </Card>

            <Card glow>
              <CardContent className="p-4">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Last Seen Active</span>
                <span className="font-mono text-xs text-cyan-400">{formatTimeAgo(device.last_seen)}</span>
              </CardContent>
            </Card>
          </div>

          {/* Vulnerability & Risk Exposure Audit Section */}
          {device.vulnerabilities && device.vulnerabilities.length > 0 && (
            <Card glow className="border-rose-500/30 bg-rose-950/10">
              <CardHeader>
                <CardTitle className="text-rose-400 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Detected Host Vulnerabilities & Compliance Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {device.vulnerabilities.map((vuln) => (
                    <div
                      key={vuln.id}
                      className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-slate-100">
                          {vuln.cve && <span className="font-mono text-cyan-400">{vuln.cve}:</span>}
                          <span>{vuln.title}</span>
                          {vuln.port && <Badge tone="muted">Port {vuln.port}</Badge>}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{vuln.description}</p>
                      </div>
                      <Badge tone={vuln.severity === "critical" ? "critical" : "high"}>
                        {vuln.severity.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab Navigation Controls */}
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveTab("services")}
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                activeTab === "services"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <Activity className="w-4 h-4" /> Open Ports & Services ({device.services.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                activeTab === "history"
                  ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <History className="w-4 h-4" /> Change History & Audit Timeline ({changes.length})
            </button>
          </div>

          {/* Open Ports & Services Inspector */}
          {activeTab === "services" && (
            <Card glow>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle>
                  Open Listening Ports & Services ({device.services.length})
                </CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    placeholder="Filter ports, protocols..."
                    className="pl-9 h-8 text-xs bg-slate-950/80 border-slate-800"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {filteredServices.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">No matching open ports found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                        <tr>
                          <th className="py-3 px-3">Port</th>
                          <th className="py-3 px-3">Protocol</th>
                          <th className="py-3 px-3">Service</th>
                          <th className="py-3 px-3">Product / Banner</th>
                          <th className="py-3 px-3">State</th>
                          <th className="py-3 px-3 text-right">Risk Tag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-sans">
                        {filteredServices
                          .sort((a, b) => a.port - b.port)
                          .map((s) => (
                            <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-3 px-3 font-mono font-bold text-cyan-400">{s.port}</td>
                              <td className="py-3 px-3 font-mono text-slate-400 uppercase">{s.protocol}</td>
                              <td className="py-3 px-3 font-semibold text-slate-200">{s.name || "—"}</td>
                              <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                                <div>{s.product ? `${s.product} ${s.version || ""}` : "—"}</div>
                                {s.banner && <div className="text-[10px] text-slate-500 truncate max-w-xs">{s.banner}</div>}
                              </td>
                              <td className="py-3 px-3">
                                <span className="inline-flex items-center gap-1 text-emerald-400 font-mono">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  {s.state}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <Badge tone={s.risk_level === "critical" ? "critical" : s.risk_level === "high" ? "high" : "normal"}>
                                  {s.risk_level || "low"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Asset Change History Timeline */}
          {activeTab === "history" && (
            <Card glow>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-4 h-4 text-purple-400" /> Host Modifications & State History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {changes.length === 0 ? (
                  <div className="py-10 text-center text-slate-500 text-xs">
                    No state changes recorded for this asset yet.
                  </div>
                ) : (
                  <div className="relative border-l border-slate-800 ml-4 space-y-6 py-2">
                    {changes.map((change) => (
                      <div key={change.id} className="relative pl-6">
                        {/* Timeline Node Icon */}
                        <div className="absolute -left-2.5 top-0.5 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                          <Radio className="w-3 h-3 text-purple-400" />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-slate-200">{change.title}</span>
                            <Badge
                              tone={
                                change.change_type === "NEW_DEVICE"
                                  ? "purple"
                                  : change.change_type === "NEW_PORT"
                                  ? "high"
                                  : change.change_type === "CLOSED_PORT"
                                  ? "normal"
                                  : "muted"
                              }
                              className="text-[10px]"
                            >
                              {change.change_type}
                            </Badge>
                          </div>
                          <span className="font-mono text-[11px] text-slate-400">
                            {formatTimeAgo(change.timestamp)} ({formatDate(change.timestamp)})
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{change.description}</p>
                        {(change.old_value || change.new_value) && (
                          <div className="mt-2 text-[11px] font-mono bg-slate-950/80 p-2 rounded border border-slate-800/80 flex flex-wrap gap-4">
                            {change.old_value && (
                              <span className="text-rose-400">
                                <strong>Previous:</strong> {change.old_value}
                              </span>
                            )}
                            {change.new_value && (
                              <span className="text-emerald-400">
                                <strong>Updated:</strong> {change.new_value}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        </>
      )}
    </div>
  );
}

