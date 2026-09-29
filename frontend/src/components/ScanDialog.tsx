import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Radar, X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ScanDialog() {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState("127.0.0.1/32");
  const [scanId, setScanId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const qc = useQueryClient();

  const start = useMutation({
    mutationFn: () => api.startScan(target),
    onSuccess: (scan) => {
      setError(null);
      setScanId(scan.id);
    },
    onError: (e: Error) => setError(e.message),
  });

  // Poll the running scan until it finishes.
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

  // Refresh device/scan lists once a scan finishes.
  useEffect(() => {
    if (done && scanId !== null) {
      qc.invalidateQueries({ queryKey: ["devices"] });
      qc.invalidateQueries({ queryKey: ["scans"] });
    }
  }, [done, scanId, qc]);

  const running = start.isPending || (scanId !== null && !done);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Radar className="h-4 w-4" /> Start Scan
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Network Scan</h2>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <label className="mb-1 block text-xs text-muted-foreground">Target (CIDR or host)</label>
            <Input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="192.168.1.0/24"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Only authorized private ranges are permitted (e.g. 192.168.x, 10.x, 127.x).
            </p>
            {error && <p className="mt-2 text-xs text-critical">{error}</p>}
            {scan.data && (
              <p className="mt-3 text-sm">
                Status: <span className="font-medium">{scan.data.status}</span>
                {scan.data.status === "completed" && ` — ${scan.data.hosts_found} host(s) found`}
                {scan.data.error && <span className="text-critical"> — {scan.data.error}</span>}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
              <Button onClick={() => start.mutate()} disabled={running}>
                {running && <Loader2 className="h-4 w-4 animate-spin" />}
                {running ? "Scanning…" : "Scan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
