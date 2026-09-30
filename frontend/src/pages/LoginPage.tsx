import { useState, useEffect } from "react";
import { Lock, User, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@pragyan.internal");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />

        {/* Official Pragyan Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-1">
            <img
              src="/Pragyan_Logo.png"
              alt="Pragyan"
              className="h-16 w-auto object-contain drop-shadow-[0_0_20px_rgba(0,240,255,0.5)]"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">Security Operations Console</h1>
            <p className="text-xs text-slate-400">Intelligent Network Security Monitoring, Detection & Response</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-mono font-semibold text-slate-400 mb-1">Account Email</label>
            <div className="relative">
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-cyan-500 transition"
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
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                placeholder="••••••••"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm rounded-lg shadow-lg shadow-cyan-500/20 transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? "Verifying Firebase Token..." : "Sign In to SOC Console"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-[11px] font-mono text-slate-500 border-t border-slate-800/80 pt-4">
          Default Lab Credentials: <span className="text-cyan-400 font-semibold">admin@pragyan.internal</span> / <span className="text-cyan-400 font-semibold">admin123</span>
        </div>
      </div>
    </div>
  );
}
