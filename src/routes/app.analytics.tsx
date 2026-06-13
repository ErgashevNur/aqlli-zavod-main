import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/app/store";
import { PageHeader } from "@/components/app/PageHeader";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
export const Route = createFileRoute("/app/analytics")({ component: Analytics });
function Analytics() {
  const { history, lines, machines } = useApp();
  const lineComp = lines.map(l => ({ name: l.name.split(":")[0], samaradorlik: l.productivity, energiya: l.energy, toxtash: l.downtime }));
  const downtime = machines.map(m => ({ name: m.name, soat: Math.round(100 - m.efficiency) }));
  const COLORS = ["var(--color-chart-1)","var(--color-chart-2)","var(--color-chart-3)","var(--color-chart-4)","var(--color-chart-5)"];
  return (
    <div>
      <PageHeader title="Analitika" description="Trendlar, taqqoslash va samaradorlik" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-xl p-5 shadow-card">
          <h3 className="text-sm font-semibold">Energiya va samaradorlik (real-time)</h3>
          <div className="mt-3 h-64"><ResponsiveContainer><LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="t" stroke="var(--color-muted-foreground)" fontSize={11} /><YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
            <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} /><Legend />
            <Line type="monotone" dataKey="energy" name="Energiya" stroke="var(--color-chart-4)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="productivity" name="Samar." stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
          </LineChart></ResponsiveContainer></div>
        </div>
        <div className="glass rounded-xl p-5 shadow-card">
          <h3 className="text-sm font-semibold">Liniyalar bo'yicha taqqoslash</h3>
          <div className="mt-3 h-64"><ResponsiveContainer><BarChart data={lineComp}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} /><YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
            <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} /><Legend />
            <Bar dataKey="samaradorlik" fill="var(--color-chart-1)" /><Bar dataKey="energiya" fill="var(--color-chart-4)" />
          </BarChart></ResponsiveContainer></div>
        </div>
        <div className="glass rounded-xl p-5 shadow-card">
          <h3 className="text-sm font-semibold">Mashinalar bo'yicha to'xtab qolish</h3>
          <div className="mt-3 h-64"><ResponsiveContainer><BarChart data={downtime}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={10} /><YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
            <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
            <Bar dataKey="soat" fill="var(--color-chart-5)" />
          </BarChart></ResponsiveContainer></div>
        </div>
        <div className="glass rounded-xl p-5 shadow-card">
          <h3 className="text-sm font-semibold">Energiya ulushi (liniyalar)</h3>
          <div className="mt-3 h-64"><ResponsiveContainer><PieChart>
            <Pie data={lineComp} dataKey="energiya" nameKey="name" innerRadius={50} outerRadius={90}>
              {lineComp.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie><Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} /><Legend />
          </PieChart></ResponsiveContainer></div>
        </div>
      </div>
    </div>
  );
}
