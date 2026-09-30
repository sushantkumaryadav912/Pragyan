import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  HardDrive,
  Network,
  Activity,
  Search,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  Lock,
  LogOut,
  Settings,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { CommandPalette } from "@/components/CommandPalette";
import { ScanDialog } from "@/components/ScanDialog";
import { isDemoMode, setDemoMode } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";


const navGroups = [
  {
    section: "Operations",
    items: [
      { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { to: "/devices", label: "Asset Inventory", icon: HardDrive },
      { to: "/traffic", label: "Traffic Telemetry", icon: Activity },
      { to: "/topology", label: "Topology Map", icon: Network },
      { to: "/scans", label: "Scan Operations", icon: Activity },
    ],
  },
  {
    section: "Security & Detection",
    items: [
      { to: "/alerts", label: "Security Alerts", icon: ShieldAlert },
      { to: "/incidents", label: "Incident Triage", icon: AlertOctagon },
      { to: "/response", label: "Active Response", icon: Lock },
      { to: "/audit", label: "Audit Logs", icon: ShieldCheck },
    ],
  },
  {
    section: "Administration",
    items: [
      { to: "/settings", label: "User Settings", icon: Settings },
    ],
  },
];






export function AppShell() {
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [demoActive, setDemoActive] = useState(isDemoMode());
  const [clock, setClock] = useState(new Date().toLocaleTimeString());
  const location = useLocation();


  useEffect(() => {
    const timer = setInterval(() => setClock(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleDemo = () => {
    const next = !demoActive;
    setDemoActive(next);
    setDemoMode(next);
    window.location.reload();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Sidebar */}
      <aside
        className={cn(
          "relative flex flex-col border-r border-slate-800/80 bg-slate-950/90 backdrop-blur-xl transition-all duration-300 z-30",
          collapsed ? "w-16" : "w-64",
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-3.5 border-b border-slate-800/80">
          <NavLink to="/dashboard" className="flex items-center gap-2 overflow-hidden">
            <img
              src="/Pragyan_Logo.png"
              alt="Pragyan"
              className={cn(
                "object-contain drop-shadow-[0_0_14px_rgba(0,240,255,0.45)] transition-all duration-200",
                collapsed ? "h-8 w-8" : "h-11 w-auto max-w-[175px]"
              )}
            />
            {!collapsed && (
              <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
                NDR
              </span>
            )}
          </NavLink>




          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>


        {/* Navigation Section */}
        <nav className="flex-1 space-y-6 px-3 py-4 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.section} className="space-y-1">
              {!collapsed && (
                <div className="px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
                  {group.section}
                </div>
              )}
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 group",
                      isActive
                        ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                        : "text-slate-400 hover:bg-slate-900 hover:text-slate-200",
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer User Info & Logout Button */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 space-y-2">
          {!collapsed ? (
            <div className="flex items-center justify-between">
              <NavLink to="/settings" className="flex items-center space-x-2 overflow-hidden hover:opacity-80 transition">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs font-bold shrink-0">
                  {user?.username?.[0]?.toUpperCase() || "A"}
                </div>
                <div className="truncate text-left">
                  <div className="text-xs font-semibold text-slate-200 line-clamp-1">{user?.username || "admin"}</div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">{user?.role || "ADMIN"}</span>
                </div>
              </NavLink>

              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={logout}
              className="w-full flex justify-center p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

          {!collapsed && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> SOC Status
              </span>
              <span className="text-emerald-400 font-semibold uppercase">Active</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 z-20">
          <div className="flex items-center gap-4">
            {/* Quick Search Bar Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-400 hover:border-cyan-500/40 hover:text-slate-200 transition-colors w-64 cursor-pointer"
            >
              <Search className="h-3.5 w-3.5 text-cyan-400" />
              <span>Search assets, IPs, ports...</span>
              <kbd className="ml-auto px-1.5 py-0.5 text-[10px] bg-slate-800 rounded text-slate-400 font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Current Route Breadcrumb */}
            <span className="text-xs font-mono text-slate-500 hidden md:inline-block">
              pragyan://soc{location.pathname}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Demo Telemetry Toggle */}
            <button
              onClick={handleToggleDemo}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer",
                demoActive
                  ? "bg-purple-500/15 text-purple-300 border-purple-500/40"
                  : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200",
              )}
              title="Toggle rich simulated telemetry"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Demo Mode: {demoActive ? "ON" : "OFF"}</span>
            </button>

            {/* Clock */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
              <span className="text-cyan-400">UTC</span>
              <span>{clock}</span>
            </div>

            {/* Settings Quick Access Link */}
            <NavLink
              to="/settings"
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition flex items-center space-x-1 text-xs font-mono"
              title="User Account & SOC Settings"
            >
              <Settings className="w-4 h-4 text-cyan-400" />
            </NavLink>

            {/* Launch Scan Action Button */}
            <ScanDialog />
          </div>
        </header>

        {/* Dynamic Route View */}

        <main className="flex-1 overflow-y-auto p-6 bg-slate-950/40 cyber-grid-bg">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

