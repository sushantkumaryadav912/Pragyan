import { useState } from "react";
import { Settings, User, Shield, Key, Lock, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function SettingsPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    setSaved(true);
    setCurrentPassword("");
    setNewPassword("");
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-xl border border-slate-800 backdrop-blur">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20 text-cyan-400">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 tracking-tight">User Account & SOC Settings</h1>
              <p className="text-sm text-slate-400">Manage Profile Credentials, RBAC Roles & Security Preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: User Profile Details */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <User className="w-5 h-5 text-cyan-400" />
              <span>User Profile & Identity</span>
            </h2>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-500">Username:</span>
                <span className="text-slate-200 font-bold">{user?.username || "admin"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-500">Email Address:</span>
                <span className="text-slate-200">{user?.email || "admin@pragyan.internal"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-500">Assigned Role:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  {user?.role || "ADMIN"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Account Status:</span>
                <span className="text-emerald-400 font-semibold uppercase">ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Lock className="w-5 h-5 text-cyan-400" />
              <span>Update Security Password</span>
            </h2>

            {saved && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Password updated successfully.</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={!newPassword}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-lg transition disabled:opacity-50"
              >
                Save New Password
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Role Privileges & Session Details */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              <span>Role Permissions Matrix</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between font-bold text-cyan-400 font-mono">
                  <span>ADMINISTRATOR (ADMIN)</span>
                  <span className="text-[10px] text-emerald-400 uppercase">Your Role</span>
                </div>
                <p className="text-slate-400 text-[11px]">Full system access: scan configuration, user management, response action execution, threat intel authoring, audit log inspection.</p>
              </div>

              <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/60 space-y-1 opacity-70">
                <div className="font-bold text-purple-400 font-mono">ANALYST</div>
                <p className="text-slate-400 text-[11px]">Incident investigation, alert triage, executing permitted response actions, viewing telemetry.</p>
              </div>

              <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/60 space-y-1 opacity-70">
                <div className="font-bold text-slate-400 font-mono">VIEWER</div>
                <p className="text-slate-400 text-[11px]">Read-only access to executive dashboards, topology maps, and assessment reports.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
              <Key className="w-4 h-4 text-amber-400" />
              <span>Active Firebase / JWT Token</span>
            </h3>
            <p className="text-xs text-slate-400">Bearer authorization token issued for the current session:</p>
            <div className="p-3 bg-slate-950 rounded border border-slate-800 font-mono text-[10px] text-slate-400 break-all max-h-24 overflow-y-auto">
              {localStorage.getItem("pragyan_jwt") || "mock_firebase_jwt_token_admin"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
