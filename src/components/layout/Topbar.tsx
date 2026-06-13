import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Menu, Moon, Search, Sun, UserCircle2 } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/app/store";
import { roleLabels } from "@/lib/app/mock-data";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/app/StatusBadge";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user, alerts, theme, toggleTheme, logout } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const newAlerts = alerts.filter((a) => a.status === "Yangi");
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu}><Menu className="h-5 w-5" /></Button>
      <div className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Qidirish..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 bg-card" />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {newAlerts.length > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">{newAlerts.length}</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Soʻnggi ogohlantirishlar</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {alerts.slice(0, 6).map((a) => (
              <DropdownMenuItem key={a.id} onClick={() => navigate({ to: "/app/alerts" })} className="flex flex-col items-start gap-1 py-2">
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-sm font-medium">{a.title}</span>
                  <StatusBadge status={a.level} />
                </div>
                <span className="text-xs text-muted-foreground line-clamp-1">{a.message}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">{user.fullName.charAt(0)}</div>
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-medium leading-tight">{user.fullName}</p>
                  <p className="text-[10px] text-muted-foreground">{roleLabels[user.role]}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel><div className="flex flex-col"><span>{user.fullName}</span><span className="text-xs text-muted-foreground">{user.email}</span></div></DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link to="/app/profile" className="gap-2"><UserCircle2 className="h-4 w-4" /> Profil</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { logout(); navigate({ to: "/login" }); }} className="gap-2 text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" /> Chiqish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
