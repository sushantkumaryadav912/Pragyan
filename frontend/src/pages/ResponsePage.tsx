import { useState, useEffect } from "react";
import { Zap, Globe, Lock, Play, Plus, RefreshCw } from "lucide-react";
import { api } from "../lib/api";
import type { ResponseAction, ThreatIntelIOC } from "../lib/types";

export function ResponsePage() {
  const [actions, setActions] = useState<ResponseAction[]>([]);
  const [iocs, setIocs] = useState<ThreatIntelIOC[]>([]);

  const [executing, setExecuting] = useState(false);
  const [actionType, setActionType] = useState<string>("ISOLATE_HOST");
  const [targetIp, setTargetIp] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  const [newIocValue, setNewIocValue] = useState<string>("");
  const [newIocType, setNewIocType] = useState<string>("IP");
  const [newIocCategory] = useState<string>("Command & Control");


  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [acts, intel] = await Promise.all([
        api.listResponseActions(),
        api.listThreatIntel()
      ]);
      setActions(acts);
      setIocs(intel);
    } catch (err) {
      console.error("Failed to load response data", err);
    }
  }


  async function handleExecuteAction(e: React.FormEvent) {
    e.preventDefault();
    if (!targetIp || !reason) return;
    setExecuting(true);
    try {
      const newAct = await api.executeResponseAction(actionType, targetIp, reason);
      setActions(prev => [newAct, ...prev]);
      setTargetIp("");
      setReason("");
    } catch (err) {
      console.error("Action execution failed", err);
    } finally {
      setExecuting(false);
    }
  }

  async function handleAddIoc(e: React.FormEvent) {
    e.preventDefault();
    if (!newIocValue) return;
    try {
      const created = await api.addThreatIntelIOC({
        ioc_type: newIocType,
        value: newIocValue,
        threat_category: newIocCategory,
        severity: "CRITICAL",
        source: "Analyst Workbench"
      });
      setIocs(prev => [created, ...prev]);
      setNewIocValue("");
    } catch (err) {
      console.error("Failed to add IOC", err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-xl border border-slate-800 backdrop-blur">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20 text-red-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Active Response & Threat Intelligence</h1>
              <p className="text-sm text-slate-400">Automated Remediation Execution Engine & Indicator of Compromise (IOC) Feeds</p>
            </div>
          </div>
        </div>

        <button
          onClick={loadData}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition flex items-center space-x-2 text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Action Dispatch Form & Log */}
        <div className="lg:col-span-6 space-y-6">
          {/* Dispatch Action Panel */}
          <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-red-400" />
              <span>Dispatch Automated Defense Action</span>
            </h2>

            <form onSubmit={handleExecuteAction} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">Action Mechanism</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-red-500"
                >
                  <option value="ISOLATE_HOST">Host Isolation (iptables drop ingress/egress)</option>
                  <option value="BLOCK_IP">Block IP Address (Subnet Null-route)</option>
                  <option value="TERMINATE_SESSION">Terminate Active Sessions (TCP RST)</option>
                  <option value="TRIGGER_DEEP_SCAN">Dispatch Deep Nmap Vulnerability Probe</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">Target Host / IP Address</label>
                <input
                  type="text"
                  placeholder="e.g. 192.168.1.45"
                  value={targetIp}
                  onChange={(e) => setTargetIp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">Remediation Justification / Incident ID</label>
                <input
                  type="text"
                  placeholder="e.g. Correlated INC-1042 DNS C2 Channel"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={executing || !targetIp || !reason}
                className="w-full py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-sm rounded-lg shadow-lg shadow-red-500/20 transition disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{executing ? "Executing Remediation..." : "Execute Defense Action"}</span>
              </button>
            </form>
          </div>

          {/* Action Log History */}
          <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
              <span>Remediation Action Audit Log</span>
              <span className="text-xs font-mono text-slate-500">{actions.length} executed</span>
            </h3>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {actions.map((act) => (
                <div key={act.id} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-1 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-red-400">{act.action_type}</span>
                    <span className="text-slate-300 font-semibold">{act.target_ip}</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{act.reason}</p>
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/60 flex items-center justify-between">
                    <span>{act.details}</span>
                    <span>{act.executed_at ? new Date(act.executed_at).toLocaleTimeString() : "Pending"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Threat Intel IOC Management */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              <span>Threat Intelligence IOC Catalog</span>
            </h2>

            {/* Quick Add IOC Form */}
            <form onSubmit={handleAddIoc} className="grid grid-cols-12 gap-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <select
                value={newIocType}
                onChange={(e) => setNewIocType(e.target.value)}
                className="col-span-3 bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="IP">IP</option>
                <option value="DOMAIN">DOMAIN</option>
                <option value="HASH">HASH</option>
              </select>

              <input
                type="text"
                placeholder="Indicator Value (e.g. mal-c2.net)"
                value={newIocValue}
                onChange={(e) => setNewIocValue(e.target.value)}
                className="col-span-6 bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs font-mono text-slate-200 focus:outline-none"
              />

              <button
                type="submit"
                disabled={!newIocValue}
                className="col-span-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold text-xs transition disabled:opacity-50 flex items-center justify-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add IOC</span>
              </button>
            </form>

            {/* IOC List Table */}
            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {iocs.map((ioc) => (
                <div key={ioc.id} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 font-mono">
                      <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[10px] font-bold">{ioc.ioc_type}</span>
                      <span className="font-bold text-slate-200">{ioc.value}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">{ioc.threat_category} — <span className="text-slate-500">Source: {ioc.source}</span></div>
                  </div>

                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded border bg-red-500/20 text-red-400 border-red-500/30">
                    {ioc.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
