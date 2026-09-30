import { useState, useEffect } from "react";
import { Network, Server, Cpu, HardDrive, Radio } from "lucide-react";
import { DEMO_TOPOLOGY_NODES, DEMO_TOPOLOGY_LINKS } from "../lib/demoData";
import type { TopologyNode, TopologyLink, DeviceDetail } from "../lib/types";
import { api } from "../lib/api";

export function TopologyPage() {
  const [devices, setDevices] = useState<DeviceDetail[]>([]);
  const [nodes, setNodes] = useState<TopologyNode[]>(DEMO_TOPOLOGY_NODES);
  const [links, setLinks] = useState<TopologyLink[]>(DEMO_TOPOLOGY_LINKS);
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const fetched = await api.listDevices();
        if (fetched && fetched.length > 0) {
          setDevices(fetched as DeviceDetail[]);
          
          // Build topology graph dynamically from live devices
          const generatedNodes: TopologyNode[] = fetched.map((dev, idx) => {
            const isGateway = dev.ip.endsWith(".1") || idx === 0;
            const type = isGateway ? "gateway" : dev.hostname?.toLowerCase().includes("server") || dev.hostname?.toLowerCase().includes("soc") ? "server" : "workstation";
            const xPos = isGateway ? 500 : 150 + ((idx - 1) * 220) % 700;
            const yPos = isGateway ? 90 : 270 + (idx % 2 === 0 ? 0 : 40);
            return {
              id: `node-${dev.id}`,
              label: dev.hostname || dev.ip,
              type: type as any,
              ip: dev.ip,
              riskScore: dev.risk_score || 0,
              risk_score: dev.risk_score || 0,
              ports_count: (dev as any).services?.length || 1,
              status: dev.status === "up" ? "up" : "down",
              x: xPos,
              y: yPos
            };
          });

          const gatewayNode = generatedNodes.find(n => n.type === "gateway") || generatedNodes[0];
          const generatedLinks: TopologyLink[] = generatedNodes
            .filter(n => n.id !== gatewayNode.id)
            .map(n => ({
              source: gatewayNode.id,
              target: n.id,
              protocol: "TCP/IP",
              traffic: "low"
            }));

          setNodes(generatedNodes);
          setLinks(generatedLinks);
          setSelectedNode(gatewayNode);
        }
      } catch {
        /* ignore */
      }
    }
    loadData();
  }, []);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "gateway":
        return Network;
      case "server":
        return Server;
      case "workstation":
        return Cpu;
      case "iot":
        return Radio;
      default:
        return HardDrive;
    }
  };

  const getNodeColor = (score: number) => {
    if (score >= 70) return "border-red-500 bg-red-950/40 text-red-400 shadow-red-500/20";
    if (score >= 35) return "border-amber-500 bg-amber-950/40 text-amber-400 shadow-amber-500/20";
    return "border-emerald-500 bg-emerald-950/40 text-emerald-400 shadow-emerald-500/20";
  };

  const selectedDevice = devices.find(d => d.ip === selectedNode?.ip);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-xl border border-slate-800 backdrop-blur">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Interactive Network Topology Map</h1>
              <p className="text-sm text-slate-400">Real-time Asset Graph Visualization & Protocol Interconnection Matrix</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas & Details Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Topology Visual Map (SVG Canvas) */}
        <div className="lg:col-span-8 bg-slate-900/80 rounded-xl border border-slate-800 p-6 relative overflow-hidden min-h-[500px] flex flex-col justify-between">
          <div className="absolute top-4 left-4 z-10 flex items-center space-x-4 bg-slate-950/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-400">Low Risk</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-400">Medium Risk</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-slate-400">Critical / High Risk</span>
            </div>
          </div>

          <div className="w-full h-full relative my-8">
            <svg className="w-full h-[420px]" viewBox="0 0 1000 450">
              <defs>
                <linearGradient id="link-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Interconnection Lines */}
              {links.map((link, idx) => {
                const src = nodes.find((n) => n.id === link.source);
                const tgt = nodes.find((n) => n.id === link.target);
                if (!src || !tgt || src.x === undefined || src.y === undefined || tgt.x === undefined || tgt.y === undefined) return null;

                const isConnectedToSelected = selectedNode && (selectedNode.id === src.id || selectedNode.id === tgt.id);

                return (
                  <g key={idx}>
                    <line
                      x1={src.x}
                      y1={src.y}
                      x2={tgt.x}
                      y2={tgt.y}
                      stroke={isConnectedToSelected ? "#a855f7" : "#334155"}
                      strokeWidth={isConnectedToSelected ? "2.5" : "1.5"}
                      strokeDasharray={link.traffic === "high" ? "none" : "4 4"}
                      className="transition-all duration-300"
                    />
                    <text
                      x={(src.x + tgt.x) / 2}
                      y={(src.y + tgt.y) / 2 - 6}
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {link.protocol}
                    </text>
                  </g>
                );
              })}

              {/* Node Render */}
              {nodes.map((node) => {
                if (node.x === undefined || node.y === undefined) return null;
                const IconComp = getNodeIcon(node.type);
                const isSelected = selectedNode?.id === node.id;
                const strokeColor = node.risk_score >= 70 ? "#ef4444" : node.risk_score >= 35 ? "#f59e0b" : "#10b981";

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer group"
                  >
                    <circle
                      r={isSelected ? "26" : "22"}
                      fill="#0f172a"
                      stroke={strokeColor}
                      strokeWidth={isSelected ? "3" : "2"}
                      className="transition-all duration-300 group-hover:r-[26]"
                    />
                    <foreignObject x="-12" y="-12" width="24" height="24">
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <IconComp className="w-4 h-4" />
                      </div>
                    </foreignObject>

                    <text
                      y="38"
                      fill="#cbd5e1"
                      fontSize="11"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {node.label}
                    </text>
                    <text
                      y="50"
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {node.ip}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Node Details Side Panel */}
        <div className="lg:col-span-4 bg-slate-900/80 rounded-xl border border-slate-800 p-6 space-y-6">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs uppercase font-mono text-indigo-400 font-semibold">{selectedNode.type}</span>
                  <h3 className="text-lg font-bold text-slate-100">{selectedNode.label}</h3>
                </div>
                <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold font-mono ${getNodeColor(selectedNode.risk_score)}`}>
                  Score: {selectedNode.risk_score}
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-500">IP Address:</span>
                  <span className="text-slate-200">{selectedNode.ip}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-emerald-400 font-semibold uppercase">{selectedNode.status}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-500">Active Ports:</span>
                  <span className="text-slate-200">{selectedNode.ports_count} detected</span>
                </div>
              </div>

              {/* Exposed Services */}
              {selectedDevice && selectedDevice.services && (
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-bold text-slate-400">Open Network Services</h4>
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                    {selectedDevice.services.map((svc) => (
                      <div key={svc.id} className="p-2 bg-slate-950/60 rounded border border-slate-800/80 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono text-indigo-300 font-semibold">{svc.port}/{svc.protocol}</span>
                          <span className="text-slate-400 ml-2">{svc.name || "unknown"}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{svc.product || ""}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">
              Click any network node in the graph map to view technical telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
