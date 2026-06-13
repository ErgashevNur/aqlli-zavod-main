import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { OctagonAlert, Pause, Play, RefreshCw, Wrench } from "lucide-react";
import { useApp } from "@/lib/app/store";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { ConfirmDialog } from "@/components/app/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { EmptyAccess } from "@/components/app/EmptyAccess";
import { rolePermissions } from "@/lib/app/mock-data";
import type { MachineStatus } from "@/lib/app/types";
import { toast } from "sonner";
export const Route = createFileRoute("/app/control")({ component: Control });
function Control() {
  const { user, machines, lines, setMachineStatus, logs } = useApp();
  const [pending, setPending] = useState<{ id: string; status: MachineStatus; label: string; danger?: boolean } | null>(null);
  if (!user || !rolePermissions[user.role].includes("control")) return <EmptyAccess />;
  const history = logs.filter(l => l.category === "device").slice(0, 12);
  return (
    <div>
      <PageHeader title="Mashina boshqaruv paneli" description="Mashinalarga buyruq yuborish" />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          {machines.map(m => {
            const line = lines.find(l => l.id === m.lineId);
            return (
              <div key={m.id} className="glass rounded-xl p-4 shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><p className="text-sm font-semibold">{m.name}</p><p className="text-xs text-muted-foreground">{line?.name} · {m.operator}</p></div>
                  <div className="flex items-center gap-3"><span className="text-xs text-muted-foreground">Samar.: {m.efficiency}%</span><StatusBadge status={m.status} pulse={m.status === "faol"} /></div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setPending({ id: m.id, status: "faol", label: "Ishga tushirish" })}><Play className="h-3.5 w-3.5" /> Ishga tushirish</Button>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setPending({ id: m.id, status: "to'xtagan", label: "To'xtatish", danger: true })}><Pause className="h-3.5 w-3.5" /> To'xtatish</Button>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setPending({ id: m.id, status: "faol", label: "Qayta yoqish" })}><RefreshCw className="h-3.5 w-3.5" /> Restart</Button>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setPending({ id: m.id, status: "xizmatda", label: "Xizmat rejimi" })}><Wrench className="h-3.5 w-3.5" /> Xizmat</Button>
                  <Button size="sm" variant="destructive" className="gap-1.5" onClick={() => setPending({ id: m.id, status: "to'xtagan", label: "FAVQULODDA TO'XTATISH", danger: true })}><OctagonAlert className="h-3.5 w-3.5" /> Favqulodda</Button>
                </div>
              </div>);
          })}
        </div>
        <div className="glass rounded-xl p-4 shadow-card">
          <h3 className="text-sm font-semibold">Buyruqlar tarixi</h3>
          <ul className="mt-3 space-y-2">{history.map(l => (
            <li key={l.id} className="rounded-lg border border-border bg-card/60 p-2 text-xs">
              <p className="font-medium">{l.action}</p><p className="text-muted-foreground">{l.target} · {l.actor}</p>
              <p className="text-[10px] text-muted-foreground">{new Date(l.at).toLocaleString("uz-UZ")}</p>
            </li>))}{history.length === 0 && <li className="text-xs text-muted-foreground">Buyruqlar yo'q</li>}</ul>
        </div>
      </div>
      <ConfirmDialog open={!!pending} onOpenChange={v => !v && setPending(null)} title={pending?.label ?? ""} description="Buyruqni tasdiqlaysizmi?" destructive={pending?.danger} confirmText="Yuborish"
        onConfirm={() => { if (pending) { setMachineStatus(pending.id, pending.status); toast.success(`${pending.label} — yuborildi`); } }} />
    </div>
  );
}
