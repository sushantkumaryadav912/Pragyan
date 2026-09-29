import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScanDialog } from "@/components/ScanDialog";
import { formatDate } from "@/lib/utils";

function riskTone(score: number) {
  if (score >= 90) return "critical" as const;
  if (score >= 75) return "high" as const;
  if (score >= 50) return "medium" as const;
  if (score >= 25) return "low" as const;
  return "normal" as const;
}

export function Devices() {
  const nav = useNavigate();
  const { data, isLoading, error } = useQuery({ queryKey: ["devices"], queryFn: api.listDevices });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Devices</h1>
        <ScanDialog />
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">IP</th>
              <th className="px-4 py-3">Hostname</th>
              <th className="px-4 py-3">MAC</th>
              <th className="px-4 py-3">OS</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Risk</th>
              <th className="px-4 py-3">Last Seen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-critical">
                  {(error as Error).message}
                </td>
              </tr>
            )}
            {data?.length === 0 && !isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                  No devices discovered yet.
                </td>
              </tr>
            )}
            {data?.map((d) => (
              <tr
                key={d.id}
                onClick={() => nav(`/devices/${d.id}`)}
                className="cursor-pointer hover:bg-muted/40"
              >
                <td className="px-4 py-3 font-mono">
                  <div className="flex items-center gap-2">
                    {d.ip}
                    {d.is_new && <Badge tone="low">NEW</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3">{d.hostname ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs">{d.mac ?? "—"}</td>
                <td className="px-4 py-3">{d.os ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge tone={d.status === "up" ? "normal" : "muted"}>{d.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={riskTone(d.risk_score)}>{d.risk_score}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(d.last_seen)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
