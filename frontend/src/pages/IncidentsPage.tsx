import { useState, useEffect } from "react";
import { AlertOctagon, ShieldAlert, Activity, Zap, RefreshCw } from "lucide-react";


import { api } from "../lib/api";
import type { Incident } from "../lib/types";

export function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [correlating, setCorrelating] = useState(false);

  useEffect(() => {
    loadIncidents();
  }, []);

  async function loadIncidents() {
    setLoading(true);
    try {
      const data = await api.listIncidents();
      setIncidents(data);
      if (data.length > 0 && !selectedIncident) {
        setSelectedIncident(data[0]);
      }
    } catch (err) {
      console.error("Failed to load incidents", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCorrelate() {
    setCorrelating(true);
    try {
      await api.triggerCorrelation();
      await loadIncidents();
    } catch (err) {
      console.error("Correlation error", err);
    } finally {
      setCorrelating(false);
    }
  }

  async function updateStatus(status: string) {
    if (!selectedIncident) return;
    try {
      const updated = await api.updateIncidentStatus(selectedIncident.id, status);
      setSelectedIncident(updated);
      setIncidents(prev => prev.map(i => i.id === updated.id ? updated : i));
    } catch (err) {
      console.error("Status update error", err);
    }
  }

  const filteredIncidents = incidents.filter(i => {
    if (statusFilter === "ALL") return true;
    return i.status === statusFilter;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "HIGH":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "MEDIUM":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "OPEN":
      case "INVESTIGATING":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "CONTAINED":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      case "RESOLVED":
      case "CLOSED":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-xl border border-slate-800 backdrop-blur">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20 text-purple-400">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Security Incident Workbench</h1>
              <p className="text-sm text-slate-400">Automated Alert Correlation & Multi-Alert Security Incident Management</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleCorrelate}
            disabled={correlating}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg font-medium text-sm transition shadow-lg shadow-purple-500/20 disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${correlating ? "animate-spin" : ""}`} />
            <span>{correlating ? "Correlating..." : "Trigger Correlation Engine"}</span>
          </button>
          <button
            onClick={loadIncidents}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        {["ALL", "INVESTIGATING", "OPEN", "CONTAINED", "RESOLVED"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === st
                ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Incident List (Left Side) */}
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading security incidents...</div>
          ) : filteredIncidents.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400">
              No incidents matching filter criteria.
            </div>
          ) : (
            filteredIncidents.map((inc) => {
              const isSelected = selectedIncident?.id === inc.id;
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`p-4 rounded-xl border transition cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? "bg-slate-900 border-purple-500/50 shadow-lg shadow-purple-950/30"
                      : "bg-slate-900/50 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />
                  )}
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-mono text-purple-400 font-semibold">{inc.incident_number}</span>
                    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded border ${getSeverityBadge(inc.severity)}`}>
                      {inc.severity}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-200 mt-1 line-clamp-1">{inc.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{inc.summary}</p>

                  <div className="flex items-center justify-between mt-3 text-xs text-slate-500 font-mono">
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Activity className="w-3.5 h-3.5 text-purple-400" />
                      <span>{inc.target_host}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-sans font-bold ${getStatusBadge(inc.status)}`}>
                      {inc.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Incident Detail (Right Side) */}
        <div className="lg:col-span-7">
          {selectedIncident ? (
            <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-purple-400">{selectedIncident.incident_number}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase ${getSeverityBadge(selectedIncident.severity)}`}>
                      {selectedIncident.severity}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase ${getStatusBadge(selectedIncident.status)}`}>
                      {selectedIncident.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-100 mt-2">{selectedIncident.title}</h2>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateStatus("CONTAINED")}
                    className="px-3 py-1.5 bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600/30 rounded-lg text-xs font-semibold transition"
                  >
                    Contain
                  </button>
                  <button
                    onClick={() => updateStatus("RESOLVED")}
                    className="px-3 py-1.5 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 rounded-lg text-xs font-semibold transition"
                  >
                    Resolve
                  </button>
                </div>
              </div>

              {/* Summary & Target */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-500 uppercase font-semibold">Target Host</span>
                  <div className="text-base font-mono font-semibold text-slate-200 mt-1">{selectedIncident.target_host}</div>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-500 uppercase font-semibold">Risk Score</span>
                  <div className="text-base font-bold text-purple-400 mt-1">{selectedIncident.risk_score} / 100</div>
                </div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-500 uppercase font-semibold">Incident Narrative Summary</span>
                <p className="text-sm text-slate-300 mt-1 leading-relaxed">{selectedIncident.summary}</p>
              </div>

              {/* Timeline of Correlated Security Alerts */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-purple-400" />
                  <span>Correlated Alerts ({selectedIncident.alerts?.length || 0})</span>
                </h3>

                {selectedIncident.alerts && selectedIncident.alerts.length > 0 ? (
                  <div className="space-y-2">
                    {selectedIncident.alerts.map((al) => (
                      <div key={al.id} className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/80 flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-slate-200">{al.title}</span>
                            <span className="text-[10px] text-slate-500 font-mono">[{al.alert_type}]</span>
                          </div>
                          <p className="text-xs text-slate-400">{al.description}</p>
                        </div>
                        <div className="text-right text-[10px] text-slate-500 font-mono">
                          {new Date(al.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500 bg-slate-950/40 rounded-lg border border-slate-800">
                    No alert items attached.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900/40 rounded-xl border border-slate-800 text-slate-500">
              Select an incident from the workbench list to inspect narrative details and correlated timeline.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
