import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, AlertTriangle, BarChart3, Boxes, Brain, Cog, Cpu, FileText, Gauge, LayoutDashboard, Network, ScrollText, ShieldCheck, Sliders, UserCog, Users, Wrench } from "lucide-react";
import { useApp } from "@/lib/app/store";
import { rolePermissions, roleLabels } from "@/lib/app/mock-data";
import { cn } from "@/lib/utils";

const NAV = [
  { key: "dashboard", label: "Bosh sahifa", to: "/app/dashboard", icon: LayoutDashboard },
  { key: "monitoring", label: "Real-time monitoring", to: "/app/monitoring", icon: Activity },
  { key: "devices", label: "IoT qurilmalar", to: "/app/devices", icon: Cpu },
  { key: "lines", label: "Ishlab chiqarish liniyalari", to: "/app/lines", icon: Boxes },
  { key: "control", label: "Mashina boshqaruvi", to: "/app/control", icon: Sliders },
  { key: "alerts", label: "Ogohlantirishlar", to: "/app/alerts", icon: AlertTriangle },
  { key: "maintenance", label: "Texnik xizmat", to: "/app/maintenance", icon: Wrench },
  { key: "analytics", label: "Analitika", to: "/app/analytics", icon: BarChart3 },
  { key: "reports", label: "Hisobotlar", to: "/app/reports", icon: FileText },
  { key: "ai", label: "AI tavsiyalar", to: "/app/ai", icon: Brain },
  { key: "architecture", label: "Tizim arxitekturasi", to: "/app/architecture", icon: Network },
  { key: "users", label: "Foydalanuvchilar", to: "/app/users", icon: Users },
  { key: "logs", label: "Tizim jurnali", to: "/app/logs", icon: ScrollText },
  { key: "profile", label: "Profil", to: "/app/profile", icon: UserCog },
  { key: "settings", label: "Sozlamalar", to: "/app/settings", icon: Cog },
] as const;

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const allowed = user ? rolePermissions[user.role] : [];
  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="grid h-9 w-9 place-items-center rounded-lg gradient-primary shadow-glow">
          <Gauge className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">AQLLI-ZAVOD</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">IoT Platform</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-0.5">
          {NAV.filter((n) => allowed.includes(n.key)).map((n) => {
            const Icon = n.icon; const active = pathname === n.to;
            return (
              <li key={n.key}>
                <Link to={n.to} onClick={onNavigate}
                  className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground")}>
                  <Icon className="h-4 w-4 shrink-0" /><span className="truncate">{n.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {user && (
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">{user.fullName.charAt(0)}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.fullName}</p>
              <p className="truncate text-[11px] text-muted-foreground">{roleLabels[user.role]}</p>
            </div>
            <ShieldCheck className="h-4 w-4 text-success" />
          </div>
        </div>
      )}
    </aside>
  );
}
