import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Gauge, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/app/store";
import { departments, roleLabels } from "@/lib/app/mock-data";
import type { Role } from "@/lib/app/types";
import { toast } from "sonner";

// Public self-registration is restricted to low-privilege roles only.
// Elevated roles (admin, manager) must be assigned by an existing admin
// from the Users management page to prevent privilege escalation.
const SELF_REGISTRATION_ROLES: Role[] = ["operator", "analyst", "engineer"];

export const Route = createFileRoute("/register")({ component: RegisterPage });

function RegisterPage() {
  const { user, register } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "", role: "operator" as Role | "", department: "", position: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => { if (user) navigate({ to: "/app/dashboard" }); }, [user, navigate]);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!form.fullName) err.fullName = "FIO shart";
    if (!form.email) err.email = "Email shart"; else if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Email noto'g'ri";
    if (!form.password) err.password = "Parol shart"; else if (form.password.length < 6) err.password = "Kamida 6 belgi";
    if (!form.phone) err.phone = "Telefon shart";
    if (!form.role) err.role = "Rol tanlang";
    else if (!SELF_REGISTRATION_ROLES.includes(form.role as Role))
      err.role = "Bu rol faqat administrator tomonidan beriladi";
    if (!form.department) err.department = "Bo'lim tanlang";
    if (!form.position) err.position = "Lavozim shart";
    setErrors(err);
    if (Object.keys(err).length) return;
    const created = register({ fullName: form.fullName, email: form.email, password: form.password, phone: form.phone, role: form.role as Role, department: form.department, position: form.position });
    if (!created) { toast.error("Bu email mavjud"); return; }
    toast.success("Hisob yaratildi");
    navigate({ to: "/app/dashboard" });
  };
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 gradient-hero" /><div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative mx-auto flex min-h-screen max-w-3xl items-center px-4 py-12 sm:px-6">
        <div className="glass mx-auto w-full rounded-2xl p-8 shadow-card">
          <Link to="/" className="mb-6 flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-lg gradient-primary shadow-glow"><Gauge className="h-5 w-5 text-primary-foreground" /></div>
            <div className="leading-tight"><p className="text-sm font-semibold">AQLLI-ZAVOD</p><p className="text-[10px] uppercase tracking-widest text-muted-foreground">IoT Platform</p></div>
          </Link>
          <h1 className="text-2xl font-semibold">Ro'yxatdan o'tish</h1>
          <p className="mt-1 text-sm text-muted-foreground">Hisob yarating va platformaga kiring</p>
          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
            <div className="sm:col-span-2"><Label>FIO</Label><Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} className="mt-1" />{errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>}</div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="mt-1" />{errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}</div>
            <div><Label>Telefon</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+998..." className="mt-1" />{errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}</div>
            <div><Label>Parol</Label><Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} className="mt-1" />{errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}</div>
            <div><Label>Rol</Label>
              <Select value={form.role} onValueChange={(v) => set("role", v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Tanlang" /></SelectTrigger>
                <SelectContent>{SELF_REGISTRATION_ROLES.map((r) => <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>)}</SelectContent></Select>
              <p className="mt-1 text-[11px] text-muted-foreground">Admin va menejer rollari administrator tomonidan beriladi.</p>
              {errors.role && <p className="mt-1 text-xs text-destructive">{errors.role}</p>}</div>
            <div><Label>Bo'lim</Label>
              <Select value={form.department} onValueChange={(v) => set("department", v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Tanlang" /></SelectTrigger>
                <SelectContent>{departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
              {errors.department && <p className="mt-1 text-xs text-destructive">{errors.department}</p>}</div>
            <div className="sm:col-span-2"><Label>Lavozim</Label><Input value={form.position} onChange={(e) => set("position", e.target.value)} className="mt-1" />{errors.position && <p className="mt-1 text-xs text-destructive">{errors.position}</p>}</div>
            <Button type="submit" className="sm:col-span-2 gap-2"><UserPlus className="h-4 w-4" /> Ro'yxatdan o'tish</Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">Hisobingiz bormi? <Link to="/login" className="font-medium text-primary hover:underline">Kirish</Link></p>
        </div>
      </div>
    </div>
  );
}
