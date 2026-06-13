import { createFileRoute } from "@tanstack/react-router";
import { Cpu, Factory, Gauge, User, Zap } from "lucide-react";
import { useApp } from "@/lib/app/store";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
export const Route = createFileRoute("/app/lines")({ component: Lines });
function Lines() {
  const { lines, machines, devices, alerts } = useApp();
  return (
    <div>
      <PageHeader title="Ishlab chiqarish liniyalari" description="Har bir liniyaning to'liq holati" />
      <div className="grid gap-5 md:grid-cols-2">
        {lines.map(l => {
          const mm = machines.filter(m => m.lineId === l.id);
          const dd = devices.filter(d => d.lineId === l.id);
          const aa = alerts.filter(a => a.lineId === l.id && a.status !== "Hal qilindi");
          return (
            <div key={l.id} className="glass rounded-xl p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div><div className="flex items-center gap-2"><Factory className="h-5 w-5 text-primary" /><h3 className="text-base font-semibold">{l.name}</h3></div>
                  <p className="mt-1 text-xs text-muted-foreground">{l.description}</p></div>
                <StatusBadge status={l.status} pulse={l.status === "faol"} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-border bg-card/60 p-3"><Gauge className="mb-1 h-4 w-4 text-success" /><p className="text-[10px] uppercase text-muted-foreground">Samaradorlik</p><p className="text-lg font-semibold">{l.productivity}%</p></div>
                <div className="rounded-lg border border-border bg-card/60 p-3"><Zap className="mb-1 h-4 w-4 text-warning" /><p className="text-[10px] uppercase text-muted-foreground">Energiya</p><p className="text-lg font-semibold">{l.energy} kWh</p></div>
                <div className="rounded-lg border border-border bg-card/60 p-3"><Cpu className="mb-1 h-4 w-4 text-info" /><p className="text-[10px] uppercase text-muted-foreground">Qurilmalar</p><p className="text-lg font-semibold">{dd.length}</p></div>
                <div className="rounded-lg border border-border bg-card/60 p-3"><User className="mb-1 h-4 w-4 text-muted-foreground" /><p className="text-[10px] uppercase text-muted-foreground">Operator</p><p className="text-sm font-medium truncate">{l.operator}</p></div>
              </div>
              <div className="mt-4"><p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Mashinalar</p>
                <ul className="space-y-2">{mm.map(m => (
                  <li key={m.id} className="flex items-center justify-between rounded-lg border border-border bg-card/60 p-2 text-sm">
                    <div><p className="font-medium">{m.name}</p><p className="text-[11px] text-muted-foreground">{m.operator} · {m.uptimeHours} soat</p></div>
                    <div className="flex items-center gap-3"><span className="text-xs">{m.efficiency}%</span><StatusBadge status={m.status} /></div>
                  </li>))}</ul></div>
              {aa.length > 0 && <div className="mt-4 rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning"><p className="font-semibold">{aa.length} ta faol ogohlantirish</p></div>}
            </div>);
        })}
      </div>
    </div>
  );
}
