import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Radar, X, Loader2, ShieldCheck, AlertCircle, Terminal } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const CIDR_PRESETS = [
  { label: "Active Subnet (10.24.81.0/24)", value: "10.24.81.0/24" },
  { label: "Local Subnet (192.168.1.0/24)", value: "192.168.1.0/24" },
  { label: "Corporate Range (10.0.0.0/24)", value: "10.0.0.0/24" },
  { label: "Loopback Host (127.0.0.1/32)", value: "127.0.0.1/32" },
];

export function ScanDialog() {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState("10.24.81.0/24");
  const [scanId, setScanId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logLines, setLogLines] = useState<string[]>([]);
  const qc = useQueryClient();

  const handleCancel = () => {
    setOpen(false);
    setScanId(null);
    setError(null);
    setLogLines([]);
  };

  const start = useMutation({
    mutationFn: () => api.startScan(target),
    onMutate: () => {
      setLogLines([
        `[${new Date().toLocaleTimeString()}] Initializing Pragyan Nmap Discovery Agent...`,
        `[${new Date().toLocaleTimeString()}] Target CIDR validated: ${target}`,
        `[${new Date().toLocaleTimeString()}] Executing TCP SYN / Connect scan (-F -n)...`,
      ]);
    },
    onSuccess: (scan) => {
      setError(null);
      setScanId(scan.id);
    },
    onError: (e: Error) => {
      setError(e.message);
      setLogLines((prev) => [...prev, `[ERROR] Scan authorization rejected: ${e.message}`]);
    },
  });

  const scan = useQuery({
    queryKey: ["scan", scanId],
    queryFn: () => api.getScan(scanId as number),
    enabled: scanId !== null,
    refetchInterval: (q) => {
      const s = q.state.data?.status;
      return s === "completed" || s === "failed" ? false : 1000;
    },
  });

  const done = scan.data?.status === "completed" || scan.data?.status === "failed";

  useEffect(() => {
    if (done && scanId !== null) {
      qc.invalidateQueries({ queryKey: ["devices"] });
      qc.invalidateQueries({ queryKey: ["scans"] });
      if (scan.data?.status === "completed") {
        setLogLines((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Nmap engine finished scanning target subnet.`,
          `[${new Date().toLocaleTimeString()}] Discovered ${scan.data?.hosts_found ?? 0} active host(s). Device inventory refreshed.`,
        ]);
      } else if (scan.data?.status === "failed") {
        setLogLines((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Scan execution failed: ${scan.data?.error || "Unknown error"}`,
        ]);
      }
    }
  }, [done, scanId, scan.data, qc]);

  const running = start.isPending || (scanId !== null && !done);

  return (
    <>
      <Button variant="default" onClick={() => setOpen(true)} className="gap-2">
        <Radar className="h-4 w-4 animate-spin text-slate-950" />
        <span>Start Scan</span>
      </Button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/85 backdrop-blur-md p-4 flex items-center justify-center">
            <div className="relative my-auto w-full max-w-lg rounded-xl border border-slate-700/80 bg-slate-900 p-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col z-[10000]">
              {/* Modal Header */}
              <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Radar className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-100 uppercase tracking-wide">Network Asset Discovery</h2>
                    <p className="text-xs text-slate-400">Authorized Nmap CIDR Subnet Scanner</p>
                  </div>
                </div>
                <button onClick={handleCancel} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Body Content */}
              <div className="space-y-4 overflow-y-auto pr-1 flex-1">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Target Subnet (CIDR format)
                  </label>
                  <Input
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="e.g. 10.24.81.0/24 or 192.168.1.0/24"
                    className="font-mono text-sm"
                  />
                </div>

                {/* Subnet Quick Presets */}
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1.5">Authorized CIDR Presets:</span>
                  <div className="flex flex-wrap gap-2">
                    {CIDR_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setTarget(preset.value)}
                        className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors cursor-pointer ${
                          target === preset.value
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                            : "bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-slate-200"
                        }`}
                      >
                        {preset.value}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg bg-slate-950/80 p-3 border border-slate-800 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Only private RFC1918 networks are permitted (192.168.x, 10.x, 172.16.x, 127.x). Public targets are automatically rejected by security policy.
                  </span>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Console Execution Output */}
                {logLines.length > 0 && (
                  <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-slate-300">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2 text-slate-500">
                      <span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" /> Scan Console</span>
                      {running && <Badge tone="default" pulse>Active</Badge>}
                      {done && scan.data?.status === "completed" && <Badge tone="normal">Completed</Badge>}
                      {done && scan.data?.status === "failed" && <Badge tone="critical">Failed</Badge>}
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {logLines.map((line, idx) => (
                        <div key={idx} className="text-cyan-400/90">{line}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="mt-4 flex justify-end gap-3 border-t border-slate-800 pt-4 shrink-0">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel / Reset
                </Button>
                <Button variant="default" onClick={() => start.mutate()} disabled={running}>
                  {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4" />}
                  {running ? "Scanning Subnet…" : "Run Discovery Scan"}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
