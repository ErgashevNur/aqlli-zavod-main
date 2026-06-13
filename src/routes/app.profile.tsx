import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/app/store";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { roleLabels } from "@/lib/app/mock-data";
import { toast } from "sonner";
export const Route = createFileRoute("/app/profile")({ component: Profile });
function Profile() {
  const { user, updateProfile } = useApp();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", department: "", position: "" });
  useEffect(() => { if (user) setForm({ fullName: user.fullName, email: user.email, phone: user.phone ?? "", department: user.department ?? "", position: user.position ?? "" }); }, [user]);
  if (!user) return null;
  return (
    <div>
      <PageHeader title="Profil" description="Shaxsiy ma'lumotlaringiz" />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-xl p-6 shadow-card text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">{user.fullName.charAt(0)}</div>
          <h2 className="mt-3 text-lg font-semibold">{user.fullName}</h2>
          <p className="text-xs text-muted-foreground">{roleLabels[user.role]}</p>
          <div className="mt-3 flex justify-center"><StatusBadge status={user.status === "faol" ? "faol" : "to'xtagan"} /></div>
          <div className="mt-4 space-y-1 text-left text-xs text-muted-foreground">
            <p><span className="font-medium text-foreground">Email:</span> {user.email}</p>
            <p><span className="font-medium text-foreground">Telefon:</span> {user.phone}</p>
            <p><span className="font-medium text-foreground">Bo'lim:</span> {user.department}</p>
            <p><span className="font-medium text-foreground">Lavozim:</span> {user.position}</p>
            <p><span className="font-medium text-foreground">Ro'yxatdan:</span> {user.createdAt}</p>
          </div>
        </div>
        <div className="glass rounded-xl p-6 shadow-card lg:col-span-2">
          <h3 className="text-sm font-semibold">Ma'lumotlarni tahrirlash</h3>
          <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={e => { e.preventDefault(); updateProfile(form); toast.success("Profil saqlandi"); }}>
            <div className="sm:col-span-2"><Label>FIO</Label><Input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="mt-1" /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1" /></div>
            <div><Label>Telefon</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="mt-1" /></div>
            <div><Label>Bo'lim</Label><Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="mt-1" /></div>
            <div><Label>Lavozim</Label><Input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} className="mt-1" /></div>
            <Button type="submit" className="sm:col-span-2">Saqlash</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
