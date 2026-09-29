import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, HardDrive, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { section: "Overview", items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  { section: "Network", items: [{ to: "/devices", label: "Devices", icon: HardDrive }] },
];

export function AppShell() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 border-r border-border bg-card">
        <div className="flex items-center gap-2 px-5 py-4 text-lg font-bold tracking-wide">
          <Shield className="h-5 w-5 text-primary" />
          PRAGYAN
        </div>
        <nav className="px-3 py-2">
          {nav.map((group) => (
            <div key={group.section} className="mb-4">
              <div className="px-2 pb-1 text-xs uppercase tracking-wider text-muted-foreground">
                {group.section}
              </div>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-md px-2 py-2 text-sm",
                      isActive ? "bg-primary/15 text-primary" : "text-foreground hover:bg-muted",
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
