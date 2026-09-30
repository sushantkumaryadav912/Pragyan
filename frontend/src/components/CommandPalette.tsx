import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, HardDrive, X, ArrowRight } from "lucide-react";

import { DEMO_DEVICES } from "@/lib/demoData";
import { Badge } from "@/components/ui/badge";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
        else onClose(); // parent toggles open
      }
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const filtered = DEMO_DEVICES.filter((d) => {
    const q = query.toLowerCase();
    return (
      d.ip.toLowerCase().includes(q) ||
      (d.hostname && d.hostname.toLowerCase().includes(q)) ||
      (d.os && d.os.toLowerCase().includes(q)) ||
      d.services.some((s) => s.name?.toLowerCase().includes(q) || String(s.port).includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-xl border border-slate-700/80 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 border-b border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-2" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search devices by IP, Hostname, OS, or Port (e.g. 192.168, SSH, 3389)..."
            className="w-full h-12 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-800/50">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No network assets found matching "{query}"
            </div>
          ) : (
            filtered.map((device) => (
              <div
                key={device.id}
                onClick={() => {
                  navigate(`/devices/${device.id}`);
                  onClose();
                }}
                className="p-3 flex items-center justify-between hover:bg-slate-800/60 rounded-lg cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 text-cyan-400 group-hover:bg-cyan-500/20">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-slate-100">{device.ip}</span>
                      {device.hostname && <span className="text-xs text-slate-400">({device.hostname})</span>}
                    </div>
                    <div className="text-xs text-slate-500">{device.os || "Unknown OS"} &bull; {device.services.length} open ports</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={device.risk_score >= 60 ? "critical" : "normal"}>Risk {device.risk_score}</Badge>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigation Shortcuts: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">Esc</kbd> to exit</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">&uarr; &darr;</kbd> navigate</span>
        </div>
      </div>
    </div>
  );
}
