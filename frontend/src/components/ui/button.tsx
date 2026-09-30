import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "cyan" | "danger" | "emerald";
  size?: "default" | "sm" | "xs" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)] active:scale-[0.98]",
      cyan: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500/30 hover:border-cyan-400 active:scale-[0.98]",
      outline: "border border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-600 active:scale-[0.98]",
      ghost: "bg-transparent text-slate-300 hover:bg-slate-800/60 hover:text-white",
      danger: "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 hover:border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)] active:scale-[0.98]",
      emerald: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 active:scale-[0.98]",
    };

    const sizes = {
      default: "h-9 px-4 text-sm rounded-lg",
      sm: "h-8 px-3 text-xs rounded-md",
      xs: "h-7 px-2.5 text-xs rounded",
      icon: "h-9 w-9 p-0 rounded-lg justify-center",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

