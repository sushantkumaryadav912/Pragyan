import { useEffect, useState } from "react";
import { Radar } from "lucide-react";


interface RadarSweepProps {
  active?: boolean;
  discoveredCount?: number;
  onScanClick?: () => void;
}

export function RadarSweep({ active = true, discoveredCount = 6, onScanClick }: RadarSweepProps) {
  const [blips, setBlips] = useState<Array<{ id: number; x: number; y: number; opacity: number }>>([]);

  useEffect(() => {
    // Generate random radar blips
    const points = Array.from({ length: 5 }).map((_, i) => {
      const angle = (i * 72 + Math.random() * 20) * (Math.PI / 180);
      const dist = 30 + Math.random() * 45; // percentage radius
      return {
        id: i,
        x: 50 + dist * Math.cos(angle),
        y: 50 + dist * Math.sin(angle),
        opacity: 0.6 + Math.random() * 0.4,
      };
    });
    setBlips(points);
  }, [discoveredCount]);

  return (
    <div className="relative flex flex-col items-center justify-center p-4 rounded-xl border border-cyan-500/20 bg-slate-950/80 backdrop-blur-md overflow-hidden group shadow-[0_0_25px_rgba(0,240,255,0.05)]">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Concentric Circles */}
        <div className="absolute w-44 h-44 rounded-full border border-cyan-500/20" />
        <div className="absolute w-32 h-32 rounded-full border border-cyan-500/30" />
        <div className="absolute w-20 h-20 rounded-full border border-cyan-500/40" />
        <div className="absolute w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f0ff]" />

        {/* Crosshair lines */}
        <div className="absolute w-full h-[1px] bg-cyan-500/20" />
        <div className="absolute h-full w-[1px] bg-cyan-500/20" />

        {/* Sweeping Cone */}
        {active && (
          <div className="absolute inset-0 rounded-full animate-radar pointer-events-none">
            <div
              className="w-1/2 h-1/2 absolute top-0 right-0 origin-bottom-left"
              style={{
                background: "conic-gradient(from 0deg at 0% 100%, rgba(0, 240, 255, 0.4) 0deg, rgba(0, 240, 255, 0.05) 45deg, transparent 60deg)",
              }}
            />
          </div>
        )}

        {/* Blips */}
        {blips.map((blip) => (
          <div
            key={blip.id}
            className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-ping duration-1000"
            style={{
              top: `${blip.y}%`,
              left: `${blip.x}%`,
              opacity: blip.opacity,
            }}
          />
        ))}

        {/* High Risk Blip */}
        <div
          className="absolute w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-pulse"
          style={{ top: "30%", left: "68%" }}
          title="High Risk Host Detected"
        />
      </div>

      <div className="mt-4 flex flex-col items-center gap-1 z-10 text-center">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
          <Radar className="w-4 h-4 animate-spin text-cyan-400" />
          <span>NDR Active Scanner</span>
        </div>
        <div className="text-2xl font-bold text-slate-100 font-mono">
          {discoveredCount} <span className="text-xs font-sans text-slate-400 font-normal">Active Targets</span>
        </div>

        {onScanClick && (
          <button
            onClick={onScanClick}
            className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 underline font-medium cursor-pointer"
          >
            Launch CIDR Scan &rarr;
          </button>
        )}
      </div>
    </div>
  );
}
