import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  glow = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { glow?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md shadow-lg transition-all duration-200",
        glow && "hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(0,240,255,0.1)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pb-3 flex items-center justify-between", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-sm font-semibold tracking-wider text-slate-300 uppercase flex items-center gap-2", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-2", className)} {...props} />;
}

