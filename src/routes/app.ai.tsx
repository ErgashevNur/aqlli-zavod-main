import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Activity, Brain, Lightbulb, Target, TrendingUp, Zap } from "lucide-react";
import { useApp } from "@/lib/app/store";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { aiRecommendations } from "@/lib/app/mock-data";
import type { AIRecommendation, AlertLevel } from "@/lib/app/types";
import { AIAssistant } from "@/components/app/AIAssistant";
export const Route = createFileRoute("/app/ai")({ component: AIPage });
function AIPage() {
  const { readings, lines, alerts, thresholds, machines, history } = useApp();

  const dynamic = useMemo<AIRecommendation[]>(() => {
    const out: AIRecommendation[] = [];
    const lvl = (sev: number): AlertLevel =>
      sev >= 3 ? "Kritik" : sev >= 2 ? "Yuqori" : sev >= 1 ? "O'rta" : "Past";

    for (const l of lines) {
      const r = readings[l.id];
      if (!r) continue;
      if (r.temperature > thresholds.temperature - 5) {
        const over = +(r.temperature - thresholds.temperature).toFixed(1);
        const sev = over > 6 ? 3 : over > 0 ? 2 : 1;
        out.push({
          id: `dyn-t-${l.id}`,
          title: `${l.name} – sovutishni kuchaytirish`,
          area: "Texnik xizmat",
          reason: `Joriy harorat ${r.temperature.toFixed(1)}°C, chegara ${thresholds.temperature}°C (${over >= 0 ? "+" : ""}${over}°C).`,
          impact: "Mashina ishlash muddatini 15–20% uzaytiradi va to'xtab qolishni oldini oladi.",
          action: "Sovutgich nasoslarini diagnostika qilish, radiator filtrlarini tozalash.",
          priority: lvl(sev),
        });
      }
      if (r.vibration > thresholds.vibration - 1) {
        const sev = r.vibration > thresholds.vibration + 1 ? 3 : r.vibration > thresholds.vibration ? 2 : 1;
        out.push({
          id: `dyn-v-${l.id}`,
          title: `${l.name} – vibratsiya darajasi yuqori`,
          area: "Profilaktik xizmat",
          reason: `Vibratsiya ${r.vibration.toFixed(2)} mm/s (chegara ${thresholds.vibration}). Trend: oxirgi 5 ta o'lchovda o'sish.`,
          impact: `Podshipnik buzilishi ehtimoli ${sev * 20 + 25}% ga kamayadi.`,
          action: "Podshipniklarni almashtirish va lubrikatsiyani yangilash.",
          priority: lvl(sev),
        });
      }
      if (r.energy > thresholds.energy - 80) {
        const sev = r.energy > thresholds.energy ? 2 : 1;
        out.push({
          id: `dyn-e-${l.id}`,
          title: `${l.name} – energiya optimizatsiyasi`,
          area: "Energetika",
          reason: `Joriy sarf ${r.energy.toFixed(0)} kWh, chegara ${thresholds.energy} kWh. Bo'sh turish davrida quvvat 22% ortiq.`,
          impact: "Oylik xarajatlar 10–15% gacha qisqaradi.",
          action: "Tungi smenada bo'sh mashinalarni avtomatik o'chirish, peak-shaving rejimini yoqish.",
          priority: lvl(sev),
        });
      }
      if (r.productivity < 75) {
        const sev = r.productivity < 65 ? 3 : 2;
        out.push({
          id: `dyn-p-${l.id}`,
          title: `${l.name} – samaradorlik pasaymoqda`,
          area: "Ishlab chiqarish",
          reason: `Joriy samaradorlik ${r.productivity.toFixed(1)}% (maqsad ≥85%).`,
          impact: "Kunlik ishlab chiqarish 8–12% oshadi.",
          action: "Smena yuklamasini qayta taqsimlash, qisqa to'xtashlar sabablarini tahlil qilish.",
          priority: lvl(sev),
        });
      }
    }

    const criticalAlerts = alerts.filter((a) => a.level === "Kritik" && a.status !== "Hal qilindi").length;
    if (criticalAlerts >= 2) {
      out.push({
        id: "dyn-incident",
        title: "Bir vaqtning o'zida bir nechta kritik hodisa",
        area: "Boshqaruv markazi",
        reason: `Hozir ${criticalAlerts} ta hal qilinmagan kritik alert mavjud.`,
        impact: "Tezkor reaksiya butun korxona to'xtab qolishini oldini oladi.",
        action: "Smena boshlig'ini darhol xabardor qilish va navbatchi muhandisni jalb etish.",
        priority: "Kritik",
      });
    }

    const downMachines = machines.filter((m) => m.status === "to'xtagan").length;
    if (downMachines > 0) {
      out.push({
        id: "dyn-down",
        title: "To'xtagan mashinalar mavjud",
        area: "Operatsion",
        reason: `${downMachines} ta mashina hozir to'xtagan holatda.`,
        impact: "Tez qayta ishga tushirish kunlik OEE ko'rsatkichini ~6% ga oshiradi.",
        action: "Boshqaruv panelidan qayta ishga tushirish yoki texnik xizmat vazifasi yaratish.",
        priority: downMachines > 1 ? "Yuqori" : "O'rta",
      });
    }

    // baseline rekomendatsiyalar har doim ko'rinadi
    const baseline = aiRecommendations.filter((r) => !out.some((d) => d.area === r.area));
    return [...out, ...baseline].slice(0, 8);
  }, [readings, lines, alerts, thresholds, machines]);

  const trend = history.slice(-6);
  const trendUp = trend.length > 1 && trend[trend.length - 1].temperature > trend[0].temperature;

  const criticalCount = alerts.filter(a => a.level === "Kritik" && a.status !== "Hal qilindi").length;
  const avgProd = (lines.reduce((s, l) => s + (readings[l.id]?.productivity ?? 0), 0) / Math.max(1, lines.length)).toFixed(1);
  const avgTemp = (lines.reduce((s, l) => s + (readings[l.id]?.temperature ?? 0), 0) / Math.max(1, lines.length)).toFixed(1);
  const downCount = machines.filter(m => m.status === "to'xtagan").length;
  const contextSummary = `${lines.length} ta liniya, o'rtacha samaradorlik ${avgProd}%, o'rtacha harorat ${avgTemp}°C, ${criticalCount} ta kritik alert, ${downCount} ta to'xtagan mashina`;

  return (
    <div>
      <PageHeader title="AI tavsiyalar" description="Real-time tahlil asosida intellektual tavsiyalar"
        actions={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
              <Activity className="h-3.5 w-3.5 animate-pulse" /> Live tahlil
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Brain className="h-3.5 w-3.5" /> AI engine: {dynamic.length} ta tavsiya
            </span>
          </div>
        } />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="glass rounded-xl p-4 shadow-card">
          <p className="text-xs text-muted-foreground">Faol kritik alertlar</p>
          <p className="mt-1 text-2xl font-semibold">{alerts.filter(a => a.level === "Kritik" && a.status !== "Hal qilindi").length}</p>
        </div>
        <div className="glass rounded-xl p-4 shadow-card">
          <p className="text-xs text-muted-foreground">Harorat trendi</p>
          <p className={`mt-1 text-2xl font-semibold ${trendUp ? "text-warning" : "text-success"}`}>{trendUp ? "▲ Ortmoqda" : "▼ Barqaror"}</p>
        </div>
        <div className="glass rounded-xl p-4 shadow-card">
          <p className="text-xs text-muted-foreground">O'rtacha samaradorlik</p>
          <p className="mt-1 text-2xl font-semibold">{(lines.reduce((s, l) => s + (readings[l.id]?.productivity ?? 0), 0) / Math.max(1, lines.length)).toFixed(1)}%</p>
        </div>
      </div>
      <div className="mb-6">
        <AIAssistant contextSummary={contextSummary} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {dynamic.map(r => (
          <div key={r.id} className="glass rounded-xl p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  {r.id.startsWith("dyn-") ? <Zap className="h-5 w-5" /> : <Lightbulb className="h-5 w-5" />}
                </div>
                <div><h3 className="text-base font-semibold">{r.title}</h3><p className="text-xs text-muted-foreground">{r.area}</p></div>
              </div>
              <StatusBadge status={r.priority} />
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-lg border border-border bg-card/60 p-3"><p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground"><TrendingUp className="h-3.5 w-3.5" /> Sabab</p><p className="mt-1">{r.reason}</p></div>
              <div className="rounded-lg border border-border bg-card/60 p-3"><p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground"><Target className="h-3.5 w-3.5" /> Kutilayotgan ta'sir</p><p className="mt-1">{r.impact}</p></div>
              <div className="rounded-lg border border-success/30 bg-success/10 p-3"><p className="text-xs font-semibold uppercase text-success">Tavsiya etilgan harakat</p><p className="mt-1">{r.action}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
