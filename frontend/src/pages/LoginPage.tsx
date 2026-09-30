import { useState } from "react";
import { Lock, User, AlertCircle, ArrowRight, Flame } from "lucide-react";


import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@pragyan.internal");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Firebase Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 flex items-center justify-center p-4 cyber-grid-bg">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur space-y-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400 mb-2">
            <Flame className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Pragyan NDR Platform</h1>
          <p className="text-xs text-slate-400">Firebase Authenticated SOC Control Plane</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-mono font-semibold text-slate-400 mb-1">Email / Account</label>
            <div className="relative">
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-amber-500 transition"
                placeholder="admin@pragyan.internal"
              />
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-mono font-semibold text-slate-400 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-amber-500 transition"
                placeholder="••••••••"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-sm rounded-lg shadow-lg shadow-amber-500/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? "Verifying Firebase Token..." : "Firebase Sign In"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-[11px] font-mono text-slate-500 border-t border-slate-800/80 pt-4">
          Firebase Auth Account: <span className="text-amber-400">admin@pragyan.internal</span> / <span className="text-amber-400">admin123</span>
        </div>
      </div>
    </div>
  );
}
