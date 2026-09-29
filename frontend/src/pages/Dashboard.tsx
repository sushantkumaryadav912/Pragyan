import { useQuery } from "@tanstack/react-query";
import { HardDrive, Wifi, Network, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScanDialog } from "@/components/ScanDialog";
import { formatDate } from "@/lib/utils";

function Stat({ icon: Icon, label, value }: { icon: typeof HardDrive; label: string; value: string | number }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const devices = useQuery({ queryKey: ["devices"], queryFn: api.listDevices });
  const scans = useQuery({ queryKey: ["scans"], queryFn: api.listScans });

  const list = devices.data ?? [];
  const online = list.filter((d) => d.status === "up").length;
  const lastScan = scans.data?.[0];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Overview</h1>
          <p className="text-sm text-muted-foreground">Network detection & response console</p>
        </div>
        <ScanDialog />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={HardDrive} label="Devices" value={list.length} />
        <Stat icon={Wifi} label="Online" value={online} />
        <Stat icon={Network} label="New Devices" value={list.filter((d) => d.is_new).length} />
        <Stat
          icon={Clock}
          label="Last Scan"
          value={lastScan ? lastScan.status : "—"}
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recently Seen Devices</CardTitle>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No devices yet. Run a scan to discover assets.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {list.slice(0, 8).map((d) => (
                <div key={d.id} className="flex items-center justify-between py-2 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-mono">{d.ip}</span>
                    {d.hostname && <span className="text-muted-foreground">{d.hostname}</span>}
                    {d.is_new && <Badge tone="low">NEW</Badge>}
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(d.last_seen)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
