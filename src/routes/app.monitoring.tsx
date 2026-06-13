import { createFileRoute } from "@tanstack/react-router";
import { Activity, Droplets, Gauge, Thermometer, Vibrate, Wind, Zap } from "lucide-react";
import { useApp } from "@/lib/app/store";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/app/monitoring")({ component: Monitoring });

function Metric({ icon: Icon, label, value, unit, min, max, tone }: { icon: typeof Thermometer; label: string; value: number; unit: string; min: number; max: number; tone: "success" | "warning" | "destructive" | "info"; }) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const colors = { success: ["text-success", "bg-success"], warning: ["text-warning", "bg-warning"], destructive: ["text-destructive", "bg-destructive"], info: ["text-info", "bg-info"] };
  const [tc, bc] = colors[tone];
  return (
    <div className="rounded-xl border border-border bg-card/60 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className={`h-4 w-4 ${tc}`} />{label}</div>
        <span className="text-[10px] text-muted-foreground">{min}–{max}{unit}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold">{value.toFixed(1)} <span className="text-sm text-muted-foreground">{unit}</span></p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted"><div className={`h-full ${bc} transition-all`} style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

function Monitoring() {
  const { lines, readings, devices, history, updateInterval } = useApp();
  const toneFor = (v: number, w: number, c: number): "success" | "warning" | "destructive" => v >= c ? "destructive" : v >= w ? "warning" : "success";
  return (
    <div>
      <PageHeader title="Real-time monitoring" description={`Yangilanish: har ${(updateInterval/1000).toFixed(0)} soniyada`}
        actions={<span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success"><span className="h-1.5 w-1.5 rounded-full bg-current pulse-dot" /> Jonli</span>} />
      <div className="space-y-6">
        {lines.map((l) => {
          const r = readings[l.id]; if (!r) return null;
          const lineDevices = devices.filter((d) => d.lineId === l.id);
          return (
            <div key={l.id} className="glass rounded-xl p-5 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h3 className="text-base font-semibold">{l.name}</h3><p className="text-xs text-muted-foreground">{l.description}</p></div>
                <StatusBadge status={l.status} pulse={l.status === "faol"} />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Metric icon={Thermometer} label="Harorat" value={r.temperature} unit="°C" min={25} max={95} tone={toneFor(r.temperature, 70, 85)} />
                <Metric icon={Droplets} label="Namlik" value={r.humidity} unit="%" min={30} max={80} tone="info" />
                <Metric icon={Vibrate} label="Vibratsiya" value={r.vibration} unit=" mm/s" min={0.2} max={9} tone={toneFor(r.vibration, 4, 6.5)} />
                <Metric icon={Gauge} label="Bosim" value={r.pressure} unit=" bar" min={1} max={12} tone={toneFor(r.pressure, 8, 10.5)} />
                <Metric icon={Zap} label="Energiya" value={r.energy} unit=" kWh" min={100} max={900} tone={toneFor(r.energy, 600, 800)} />
                <Metric icon={Activity} label="Tok" value={r.current} unit=" A" min={5} max={120} tone="info" />
                <Metric icon={Wind} label="Kuchlanish" value={r.voltage} unit=" V" min={360} max={420} tone="success" />
                <Metric icon={Activity} label="Samaradorlik" value={r.productivity} unit=" %" min={50} max={99} tone="success" />
              </div>
              <div className="mt-5 grid gap-3 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-lg border border-border bg-card/60 p-3">
                  <p className="mb-2 text-xs text-muted-foreground">Harorat trendi</p>
                  <div className="h-40">
                    <ResponsiveContainer>
                      <AreaChart data={history.slice(-15)}>
                        <defs><linearGradient id={`g-${l.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="t" stroke="var(--color-muted-foreground)" fontSize={10} />
                        <YAxis stroke="var(--color-muted-foreground)" fontSize={10} />
                        <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                        <Area type="monotone" dataKey="temperature" stroke="var(--color-chart-2)" fill={`url(#g-${l.id})`} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-card/60 p-3">
                  <p className="mb-2 text-xs text-muted-foreground">Qurilmalar signali</p>
                  <ul className="space-y-2">
                    {lineDevices.map((d) => (
                      <li key={d.id} className="text-sm">
                        <div className="flex items-center justify-between"><span className="font-medium">{d.name}</span><span className="text-xs">{d.signal}%</span></div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted"><div className={`h-full ${d.signal > 70 ? "bg-success" : d.signal > 40 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${d.signal}%` }} /></div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
