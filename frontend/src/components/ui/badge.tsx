import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "critical" | "high" | "medium" | "low" | "normal" | "muted";

const tones: Record<Tone, string> = {
  default: "bg-primary/15 text-primary",
  critical: "bg-critical/15 text-critical",
  high: "bg-high/15 text-high",
  medium: "bg-medium/15 text-medium",
  low: "bg-low/15 text-low",
  normal: "bg-normal/15 text-normal",
  muted: "bg-muted text-muted-foreground",
};

export function Badge({
  tone = "default",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
