import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/app/store";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyAccess } from "@/components/app/EmptyAccess";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, AlertTriangle, Cpu, ScrollText, User, Wrench } from "lucide-react";
export const Route = createFileRoute("/app/logs")({ component: Logs });
const ICONS = { auth: User, device: Cpu, alert: AlertTriangle, maintenance: Wrench, user: ScrollText } as const;
function Logs() {
  const { logs, user } = useApp();
  const [cat, setCat] = useState("all");
  if (!user || user.role !== "admin") return <EmptyAccess message="Tizim jurnali faqat Super Admin uchun mavjud" />;
  const filtered = logs.filter(l => cat === "all" || l.category === cat);
  return (
    <div>
      <PageHeader title="Tizim jurnali" description="Barcha faollik tarixi" />
      <div className="glass rounded-xl p-4 shadow-card">
        <Select value={cat} onValueChange={setCat}><SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Barcha kategoriya</SelectItem>{["auth","device","alert","maintenance","user"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
        <ul className="mt-4 space-y-2">
          {filtered.map(l => { const Icon = ICONS[l.category] ?? Activity; return (
            <li key={l.id} className="flex items-start gap-3 rounded-lg border border-border bg-card/60 p-3 text-sm">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{l.action}</p>
                <p className="text-xs text-muted-foreground">{l.actor} → {l.target}</p>
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(l.at).toLocaleString("uz-UZ")}</span>
            </li>);
          })}
        </ul>
      </div>
    </div>
  );
}
