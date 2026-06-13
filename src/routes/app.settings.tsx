import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/app/store";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { factoryInfo } from "@/lib/app/mock-data";
import { toast } from "sonner";
export const Route = createFileRoute("/app/settings")({ component: Settings });
function Settings() {
  const { theme, toggleTheme, thresholds, setThresholds, updateInterval, setUpdateInterval } = useApp();
  return (
    <div>
      <PageHeader title="Sozlamalar" description="Platforma sozlamalari va xavfsizlik" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-xl p-6 shadow-card">
          <h3 className="text-sm font-semibold">Ko'rinish</h3>
          <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-card/60 p-3"><div><p className="text-sm font-medium">Tungi rejim</p><p className="text-xs text-muted-foreground">Quyuq mavzu</p></div><Switch checked={theme === "dark"} onCheckedChange={toggleTheme} /></div>
        </div>
        <div className="glass rounded-xl p-6 shadow-card">
          <h3 className="text-sm font-semibold">Real-time</h3>
          <div className="mt-4"><Label>Yangilanish oralig'i (ms)</Label><Input type="number" min={1000} max={20000} step={500} value={updateInterval} onChange={e => setUpdateInterval(Number(e.target.value))} className="mt-1" /><p className="mt-1 text-xs text-muted-foreground">3000–5000 tavsiya etiladi</p></div>
        </div>
        <div className="glass rounded-xl p-6 shadow-card lg:col-span-2">
          <h3 className="text-sm font-semibold">Alert chegaralari</h3>
          <form className="mt-4 grid gap-3 sm:grid-cols-4" onSubmit={e => { e.preventDefault(); toast.success("Chegaralar saqlandi"); }}>
            <div><Label>Harorat °C</Label><Input type="number" value={thresholds.temperature} onChange={e => setThresholds({ ...thresholds, temperature: Number(e.target.value) })} className="mt-1" /></div>
            <div><Label>Vibratsiya mm/s</Label><Input type="number" step="0.1" value={thresholds.vibration} onChange={e => setThresholds({ ...thresholds, vibration: Number(e.target.value) })} className="mt-1" /></div>
            <div><Label>Energiya kWh</Label><Input type="number" value={thresholds.energy} onChange={e => setThresholds({ ...thresholds, energy: Number(e.target.value) })} className="mt-1" /></div>
            <div><Label>Bosim bar</Label><Input type="number" step="0.1" value={thresholds.pressure} onChange={e => setThresholds({ ...thresholds, pressure: Number(e.target.value) })} className="mt-1" /></div>
            <Button type="submit" className="sm:col-span-4">Saqlash</Button>
          </form>
        </div>
        <div className="glass rounded-xl p-6 shadow-card lg:col-span-2">
          <h3 className="text-sm font-semibold">Korxona ma'lumotlari</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5 text-sm">
            <div><p className="text-xs text-muted-foreground">Nomi</p><p className="font-medium">{factoryInfo.name}</p></div>
            <div><p className="text-xs text-muted-foreground">Shahar</p><p className="font-medium">{factoryInfo.city}</p></div>
            <div><p className="text-xs text-muted-foreground">Tashkil etilgan</p><p className="font-medium">{factoryInfo.founded}</p></div>
            <div><p className="text-xs text-muted-foreground">Xodimlar</p><p className="font-medium">{factoryInfo.employees}</p></div>
            <div><p className="text-xs text-muted-foreground">Maydon</p><p className="font-medium">{factoryInfo.area}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
