import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Bell, Cloud, Cpu, Database, Network, Server, Sliders } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
export const Route = createFileRoute("/app/architecture")({ component: Arch });
const NODES = [
  { i: Cpu, t: "IoT sensorlar", d: "Harorat, vibratsiya, energiya, bosim..." },
  { i: Sliders, t: "Edge kontroller", d: "Birinchi filtrlash va lokal qaror" },
  { i: Network, t: "IoT Gateway", d: "Protokol konvertatsiya (MQTT, OPC-UA)" },
  { i: Server, t: "API Server", d: "Bulutli ishlov berish va xizmatlar" },
  { i: Database, t: "Ma'lumotlar bazasi", d: "Time-series va tarixiy yozuvlar" },
  { i: BarChart3, t: "Tahlil dvigateli", d: "Qoidalar + AI/ML model" },
  { i: Bell, t: "Bildirishnoma", d: "Alert, email, push" },
  { i: Cloud, t: "Dashboard", d: "Real-time UI rahbar uchun" },
];
function Arch() {
  return (
    <div>
      <PageHeader title="Tizim arxitekturasi" description="Sensordan boshqaruv buyrug'igacha bo'lgan ma'lumot oqimi" />
      <div className="glass rounded-2xl p-6 shadow-card">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {NODES.map((n, i) => { const Icon = n.i; return (
            <div key={n.t} className="relative rounded-xl border border-border bg-card p-4 text-center">
              <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
              <p className="mt-2 text-sm font-semibold">{n.t}</p><p className="mt-1 text-[11px] text-muted-foreground">{n.d}</p>
              {(i + 1) % 4 !== 0 && i < NODES.length - 1 && <ArrowRight className="absolute -right-2.5 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-muted-foreground sm:block" />}
            </div>
          ); })}
        </div>
        <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4 text-center text-sm">
          <p className="font-semibold">Ma'lumot oqimi</p>
          <p className="mt-1 text-muted-foreground">Sensorlar → Kontroller → Gateway → Server → Ma'lumotlar bazasi → Dashboard → Tahlil → Boshqaruv buyrug'i</p>
        </div>
      </div>
    </div>
  );
}
