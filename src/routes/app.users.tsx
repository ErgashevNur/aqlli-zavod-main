import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { useApp } from "@/lib/app/store";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { ConfirmDialog } from "@/components/app/ConfirmDialog";
import { EmptyAccess } from "@/components/app/EmptyAccess";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { departments, roleLabels } from "@/lib/app/mock-data";
import type { Role } from "@/lib/app/types";
import { toast } from "sonner";
export const Route = createFileRoute("/app/users")({ component: Users });
function Users() {
  const { user, users, addUser, updateUser, deleteUser } = useApp();
  const [q, setQ] = useState(""); const [rf, setRf] = useState("all");
  const [open, setOpen] = useState(false); const [del, setDel] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: "", email: "", password: "user12345", phone: "", role: "operator" as Role, department: departments[0], position: "" });
  if (!user || user.role !== "admin") return <EmptyAccess message="Bu sahifa faqat Super Admin uchun" />;
  const filtered = useMemo(() => users.filter(u => (rf === "all" || u.role === rf) && (u.fullName.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()))), [users, q, rf]);
  const submit = () => {
    if (!form.fullName || !form.email) { toast.error("Maydonlar to'liq emas"); return; }
    if (users.some(u => u.email.toLowerCase() === form.email.toLowerCase())) { toast.error("Email mavjud"); return; }
    addUser({ ...form, status: "faol" });
    toast.success("Foydalanuvchi qo'shildi"); setOpen(false);
  };
  return (
    <div>
      <PageHeader title="Foydalanuvchilar" description="Tizim foydalanuvchilarini boshqarish"
        actions={<Button onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Qo'shish</Button>} />
      <div className="glass rounded-xl p-4 shadow-card">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[220px]"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={e => setQ(e.target.value)} placeholder="Qidirish..." className="pl-9" /></div>
          <Select value={rf} onValueChange={setRf}><SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">Barcha rollar</SelectItem>{Object.entries(roleLabels).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2 pr-3">FIO</th><th className="py-2 pr-3">Email</th><th className="py-2 pr-3">Rol</th>
              <th className="py-2 pr-3">Bo'lim</th><th className="py-2 pr-3">Holat</th><th className="py-2 text-right">Amal</th>
            </tr></thead>
            <tbody>{filtered.map(u => (
              <tr key={u.id} className="border-b border-border/60 last:border-0">
                <td className="py-2 pr-3"><p className="font-medium">{u.fullName}</p><p className="text-[11px] text-muted-foreground">{u.position}</p></td>
                <td className="py-2 pr-3 text-muted-foreground">{u.email}</td>
                <td className="py-2 pr-3">
                  <Select value={u.role} onValueChange={v => updateUser(u.id, { role: v as Role })}>
                    <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(roleLabels).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
                <td className="py-2 pr-3 text-muted-foreground">{u.department}</td>
                <td className="py-2 pr-3">
                  <button onClick={() => updateUser(u.id, { status: u.status === "faol" ? "bloklangan" : "faol" })}>
                    <StatusBadge status={u.status === "faol" ? "faol" : "to'xtagan"} />
                  </button>
                </td>
                <td className="py-2 text-right"><Button variant="ghost" size="icon" onClick={() => setDel(u.id)} disabled={u.id === user.id}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Yangi foydalanuvchi</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>FIO</Label><Input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1" /></div>
              <div><Label>Telefon</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Rol</Label><Select value={form.role} onValueChange={v => setForm({ ...form, role: v as Role })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(roleLabels).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Bo'lim</Label><Select value={form.department} onValueChange={v => setForm({ ...form, department: v })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div><Label>Lavozim</Label><Input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} className="mt-1" /></div>
            <div><Label>Parol</Label><Input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="mt-1" /></div>
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Bekor</Button><Button onClick={submit}>Qo'shish</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={!!del} onOpenChange={v => !v && setDel(null)} title="Foydalanuvchini o'chirish" destructive
        onConfirm={() => { if (del) { deleteUser(del); toast.success("O'chirildi"); setDel(null); } }} />
    </div>
  );
}
