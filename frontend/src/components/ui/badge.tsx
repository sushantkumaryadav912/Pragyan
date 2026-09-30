import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "critical" | "high" | "medium" | "low" | "normal" | "muted" | "purple";

const tones: Record<Tone, string> = {
  default: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
  critical: "bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]",
  high: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  medium: "bg-yellow-500/15 text-yellow-300 border border-yellow-500/20",
  low: "bg-sky-500/15 text-sky-400 border border-sky-500/20",
  normal: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  muted: "bg-slate-800 text-slate-400 border border-slate-700/50",
  purple: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
};

const pulseColors: Partial<Record<Tone, string>> = {
  critical: "bg-rose-400",
  high: "bg-amber-400",
  normal: "bg-emerald-400",
  default: "bg-cyan-400",
};

export function Badge({
  tone = "default",
  pulse = false,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone; pulse?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide backdrop-blur-sm transition-all",
        tones[tone],
        className,
      )}
      {...props}
    >
      {pulse && pulseColors[tone] && (
        <span className="relative flex h-2 w-2">
          <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", pulseColors[tone])} />
          <span className={cn("relative inline-flex rounded-full h-2 w-2", pulseColors[tone])} />
        </span>
      )}
      {children}
    </span>
  );
}

