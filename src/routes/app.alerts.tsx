import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/app/store";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { AlertStatus } from "@/lib/app/types";

export const Route = createFileRoute("/app/alerts")({ component: Alerts });

function Alerts() {
  const { alerts, setAlertStatus } = useApp();
  const [level, setLevel] = useState("all"); const [status, setStatus] = useState("all");
  const filtered = alerts.filter(a => (level === "all" || a.level === level) && (status === "all" || a.status === status));
  return (
    <div>
      <PageHeader title="Ogohlantirishlar" description="Real-time alertlar va ularning holati" />
      <div className="glass rounded-xl p-4 shadow-card">
        <div className="flex flex-wrap gap-2">
          <Select value={level} onValueChange={setLevel}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">Barcha daraja</SelectItem>{["Past","O'rta","Yuqori","Kritik"].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select>
          <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">Barcha holat</SelectItem>{["Yangi","Jarayonda","Hal qilindi"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
          <span className="ml-auto text-xs text-muted-foreground self-center">{filtered.length} ta alert</span>
        </div>
        <div className="mt-4 space-y-2">
          {filtered.map(a => (
            <div key={a.id} className="rounded-lg border border-border bg-card/60 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">{a.title}</p>
                    <StatusBadge status={a.level} /><StatusBadge status={a.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{a.message}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{a.source} · {new Date(a.createdAt).toLocaleString("uz-UZ")}</p>
                </div>
                <div className="flex gap-2">
                  {a.status !== "Jarayonda" && a.status !== "Hal qilindi" && <Button size="sm" variant="outline" onClick={() => { setAlertStatus(a.id, "Jarayonda" as AlertStatus); toast.success("Jarayonga olindi"); }}>Jarayonga olish</Button>}
                  {a.status !== "Hal qilindi" && <Button size="sm" onClick={() => { setAlertStatus(a.id, "Hal qilindi" as AlertStatus); toast.success("Hal qilindi"); }}>Hal qilindi</Button>}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Alertlar topilmadi</p>}
        </div>
      </div>
    </div>
  );
}
