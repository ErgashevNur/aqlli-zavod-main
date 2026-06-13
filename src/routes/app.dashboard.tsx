import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Cpu,
  Gauge,
  PauseCircle,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";
import { useApp } from "@/lib/app/store";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { roleLabels } from "@/lib/app/mock-data";

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({ meta: [{ title: "Bosh sahifa — AQLLI-ZAVOD" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, machines, alerts, tasks, readings, lines, history, devices } = useApp();

  const active = machines.filter((m) => m.status === "faol").length;
  const stopped = machines.filter((m) => m.status === "to'xtagan").length;
  const warning = machines.filter((m) => m.status === "ogohlantirish").length;
  const critical = alerts.filter((a) => a.level === "Kritik" && a.status !== "Hal qilindi").length;

  const totalEnergy = Object.values(readings).reduce((s, r) => s + r.energy, 0);
  const avgTemp =
    Object.values(readings).reduce((s, r) => s + r.temperature, 0) / Math.max(1, lines.length);
  const avgVib =
    Object.values(readings).reduce((s, r) => s + r.vibration, 0) / Math.max(1, lines.length);
  // Productivity is driven by actual sensor readings (drops to 0 when energy device is offline)
  const avgProd =
    Object.values(readings).reduce((s, r) => s + r.productivity, 0) / Math.max(1, lines.length);
  const dailyOutput = Math.round(avgProd * 18.4);
  const pendingTasks = tasks.filter((t) => t.status !== "Bajarildi" && t.status !== "Bekor qilindi").length;
  const onlineDevices = devices.filter((d) => d.status === "online").length;

  return (
    <div>
      <PageHeader
        title={`Salom, ${user?.fullName.split(" ")[0] ?? ""} 👋`}
        description={`${roleLabels[user?.role ?? "operator"]} · Korxonangizdagi joriy holat`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Faol mashinalar" value={active} delta={`Jami: ${machines.length}`} tone="success" icon={<Activity className="h-5 w-5" />} />
        <StatCard label="Ogohlantirish" value={warning} delta="Kuzatuv kerak" tone="warning" icon={<AlertTriangle className="h-5 w-5" />} />
        <StatCard label="Toʻxtagan" value={stopped} delta="Tezkor harakat" tone="destructive" icon={<PauseCircle className="h-5 w-5" />} />
        <StatCard label="Kritik alertlar" value={critical} delta="Aralashuv talab" tone="destructive" icon={<AlertTriangle className="h-5 w-5" />} />
        <StatCard label="Onlayn IoT qurilmalar" value={`${onlineDevices}/${devices.length}`} tone="info" icon={<Cpu className="h-5 w-5" />} />
        <StatCard label="Energiya sarfi" value={`${totalEnergy.toFixed(0)} kWh`} delta="Real-time" tone="warning" icon={<Zap className="h-5 w-5" />} />
        <StatCard label="O'rtacha samaradorlik" value={`${avgProd.toFixed(1)}%`} delta={`Kunlik: ${dailyOutput} dona`} tone="success" icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Texnik xizmat" value={pendingTasks} delta="Faol vazifalar" tone="info" icon={<Wrench className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-xl p-5 shadow-card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold">Real-time ishlab chiqarish</h3>
              <p className="text-xs text-muted-foreground">Soʻnggi 30 oʻlchov</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot text-success" />
              Jonli
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="prod" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="energy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-4)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-4)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="t" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="productivity" name="Samaradorlik %" stroke="var(--color-chart-1)" fill="url(#prod)" strokeWidth={2} />
                <Area type="monotone" dataKey="energy" name="Energiya kWh" stroke="var(--color-chart-4)" fill="url(#energy)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-xl p-5 shadow-card">
          <h3 className="text-base font-semibold">Soʻnggi alertlar</h3>
          <p className="text-xs text-muted-foreground">Tezkor reaksiya kerak</p>
          <ul className="mt-4 space-y-3">
            {alerts.slice(0, 6).map((a) => (
              <li key={a.id} className="rounded-lg border border-border bg-card/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{a.title}</p>
                  <StatusBadge status={a.level} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{a.message}</p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{a.source}</span>
                  <StatusBadge status={a.status} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-xl p-5 shadow-card">
          <h3 className="text-base font-semibold">Harorat va vibratsiya trendi</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="t" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="temperature" name="Harorat °C" stroke="var(--color-chart-5)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="vibration" name="Vibratsiya mm/s" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
            <Gauge className="h-3.5 w-3.5" /> O'rt. harorat {avgTemp.toFixed(1)}°C · vibratsiya {avgVib.toFixed(2)} mm/s
          </p>
        </div>

        <div className="glass rounded-xl p-5 shadow-card">
          <h3 className="text-base font-semibold">Liniyalar holati</h3>
          <div className="mt-3 space-y-3">
            {lines.map((l) => (
              <div key={l.id} className="rounded-lg border border-border bg-card/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{l.name}</p>
                  <StatusBadge status={l.status} pulse={l.status === "faol"} />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded bg-muted/40 p-2">
                    <p className="text-muted-foreground">Samar.</p>
                    <p className="font-semibold text-foreground">{l.productivity}%</p>
                  </div>
                  <div className="rounded bg-muted/40 p-2">
                    <p className="text-muted-foreground">Toʻxt.</p>
                    <p className="font-semibold text-foreground">{l.downtime} daq</p>
                  </div>
                  <div className="rounded bg-muted/40 p-2">
                    <p className="text-muted-foreground">Energ.</p>
                    <p className="font-semibold text-foreground">{l.energy} kWh</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 glass rounded-xl p-5 shadow-card">
        <h3 className="text-base font-semibold">Texnik xizmat vazifalari</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3">Vazifa</th>
                <th className="py-2 pr-3">Mas'ul</th>
                <th className="py-2 pr-3">Muhimlik</th>
                <th className="py-2 pr-3">Muddat</th>
                <th className="py-2">Holat</th>
              </tr>
            </thead>
            <tbody>
              {tasks.slice(0, 5).map((t) => (
                <tr key={t.id} className="border-b border-border/60 last:border-0">
                  <td className="py-2 pr-3 font-medium">{t.title}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{t.assignee}</td>
                  <td className="py-2 pr-3"><StatusBadge status={t.priority} /></td>
                  <td className="py-2 pr-3 text-muted-foreground">{t.deadline}</td>
                  <td className="py-2"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}