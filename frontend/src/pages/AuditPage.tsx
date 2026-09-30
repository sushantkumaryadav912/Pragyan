import { useState, useEffect } from "react";
import { ShieldCheck, UserCheck, RefreshCw, FileText } from "lucide-react";


import { api } from "../lib/api";
import type { AuditLog } from "../lib/types";

export function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  async function loadAuditLogs() {
    setLoading(true);
    try {
      const data = await api.listAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-xl border border-slate-800 backdrop-blur">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Non-Repudiable Security Audit Trail</h1>
              <p className="text-sm text-slate-400">Compliance & Regulatory Operational Action Audit Logs</p>
            </div>
          </div>
        </div>

        <button
          onClick={loadAuditLogs}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition flex items-center space-x-2 text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          <span>System & Security Operations Audit History</span>
        </h2>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading audit records...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-slate-500">
            No audit log records recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 pt-2">Timestamp (UTC)</th>
                  <th className="pb-3 pt-2">User</th>
                  <th className="pb-3 pt-2">Action</th>
                  <th className="pb-3 pt-2">Target</th>
                  <th className="pb-3 pt-2">Status</th>
                  <th className="pb-3 pt-2">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-950/40 transition">
                    <td className="py-3 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-3 font-bold text-indigo-400 flex items-center space-x-1.5">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{log.username}</span>
                    </td>
                    <td className="py-3 font-bold text-slate-200">{log.action}</td>
                    <td className="py-3 text-slate-300 font-semibold">{log.target || "N/A"}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === "SUCCESS"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 max-w-md truncate">{log.details || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
