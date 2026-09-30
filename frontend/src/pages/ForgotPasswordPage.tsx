import { useState, useEffect } from "react";
import { Mail, AlertCircle, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export function ForgotPasswordPage() {
  const { resetPassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(`Password reset email successfully sent to ${email}. Please check your inbox.`);
    } catch (err: any) {
      setError(err.message || "Failed to send password reset email.");
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
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">Reset Account Password</h1>
            <p className="text-xs text-slate-400">Enter your registered email to receive a password recovery link</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-mono font-semibold text-slate-400 mb-1">Registered Email Address</label>
            <div className="relative">
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                placeholder="analyst@pragyan.internal"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm rounded-lg shadow-lg shadow-cyan-500/20 transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? "Sending Recovery Email..." : "Send Password Reset Link"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs font-mono text-slate-400 border-t border-slate-800/80 pt-4">
          <Link to="/login" className="inline-flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
