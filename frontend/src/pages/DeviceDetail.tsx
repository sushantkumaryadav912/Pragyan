import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value ?? "—"}</div>
    </div>
  );
}

export function DeviceDetail() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["device", id],
    queryFn: () => api.getDevice(Number(id)),
    enabled: !!id,
  });

  return (
    <div className="p-6">
      <Link to="/devices" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Devices
      </Link>

      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {error && <p className="text-critical">{(error as Error).message}</p>}

      {data && (
        <>
          <div className="mb-6 flex items-center gap-3">
            <h1 className="font-mono text-2xl font-bold">{data.ip}</h1>
            {data.is_new && <Badge tone="low">NEW</Badge>}
            <Badge tone={data.status === "up" ? "normal" : "muted"}>{data.status}</Badge>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Device</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <Field label="Hostname" value={data.hostname} />
              <Field label="MAC" value={data.mac} />
              <Field label="OS" value={data.os} />
              <Field label="Risk Score" value={data.risk_score} />
              <Field label="First Seen" value={formatDate(data.first_seen)} />
              <Field label="Last Seen" value={formatDate(data.last_seen)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Open Ports & Services</CardTitle>
            </CardHeader>
            <CardContent>
              {data.services.length === 0 ? (
                <p className="text-sm text-muted-foreground">No open ports detected.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="py-2">Port</th>
                      <th className="py-2">Proto</th>
                      <th className="py-2">Service</th>
                      <th className="py-2">Product</th>
                      <th className="py-2">Version</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.services
                      .sort((a, b) => a.port - b.port)
                      .map((s) => (
                        <tr key={s.id}>
                          <td className="py-2 font-mono">{s.port}</td>
                          <td className="py-2">{s.protocol}</td>
                          <td className="py-2">{s.name ?? "—"}</td>
                          <td className="py-2">{s.product ?? "—"}</td>
                          <td className="py-2">{s.version ?? "—"}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
