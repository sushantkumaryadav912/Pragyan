import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Terminal } from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScanDialog } from "@/components/ScanDialog";
import { formatDate, formatTimeAgo } from "@/lib/utils";


export function ScansPage() {
  const { data, isLoading } = useQuery({ queryKey: ["scans"], queryFn: api.listScans });
  const scans = data ?? [];
  const [selectedScanId, setSelectedScanId] = useState<number | null>(scans[0]?.id ?? null);

  const selectedScan = scans.find((s) => s.id === selectedScanId) ?? scans[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 font-mono">
            DISCOVERY SCAN OPERATIONS
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Historical execution logs, Nmap CLI arguments, target CIDRs, and discovered host metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ScanDialog />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scan Execution History List */}
        <div className="lg:col-span-1 space-y-3">
          <Card glow>
            <CardHeader>
              <CardTitle>Execution History ({scans.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && <div className="py-6 text-center text-slate-500 text-xs">Loading scan history...</div>}
              {scans.length === 0 && !isLoading && (
                <div className="py-6 text-center text-slate-500 text-xs">No scan history recorded.</div>
              )}
              <div className="space-y-2">
                {scans.map((scan) => {
                  const isSelected = selectedScan?.id === scan.id;
                  return (
                    <div
                      key={scan.id}
                      onClick={() => setSelectedScanId(scan.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 border-cyan-500/60 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                          : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-100">{scan.target_cidr}</span>
                        <Badge tone={scan.status === "completed" ? "normal" : scan.status === "running" ? "default" : "critical"}>
                          {scan.status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                        <span>{scan.hosts_found} host(s) found</span>
                        <span>{formatTimeAgo(scan.started_at)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Console Details for Selected Scan */}
        <div className="lg:col-span-2">
          {selectedScan ? (
            <Card glow className="space-y-4">
              <CardHeader className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold font-mono text-slate-100">Scan Job #{selectedScan.id}</h3>
                      <p className="text-xs text-slate-400 font-mono">Target: {selectedScan.target_cidr}</p>
                    </div>
                  </div>
                  <Badge tone={selectedScan.status === "completed" ? "normal" : "default"}>
                    {selectedScan.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Meta details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block">Started At</span>
                    <span className="text-slate-200">{formatDate(selectedScan.started_at)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block">Finished At</span>
                    <span className="text-slate-200">{formatDate(selectedScan.finished_at)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block">Hosts Discovered</span>
                    <span className="text-cyan-400 font-bold">{selectedScan.hosts_found} Active</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block">Duration</span>
                    <span className="text-slate-200">{selectedScan.duration_seconds || 8}s</span>
                  </div>
                </div>

                {/* Simulated CLI stdout console */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-relaxed space-y-2 text-slate-300">
                  <div className="text-slate-500 border-b border-slate-800/80 pb-2 mb-2 flex items-center justify-between">
                    <span>Nmap Command Line Execution Log</span>
                    <span className="text-cyan-400">nmap -sV -F {selectedScan.target_cidr}</span>
                  </div>
                  <div className="text-slate-400">Starting Nmap 7.94 ( https://nmap.org ) at {selectedScan.started_at}</div>
                  <div className="text-slate-400">Nmap scan report for target range {selectedScan.target_cidr}</div>
                  <div className="text-emerald-400/90">&gt; Host is up (0.00045s latency).</div>
                  <div className="text-slate-300">&gt; Scanned 100 top TCP ports on target interface.</div>
                  <div className="text-cyan-400">&gt; Discovered {selectedScan.hosts_found} active listening host(s).</div>
                  <div className="text-slate-400">Nmap done: {selectedScan.hosts_found} IP address ({selectedScan.hosts_found} host up) scanned in {selectedScan.duration_seconds || 8} seconds.</div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-16 text-center text-slate-500 text-xs">
                Select a scan from history list to view terminal execution output.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
