import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Gauge, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/app/store";
import { roleLabels } from "@/lib/app/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Kirish — AQLLI-ZAVOD" }] }),
  component: LoginPage,
});

const demo = [
  { e: "admin@korxona.uz", p: "admin123", r: "admin" },
  { e: "manager@korxona.uz", p: "manager123", r: "manager" },
  { e: "engineer@korxona.uz", p: "engineer123", r: "engineer" },
  { e: "operator@korxona.uz", p: "operator123", r: "operator" },
  { e: "analyst@korxona.uz", p: "analyst123", r: "analyst" },
];

function LoginPage() {
  const { user, login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (user) navigate({ to: "/app/dashboard" });
  }, [user, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    if (!email) err.email = "Email kiritilishi shart";
    else if (!/^\S+@\S+\.\S+$/.test(email)) err.email = "Email formati notoʻgʻri";
    if (!password) err.password = "Parol kiritilishi shart";
    else if (password.length < 4) err.password = "Parol kamida 4 belgi";
    setErrors(err);
    if (Object.keys(err).length) return;
    const u = login(email, password);
    if (!u) {
      toast.error("Login yoki parol xato");
      return;
    }
    toast.success(`Xush kelibsiz, ${u.fullName}`);
    navigate({ to: "/app/dashboard" });
  };

  const fill = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-12 sm:px-6">
        <div className="grid w-full gap-10 lg:grid-cols-2">
          <div className="hidden flex-col justify-between lg:flex">
            <Link to="/" className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-lg gradient-primary shadow-glow">
                <Gauge className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold">AQLLI-ZAVOD</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">IoT Platform</p>
              </div>
            </Link>
            <div>
              <h2 className="text-3xl font-bold leading-tight">
                Sanoat 4.0 ga xush kelibsiz
              </h2>
              <p className="mt-3 max-w-md text-sm text-muted-foreground">
                Real-time IoT monitoring, prediktiv tahlil va AI tavsiyalari bilan korxonangizni
                boshqaring.
              </p>
              <div className="mt-8 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Demo akkauntlar</p>
                <div className="space-y-1.5">
                  {demo.map((d) => (
                    <button
                      key={d.e}
                      type="button"
                      onClick={() => fill(d.e, d.p)}
                      className="flex w-full items-center justify-between rounded-lg border border-border bg-card/70 px-3 py-2 text-left text-xs transition hover:border-primary/50"
                    >
                      <div>
                        <p className="font-medium">{roleLabels[d.r]}</p>
                        <p className="text-muted-foreground">{d.e}</p>
                      </div>
                      <code className="rounded bg-muted px-2 py-1 text-[10px]">{d.p}</code>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} AQLLI-ZAVOD</p>
          </div>

          <div className="glass mx-auto w-full max-w-md rounded-2xl p-8 shadow-card">
            <Link to="/" className="mb-6 flex items-center gap-2 lg:hidden">
              <div className="grid h-9 w-9 place-items-center rounded-lg gradient-primary">
                <Gauge className="h-5 w-5 text-primary-foreground" />
              </div>
              <p className="text-sm font-semibold">AQLLI-ZAVOD</p>
            </Link>
            <h1 className="text-2xl font-semibold">Tizimga kirish</h1>
            <p className="mt-1 text-sm text-muted-foreground">Email va parolingizni kiriting</p>
            <form className="mt-6 space-y-4" onSubmit={submit}>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@korxona.uz"
                  className="mt-1"
                />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="password">Parol</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1"
                />
                {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
              </div>
              <Button type="submit" className="w-full gap-2">
                <LogIn className="h-4 w-4" /> Kirish
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Hisobingiz yoʻqmi?{" "}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Roʻyxatdan oʻting
              </Link>
            </p>

            <div className="mt-6 lg:hidden">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Demo</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {demo.map((d) => (
                  <button
                    key={d.e}
                    type="button"
                    onClick={() => fill(d.e, d.p)}
                    className="rounded border border-border bg-card px-2 py-1 text-[11px] hover:border-primary/50"
                  >
                    {roleLabels[d.r]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}