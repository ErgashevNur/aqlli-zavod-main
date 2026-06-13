import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  Cpu,
  Gauge,
  Network,
  Shield,
  Sliders,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AQLLI-ZAVOD — Sanoat IoT monitoring va boshqaruv" },
      {
        name: "description",
        content:
          "Mahalliy ishlab chiqarish korxonalari uchun IoT asosida real-time monitoring, prediktiv tahlil va aqlli boshqaruv platformasi.",
      },
    ],
  }),
  component: Landing,
});

const modules = [
  { icon: Activity, title: "Real-time monitoring", desc: "Sensorlardan kelayotgan ma'lumotlarni jonli kuzating." },
  { icon: Cpu, title: "IoT qurilmalar boshqaruvi", desc: "Sensorlar, kontrollerlar va shlyuzlarni markazlashgan tarzda boshqaring." },
  { icon: Sliders, title: "Mashina boshqaruv paneli", desc: "Ishga tushirish, to'xtatish va xizmat rejimini xavfsiz bajaring." },
  { icon: AlertTriangle, title: "Aqlli alertlar", desc: "Belgilangan chegaralar boʻyicha avtomatik ogohlantirishlar." },
  { icon: Wrench, title: "Prediktiv texnik xizmat", desc: "Buzilishni oldindan aniqlash va rejali xizmat." },
  { icon: BarChart3, title: "Analitika va hisobotlar", desc: "Samaradorlik, energiya va to'xtab qolish trendlari." },
  { icon: Brain, title: "AI tavsiyalar", desc: "Maʼlumotlarga asoslangan oqilona qarorlar uchun." },
  { icon: Shield, title: "Rolga asoslangan kirish", desc: "Admin, rahbar, muhandis, operator va analitik uchun." },
];

const impact = [
  { v: "20–35%", l: "Bekor turish vaqti kamayadi" },
  { v: "15–25%", l: "Energiya sarfi qisqaradi" },
  { v: "30–40%", l: "Nosozlikni aniqlash tezligi oshadi" },
  { v: "25–35%", l: "Texnik xizmat samaradorligi" },
  { v: "40–60%", l: "Monitoring aniqligi oshadi" },
  { v: "15–20%", l: "Operatsion xarajatlar kamayadi" },
];

const flow = [
  { t: "Sensorlar", d: "Harorat, vibratsiya, energiya" },
  { t: "Kontroller", d: "Edge qurilma" },
  { t: "Gateway", d: "IoT shlyuz" },
  { t: "Server / API", d: "Bulutli ishlov berish" },
  { t: "Maʼlumotlar bazasi", d: "Tarixiy yozuvlar" },
  { t: "Dashboard", d: "Real-time UI" },
  { t: "Tahlil", d: "AI / qoidalar" },
  { t: "Boshqaruv", d: "Buyruq qaytadi" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg gradient-primary shadow-glow">
              <Gauge className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold">AQLLI-ZAVOD</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">IoT Platform</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#modules" className="hover:text-foreground">Modullar</a>
            <a href="#architecture" className="hover:text-foreground">Arxitektura</a>
            <a href="#impact" className="hover:text-foreground">Natijalar</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Kirish</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Roʻyxatdan oʻtish</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Sanoat 4.0 — raqamli transformatsiya
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Mahalliy ishlab chiqarish korxonasi uchun{" "}
              <span className="text-gradient">aqlli IoT monitoring</span> va boshqaruv tizimi
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Sensorlardan tortib boshqaruv buyrugʻigacha — yagona platformada real-time tahlil, prediktiv
              texnik xizmat va AI asosidagi tavsiyalar.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/login">
                  Platformaga kirish <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/register">Demo koʻrish</Link>
              </Button>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-2xl font-semibold text-primary">12+</p>
                <p className="text-xs text-muted-foreground">Modul</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-primary">5</p>
                <p className="text-xs text-muted-foreground">Foydalanuvchi roli</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-primary">24/7</p>
                <p className="text-xs text-muted-foreground">Monitoring</p>
              </div>
            </div>
          </div>

          {/* Hero visual: simulated dashboard */}
          <div className="relative">
            <div className="glass rounded-2xl p-5 shadow-glow">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success pulse-dot text-success" />
                  <p className="text-sm font-medium">Jonli holat</p>
                </div>
                <span className="text-xs text-muted-foreground">1-liniya · CNC-101</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { l: "Harorat", v: "62°C", c: "text-success" },
                  { l: "Vibratsiya", v: "3.4 mm/s", c: "text-success" },
                  { l: "Energiya", v: "612 kWh", c: "text-warning" },
                  { l: "Bosim", v: "7.1 bar", c: "text-info" },
                ].map((m) => (
                  <div key={m.l} className="rounded-lg border border-border bg-card/60 p-3">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{m.l}</p>
                    <p className={`mt-1 text-xl font-semibold ${m.c}`}>{m.v}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-border bg-card/60 p-3">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Samaradorlik (24 soat)</span>
                  <span className="font-medium text-success">87%</span>
                </div>
                <svg viewBox="0 0 200 60" className="h-16 w-full">
                  <defs>
                    <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.7 0.17 220)" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="oklch(0.7 0.17 220)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,40 L20,32 L40,38 L60,22 L80,28 L100,18 L120,24 L140,14 L160,20 L180,10 L200,16 L200,60 L0,60 Z"
                    fill="url(#g1)"
                  />
                  <path
                    d="M0,40 L20,32 L40,38 L60,22 L80,28 L100,18 L120,24 L140,14 L160,20 L180,10 L200,16"
                    fill="none"
                    stroke="oklch(0.7 0.17 220)"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5" /> Robot R-12: vibratsiya yuqori
                </span>
                <span className="text-[10px]">2 daq oldin</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Muammo</p>
            <h2 className="mt-3 text-3xl font-bold">Anʼanaviy nazorat zamonaviy ishlab chiqarish uchun yetarli emas</h2>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              {[
                "Mashinalarning real-time holati kuzatilmaydi.",
                "Nosozliklar faqat sodir boʻlganidan keyin aniqlanadi.",
                "Energiya sarfi shaffof emas — keraksiz xarajatlar.",
                "Texnik xizmat reaktiv, profilaktik emas.",
                "Boshqaruv qarorlari intuitsiya asosida qabul qilinadi.",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Yechim</p>
            <h2 className="mt-3 text-3xl font-bold">IoT + tahlil + boshqaruv — bitta platformada</h2>
            <p className="mt-6 text-sm text-muted-foreground">
              AQLLI-ZAVOD platformasi sensorlardan kelayotgan oqimni real-time qayta ishlaydi, anomaliyalarni
              aniqlaydi, AI yordamida tavsiyalar beradi va mashinalarga buyruq yuborish imkonini taqdim
              etadi.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                ["Sensorlar tarmogʻi", Cpu],
                ["Edge boshqaruv", Sliders],
                ["Bulutli tahlil", BarChart3],
                ["AI qarori", Brain],
              ].map(([t, I]) => {
                const Icon = I as typeof Cpu;
                return (
                  <div key={t as string} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{t as string}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section id="architecture" className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Tizim arxitekturasi</p>
            <h2 className="mt-3 text-3xl font-bold">Maʼlumot oqimi: sensordan boshqaruvga qadar</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Har bir qadam shaffof, kuzatiladigan va xavfsiz. Tizim kengaytirilishi mumkin.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {flow.map((s, i) => (
              <div
                key={s.t}
                className="relative rounded-xl border border-border bg-card p-4 text-center shadow-card"
              >
                <div className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
                  <Network className="h-4 w-4" />
                </div>
                <p className="mt-2 text-sm font-semibold">{s.t}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{s.d}</p>
                {i < flow.length - 1 && (
                  <ArrowRight className="absolute -right-2.5 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-muted-foreground lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section id="modules" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Platforma modullari</p>
          <h2 className="mt-3 text-3xl font-bold">Korxonangizning raqamli yadrosi</h2>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.title} className="glass rounded-xl p-5 shadow-card transition hover:shadow-glow">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{m.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{m.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* IMPACT */}
      <section id="impact" className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Kutilayotgan natijalar</p>
            <h2 className="mt-3 text-3xl font-bold">Raqamlardagi taʼsir</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {impact.map((i) => (
              <div key={i.l} className="rounded-xl border border-border bg-card p-6 shadow-card">
                <p className="text-3xl font-bold text-gradient">{i.v}</p>
                <p className="mt-1 text-sm text-muted-foreground">{i.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Mahalliy korxonalar uchun</p>
            <h2 className="mt-3 text-3xl font-bold">Nima uchun aynan AQLLI-ZAVOD?</h2>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Toʻliq oʻzbek tilida — operatorlardan rahbargacha tushunarli.",
                "Mavjud uskunalarga moslashtirish mumkin, qimmat almashtirishsiz.",
                "Bulut va lokal serverda ishlash imkoniyati.",
                "Hisobotlar va akademik tahlil uchun toʻliq maʼlumot.",
                "Diplom, kurs ishi va MVP loyihalari uchun mos.",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { i: Zap, t: "Energiya tejash", d: "Real-time monitoring orqali keraksiz sarfni aniqlash." },
              { i: Wrench, t: "Profilaktika", d: "Buzilishni oldindan bashorat qilish." },
              { i: BarChart3, t: "KPI shaffofligi", d: "Rahbariyat uchun jonli dashboard." },
              { i: Shield, t: "Xavfsizlik", d: "Roli boʻyicha cheklangan kirish." },
            ].map((b) => {
              const Icon = b.i;
              return (
                <div key={b.t} className="rounded-xl border border-border bg-card p-5">
                  <Icon className="h-5 w-5 text-accent" />
                  <p className="mt-3 text-sm font-semibold">{b.t}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{b.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card p-10 text-center shadow-glow">
          <div className="absolute inset-0 gradient-hero opacity-60" />
          <div className="relative">
            <h2 className="text-3xl font-bold">Korxonangizni bugun raqamli transformatsiyaga olib chiqing</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Demo akkauntlar bilan toʻliq platformani sinab koʻring. Roʻyxatdan oʻtish 1 daqiqada.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild>
                <Link to="/login">Platformaga kirish <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/register">Demo koʻrish</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} AQLLI-ZAVOD MChJ · Sanoat IoT platformasi</p>
          <p>Toshkent · Oʻzbekiston</p>
        </div>
      </footer>
    </div>
  );
}
