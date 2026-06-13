import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Cpu, Pencil, Plus, Search, Trash2, Zap, Thermometer } from "lucide-react";
import { useApp, deviceStatusLabel } from "@/lib/app/store";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { ConfirmDialog } from "@/components/app/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyAccess } from "@/components/app/EmptyAccess";
import { rolePermissions } from "@/lib/app/mock-data";
import type { Device, DeviceStatus, DeviceType } from "@/lib/app/types";
import { toast } from "sonner";

export const Route = createFileRoute("/app/devices")({ component: Devices });

const TYPES: DeviceType[] = ["Harorat sensori","Namlik sensori","Vibratsiya sensori","Energiya hisoblagich","Bosim sensori","Mashina holati sensori","Xavfsizlik sensori","Gaz sensori"];
const STATUSES: DeviceStatus[] = ["online","offline","ogohlantirish","xizmatda"];

const SIM_UNITS: Record<string, string> = {
  "Harorat sensori": "°C",
  "Energiya hisoblagich": "kWh",
  "Namlik sensori": "%",
  "Vibratsiya sensori": "mm/s",
  "Bosim sensori": "bar",
};

type FormState = {
  name: string;
  type: DeviceType;
  lineId: string;
  status: DeviceStatus;
  signal: number;
  simValue: number;
  simMin: number;
  simMax: number;
  simJitter: number;
};

function Devices() {
  const { user, devices, lines, readings, addDevice, updateDevice, deleteDevice } = useApp();
  const [q, setQ] = useState("");
  const [sf, setSf] = useState("all");
  const [editing, setEditing] = useState<Device | null>(null);
  const [open, setOpen] = useState(false);
  const [del, setDel] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    type: TYPES[0],
    lineId: lines[0]?.id ?? "",
    status: "online",
    signal: 90,
    simValue: 65,
    simMin: 25,
    simMax: 95,
    simJitter: 3,
  });

  if (!user || !rolePermissions[user.role].includes("devices")) return <EmptyAccess />;

  const simulators = devices.filter((d) => d.isSimulator);
  const nonSimulators = devices.filter((d) => !d.isSimulator);

  const filtered = useMemo(
    () => nonSimulators.filter(
      (d) =>
        (sf === "all" || d.status === sf) &&
        (d.name.toLowerCase().includes(q.toLowerCase()) || d.type.toLowerCase().includes(q.toLowerCase())),
    ),
    [nonSimulators, q, sf],
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", type: TYPES[0], lineId: lines[0]?.id ?? "", status: "online", signal: 90, simValue: 65, simMin: 25, simMax: 95, simJitter: 3 });
    setOpen(true);
  };

  const openEdit = (d: Device) => {
    setEditing(d);
    setForm({
      name: d.name,
      type: d.type,
      lineId: d.lineId,
      status: d.status,
      signal: d.signal,
      simValue: d.simValue ?? 65,
      simMin: d.simMin ?? 25,
      simMax: d.simMax ?? 95,
      simJitter: d.simJitter ?? 3,
    });
    setOpen(true);
  };

  const submit = () => {
    if (!form.name.trim()) { toast.error("Nom shart"); return; }
    if (!editing && devices.some((d) => d.name.toLowerCase() === form.name.toLowerCase())) { toast.error("Mavjud"); return; }
    if (editing) {
      const patch: Partial<Device> = {
        name: form.name,
        type: form.type,
        lineId: form.lineId,
        status: form.status,
        signal: form.signal,
      };
      if (editing.isSimulator) {
        patch.simValue = Number(form.simValue);
        patch.simMin = Number(form.simMin);
        patch.simMax = Number(form.simMax);
        patch.simJitter = Number(form.simJitter);
      }
      updateDevice(editing.id, patch);
      toast.success("Yangilandi");
    } else {
      addDevice(form);
      toast.success("Qo'shildi");
    }
    setOpen(false);
  };

  // Get current live reading value for each simulator
  const getSimLiveValue = (d: Device): string => {
    const lineReadings = readings[d.lineId];
    if (!lineReadings) return "—";
    const unit = SIM_UNITS[d.type] ?? "";
    if (d.type === "Harorat sensori") return `${lineReadings.temperature.toFixed(1)} ${unit}`;
    if (d.type === "Energiya hisoblagich") return `${lineReadings.energy.toFixed(0)} ${unit}`;
    return "—";
  };

  return (
    <div>
      <PageHeader
        title="IoT qurilmalar boshqaruvi"
        description="Sensorlar va simulyatorlar"
        actions={<Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" /> Qo'shish</Button>}
      />

      {/* Simulator devices — always shown at top */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Simulyator qurilmalar</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {simulators.map((d) => {
            const liveVal = getSimLiveValue(d);
            const unit = SIM_UNITS[d.type] ?? "";
            const Icon = d.type === "Harorat sensori" ? Thermometer : Zap;
            const isOnline = d.status === "online";
            return (
              <div key={d.id} className="glass rounded-xl p-5 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isOnline ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={deviceStatusLabel(d.status)} />
                    <Button variant="ghost" size="icon" onClick={() => openEdit(d)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="rounded-lg bg-muted/40 p-2">
                    <p className="text-muted-foreground mb-1">Joriy qiymat</p>
                    <p className={`font-bold text-base ${isOnline ? "text-foreground" : "text-muted-foreground"}`}>
                      {isOnline ? liveVal : `0 ${unit}`}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-2">
                    <p className="text-muted-foreground mb-1">Asosiy qiymat</p>
                    <p className="font-semibold text-foreground">{d.simValue} {unit}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-2">
                    <p className="text-muted-foreground mb-1">Diapazon</p>
                    <p className="font-semibold text-foreground">{d.simMin}–{d.simMax}</p>
                  </div>
                </div>

                {!isOnline && (
                  <div className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive font-medium text-center">
                    Qurilma o'chirilgan — barcha ko'rsatkichlar 0
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Regular devices list */}
      {nonSimulators.length > 0 && (
        <div className="glass rounded-xl p-4 shadow-card">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Qidirish..." className="pl-9" />
            </div>
            <Select value={sf} onValueChange={setSf}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha holatlar</SelectItem>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{deviceStatusLabel(s)}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="ml-auto text-xs text-muted-foreground">{filtered.length} / {nonSimulators.length}</span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3">Nomi</th>
                  <th className="py-2 pr-3">Tur</th>
                  <th className="py-2 pr-3">Liniya</th>
                  <th className="py-2 pr-3">Signal</th>
                  <th className="py-2 pr-3">Holat</th>
                  <th className="py-2 text-right">Amal</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => {
                  const line = lines.find((l) => l.id === d.lineId);
                  return (
                    <tr key={d.id} className="border-b border-border/60 last:border-0">
                      <td className="py-2 pr-3 font-mono text-[11px] text-muted-foreground">{d.id}</td>
                      <td className="py-2 pr-3 font-medium">
                        <div className="flex items-center gap-2"><Cpu className="h-4 w-4 text-primary" /> {d.name}</div>
                      </td>
                      <td className="py-2 pr-3 text-muted-foreground">{d.type}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{line?.name ?? "—"}</td>
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                            <div className={`h-full ${d.signal > 70 ? "bg-success" : d.signal > 40 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${d.signal}%` }} />
                          </div>
                          <span className="text-xs">{d.signal}%</span>
                        </div>
                      </td>
                      <td className="py-2 pr-3"><StatusBadge status={deviceStatusLabel(d.status)} /></td>
                      <td className="py-2 text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(d)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDel(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">Topilmadi</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing?.isSimulator
                ? `Simulyator sozlamalari — ${editing.name}`
                : editing ? "Qurilmani tahrirlash" : "Yangi qurilma"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label>Nomi</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1"
                disabled={!!editing?.isSimulator} />
            </div>
            {!editing?.isSimulator && (
              <>
                <div>
                  <Label>Tur</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as DeviceType })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Liniya</Label>
                  <Select value={form.lineId} onValueChange={(v) => setForm({ ...form, lineId: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{lines.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Holat</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as DeviceStatus })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{deviceStatusLabel(s)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {!editing?.isSimulator && (
                <div>
                  <Label>Signal %</Label>
                  <Input type="number" min={0} max={100} value={form.signal}
                    onChange={(e) => setForm({ ...form, signal: Number(e.target.value) })} className="mt-1" />
                </div>
              )}
            </div>

            {editing?.isSimulator && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-primary border-primary/40 text-xs">Simulator parametrlari</Badge>
                  <span className="text-xs text-muted-foreground">({SIM_UNITS[editing.type] ?? "birlik"})</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Asosiy qiymat</Label>
                    <Input type="number" value={form.simValue}
                      onChange={(e) => setForm({ ...form, simValue: Number(e.target.value) })} className="mt-1" />
                  </div>
                  <div>
                    <Label>O'zgaruvchanlik (jitter)</Label>
                    <Input type="number" min={0} value={form.simJitter}
                      onChange={(e) => setForm({ ...form, simJitter: Number(e.target.value) })} className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Min qiymat</Label>
                    <Input type="number" value={form.simMin}
                      onChange={(e) => setForm({ ...form, simMin: Number(e.target.value) })} className="mt-1" />
                  </div>
                  <div>
                    <Label>Max qiymat</Label>
                    <Input type="number" value={form.simMax}
                      onChange={(e) => setForm({ ...form, simMax: Number(e.target.value) })} className="mt-1" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Asosiy qiymat o'zgartirilganda platform ko'rsatkichlari (grafik, dashboard) shu qiymat atrofida yangilanadi.
                  Holat "Oflayn" bo'lsa barcha ko'rsatkichlar 0 ga tushadi.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Bekor</Button>
            <Button onClick={submit}>{editing ? "Saqlash" : "Qo'shish"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!del}
        onOpenChange={(v) => !v && setDel(null)}
        title="O'chirish"
        description="Davom etasizmi?"
        destructive
        onConfirm={() => { if (del) { deleteDevice(del); toast.success("O'chirildi"); setDel(null); } }}
      />
    </div>
  );
}
