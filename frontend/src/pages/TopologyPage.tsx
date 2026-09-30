import { TopologyGraph } from "@/components/TopologyGraph";
import { Network, ShieldCheck, Cpu } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScanDialog } from "@/components/ScanDialog";


export function TopologyPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 font-mono">
            NETWORK TOPOLOGY ARCHITECTURE
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time interactive node visualization of discovered gateways, servers, workstations, and traffic links
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ScanDialog />
        </div>
      </div>

      {/* Top Topology Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card glow>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Topology Nodes</span>
              <span className="text-xl font-bold font-mono text-slate-100">6 Graph Nodes</span>
            </div>
          </CardContent>
        </Card>

        <Card glow>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Layer 3 Links</span>
              <span className="text-xl font-bold font-mono text-slate-100">7 Active Connections</span>
            </div>
          </CardContent>
        </Card>

        <Card glow>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Gateway Router</span>
              <span className="text-xl font-bold font-mono text-emerald-400">192.168.1.1 (pfSense)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Topology Visual Graph Component */}
      <TopologyGraph />
    </div>
  );
}
