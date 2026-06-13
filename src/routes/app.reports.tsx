import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, Printer } from "lucide-react";
import { useMemo } from "react";
import { useApp } from "@/lib/app/store";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
export const Route = createFileRoute("/app/reports")({ component: Reports });
const REPORTS = [
  { id: "daily", name: "Kunlik hisobot", desc: "Bugungi ko'rsatkichlar va hodisalar" },
  { id: "weekly", name: "Haftalik hisobot", desc: "7 kunlik trendlar va taqqoslash" },
  { id: "monthly", name: "Oylik hisobot", desc: "30 kunlik agregatlar" },
  { id: "energy", name: "Energiya hisoboti", desc: "Sarf, taqsimot, tejash imkoniyatlari" },
  { id: "faults", name: "Nosozliklar hisoboti", desc: "Sodir bo'lgan nosozliklar tahlili" },
  { id: "maintenance", name: "Texnik xizmat hisoboti", desc: "Bajarilgan va rejadagi xizmatlar" },
  { id: "efficiency", name: "Ishlab chiqarish samaradorligi", desc: "OEE va KPI ko'rsatkichlari" },
];

function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function Reports() {
  const { lines, machines, alerts, tasks, history, readings, devices } = useApp();

  const energyByLine = useMemo(() => lines.map(l => ({
    name: l.name.split(":")[0],
    energiya: Math.round(readings[l.id]?.energy ?? l.energy),
    samaradorlik: Math.round(readings[l.id]?.productivity ?? l.productivity),
  })), [lines, readings]);

  const alertsBySeverity = useMemo(() => {
    const m: Record<string, number> = { "Past": 0, "O'rta": 0, "Yuqori": 0, "Kritik": 0 };
    alerts.forEach(a => { m[a.level] = (m[a.level] || 0) + 1; });
    return Object.entries(m).map(([level, count]) => ({ level, count }));
  }, [alerts]);

  const tasksByStatus = useMemo(() => {
    const m: Record<string, number> = {};
    tasks.forEach(t => { m[t.status] = (m[t.status] || 0) + 1; });
    return Object.entries(m).map(([status, count]) => ({ status, count }));
  }, [tasks]);

  const exportFor = (id: string, name: string) => {
    if (id === "energy") {
      downloadCSV(`${id}-hisobot.csv`, [["Liniya", "Energiya (kWh)", "Samaradorlik (%)"], ...energyByLine.map(r => [r.name, r.energiya, r.samaradorlik])]);
    } else if (id === "faults") {
      downloadCSV(`${id}-hisobot.csv`, [["Daraja", "Soni"], ...alertsBySeverity.map(r => [r.level, r.count])]);
    } else if (id === "maintenance") {
      downloadCSV(`${id}-hisobot.csv`, [["Vazifa", "Mas'ul", "Prioritet", "Status", "Muddat"], ...tasks.map(t => [t.title, t.assignee, t.priority, t.status, t.deadline])]);
    } else if (id === "efficiency") {
      downloadCSV(`${id}-hisobot.csv`, [["Mashina", "Liniya", "Operator", "Samaradorlik (%)", "Uptime (soat)"], ...machines.map(m => [m.name, m.lineId, m.operator, m.efficiency, m.uptimeHours])]);
    } else {
      downloadCSV(`${id}-hisobot.csv`, [["Vaqt", "Energiya", "Samaradorlik", "Harorat", "Vibratsiya"], ...history.map(h => [h.t, h.energy, h.productivity, h.temperature, h.vibration])]);
    }
    toast.success(`${name} CSV faylga eksport qilindi`);
  };

  return (
    <div>
      <PageHeader title="Hisobotlar" description="Real-time ma'lumotlar asosida tayyor hisobotlar"
        actions={<Button variant="outline" onClick={() => window.print()} className="gap-2"><Printer className="h-4 w-4" /> Sahifani chop etish</Button>} />

      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        <div className="glass rounded-xl p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Real-time energiya va samaradorlik</h3>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">oxirgi {history.length} o'lchov</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={history.slice(-20)}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.5} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.5} /><stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="t" stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="energy" stroke="hsl(var(--primary))" fill="url(#g1)" name="Energiya (kWh)" />
              <Area type="monotone" dataKey="productivity" stroke="hsl(var(--success))" fill="url(#g2)" name="Samaradorlik (%)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="glass rounded-xl p-5 shadow-card">
          <h3 className="mb-3 text-sm font-semibold">Liniyalar bo'yicha energiya / samaradorlik</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={energyByLine}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="energiya" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              <Bar dataKey="samaradorlik" fill="hsl(var(--success))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass rounded-xl p-5 shadow-card">
          <h3 className="mb-3 text-sm font-semibold">Alertlar darajalari bo'yicha</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={alertsBySeverity} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <YAxis dataKey="level" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={70} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="hsl(var(--warning))" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass rounded-xl p-5 shadow-card">
          <h3 className="mb-3 text-sm font-semibold">Harorat va vibratsiya trendi</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={history.slice(-20)}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="t" stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="temperature" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} name="Harorat °C" />
              <Line type="monotone" dataKey="vibration" stroke="hsl(var(--warning))" strokeWidth={2} dot={false} name="Vibratsiya mm/s" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map(r => (
          <div key={r.id} className="glass rounded-xl p-5 shadow-card">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><FileText className="h-5 w-5" /></div>
              <div className="flex-1"><h3 className="text-sm font-semibold">{r.name}</h3><p className="mt-1 text-xs text-muted-foreground">{r.desc}</p></div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 rounded-lg border border-border bg-card/60 p-3 text-center text-xs">
              <div><p className="text-muted-foreground">Liniya</p><p className="font-semibold">{lines.length}</p></div>
              <div><p className="text-muted-foreground">Mashina</p><p className="font-semibold">{machines.length}</p></div>
              <div><p className="text-muted-foreground">Qurilma</p><p className="font-semibold">{devices.length}</p></div>
              <div><p className="text-muted-foreground">Alert</p><p className="font-semibold">{alerts.length}</p></div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" className="gap-1.5 flex-1" onClick={() => exportFor(r.id, r.name)}><Download className="h-3.5 w-3.5" /> CSV</Button>
              <Button size="sm" variant="outline" className="gap-1.5 flex-1" onClick={() => { window.print(); toast.success(`${r.name} chop etishga yuborildi`); }}><Printer className="h-3.5 w-3.5" /> Chop etish</Button>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs text-muted-foreground">Tizimda jami {tasks.length} ta texnik xizmat vazifasi, {alerts.length} ta ogohlantirish mavjud.</p>
    </div>
  );
}
