import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useApp } from "@/lib/app/store";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MaintenancePriority, MaintenanceStatus } from "@/lib/app/types";
import { toast } from "sonner";
export const Route = createFileRoute("/app/maintenance")({ component: Maintenance });
function Maintenance() {
  const { tasks, machines, addTask, updateTask, deleteTask, users } = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", machineId: machines[0]?.id ?? "", assignee: users[2]?.fullName ?? "", priority: "O'rta" as MaintenancePriority, status: "Rejalashtirilgan" as MaintenanceStatus, deadline: new Date(Date.now() + 7*86400000).toISOString().slice(0,10), notes: "" });
  const submit = () => {
    if (!form.title.trim()) { toast.error("Sarlavha shart"); return; }
    addTask(form); toast.success("Vazifa yaratildi"); setOpen(false);
    setForm({ ...form, title: "", notes: "" });
  };
  return (
    <div>
      <PageHeader title="Texnik xizmat" description="Vazifalar va profilaktik xizmat rejasi"
        actions={<Button onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Yangi vazifa</Button>} />
      <div className="glass rounded-xl p-4 shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="py-2 pr-3">Vazifa</th><th className="py-2 pr-3">Mashina</th><th className="py-2 pr-3">Mas'ul</th>
            <th className="py-2 pr-3">Muhimlik</th><th className="py-2 pr-3">Muddat</th><th className="py-2 pr-3">Holat</th><th className="py-2 text-right">Amal</th>
          </tr></thead>
          <tbody>{tasks.map(t => { const m = machines.find(x => x.id === t.machineId); return (
            <tr key={t.id} className="border-b border-border/60 last:border-0">
              <td className="py-2 pr-3"><p className="font-medium">{t.title}</p><p className="text-[11px] text-muted-foreground line-clamp-1">{t.notes}</p></td>
              <td className="py-2 pr-3 text-muted-foreground">{m?.name ?? "—"}</td>
              <td className="py-2 pr-3 text-muted-foreground">{t.assignee}</td>
              <td className="py-2 pr-3"><StatusBadge status={t.priority} /></td>
              <td className="py-2 pr-3 text-muted-foreground">{t.deadline}</td>
              <td className="py-2 pr-3">
                <Select value={t.status} onValueChange={v => updateTask(t.id, { status: v as MaintenanceStatus })}>
                  <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Rejalashtirilgan","Jarayonda","Bajarildi","Bekor qilindi"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </td>
              <td className="py-2 text-right"><Button variant="ghost" size="icon" onClick={() => deleteTask(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>
            </tr>);
          })}</tbody>
        </table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Yangi texnik xizmat vazifasi</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>Sarlavha</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-1" /></div>
            <div><Label>Mashina</Label><Select value={form.machineId} onValueChange={v => setForm({ ...form, machineId: v })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{machines.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Mas'ul</Label><Input value={form.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })} className="mt-1" /></div>
              <div><Label>Muddat</Label><Input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="mt-1" /></div>
            </div>
            <div><Label>Muhimlik</Label><Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v as MaintenancePriority })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{["Past","O'rta","Yuqori","Shoshilinch"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Izoh</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="mt-1" /></div>
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Bekor</Button><Button onClick={submit}>Yaratish</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
