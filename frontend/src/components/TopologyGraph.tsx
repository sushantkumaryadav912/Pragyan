import { useState } from "react";

import { DEMO_TOPOLOGY_NODES, DEMO_TOPOLOGY_LINKS } from "@/lib/demoData";
import type { TopologyNode } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Server, HardDrive, Cpu, ShieldAlert, Wifi, Activity } from "lucide-react";
import { riskTone } from "@/lib/utils";

const iconMap = {
  gateway: ShieldAlert,
  server: Server,
  workstation: Cpu,
  iot: Wifi,
  router: Activity,
  unknown: HardDrive,
};

export function TopologyGraph() {
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(DEMO_TOPOLOGY_NODES[1]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Canvas Node Graph Display */}
      <div className="lg:col-span-2 relative min-h-[460px] rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-md p-6 overflow-hidden flex flex-col justify-between shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        <div className="flex items-center justify-between z-10">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Interactive Network Map</h3>
            <p className="text-xs text-slate-400">Layer 3 topology visualization & traffic flows</p>
          </div>
          <Badge tone="purple" pulse>Live Topology</Badge>
        </div>

        {/* SVG Connections & Nodes */}
        <div className="relative w-full h-[360px] my-4">
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {DEMO_TOPOLOGY_LINKS.map((link, idx) => {
              const src = DEMO_TOPOLOGY_NODES.find((n) => n.id === link.source);
              const tgt = DEMO_TOPOLOGY_NODES.find((n) => n.id === link.target);
              if (!src || !tgt) return null;
              return (
                <g key={idx}>
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke="rgba(0, 240, 255, 0.25)"
                    strokeWidth="2"
                    strokeDasharray={link.traffic === "high" ? "4 4" : "0"}
                    className="animate-pulse"
                  />
                </g>
              );
            })}
          </svg>

          {/* Render Nodes */}
          {DEMO_TOPOLOGY_NODES.map((node) => {
            const Icon = iconMap[node.type] || HardDrive;
            const isSelected = selectedNode?.id === node.id;
            const tone = riskTone(node.risk_score);

            return (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node)}
                style={{ left: `${node.x}px`, top: `${node.y}px` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.4)] scale-110 z-20"
                    : "bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/50 hover:scale-105 z-10"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${isSelected ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-800 text-slate-300"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-slate-200">{node.label}</div>
                    <div className="text-[10px] font-mono text-slate-400">{node.ip}</div>
                  </div>
                </div>
                {node.risk_score > 50 && (
                  <div className="mt-1">
                    <Badge tone={tone}>{node.risk_score} Risk</Badge>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Controls / Legend */}
        <div className="flex items-center justify-between text-xs text-slate-400 z-10 border-t border-slate-800/80 pt-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Low Risk</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Medium</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> High Risk</span>
          </div>
          <div>Click node to inspect properties</div>
        </div>
      </div>

      {/* Node Inspector Drawer Side Panel */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-md p-5 flex flex-col justify-between shadow-xl">
        {selectedNode ? (
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h4 className="text-base font-semibold text-slate-100">{selectedNode.label}</h4>
                <p className="text-xs font-mono text-cyan-400">{selectedNode.ip}</p>
              </div>
              <Badge tone={riskTone(selectedNode.risk_score)}>
                Risk: {selectedNode.risk_score}
              </Badge>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/60">
                <span className="text-slate-400 block mb-1">Asset Category</span>
                <span className="font-semibold text-slate-200 capitalize">{selectedNode.type} Node</span>
              </div>

              <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/60">
                <span className="text-slate-400 block mb-1">Status & Exposure</span>
                <div className="flex items-center gap-2 font-mono text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{selectedNode.status.toUpperCase()} ({selectedNode.ports_count} active listening ports)</span>
                </div>
              </div>

              <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/60">
                <span className="text-slate-400 block mb-2">Connected Peers</span>
                <div className="space-y-1.5 font-mono">
                  {DEMO_TOPOLOGY_LINKS.filter((l) => l.source === selectedNode.id || l.target === selectedNode.id).map((l, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-900 px-2 py-1 rounded text-slate-300">
                      <span>{l.source === selectedNode.id ? l.target : l.source}</span>
                      <span className="text-cyan-400 text-[10px]">{l.protocol}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
            Select a network node from graph to view detailed breakdown
          </div>
        )}
      </div>
    </div>
  );
}
