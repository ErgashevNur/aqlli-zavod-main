import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  alerts as seedAlerts,
  devices as seedDevices,
  demoUsers,
  logs as seedLogs,
  machines as seedMachines,
  maintenanceTasks as seedTasks,
  productionLines as seedLines,
} from "./mock-data";
import type {
  AlertItem,
  AlertStatus,
  Device,
  DeviceStatus,
  LogEntry,
  Machine,
  MachineStatus,
  MaintenanceTask,
  ProductionLine,
  Role,
  SensorReading,
  User,
} from "./types";

type Theme = "dark" | "light";

interface AppCtx {
  // auth
  user: User | null;
  users: User[];
  login: (email: string, password: string) => User | null;
  register: (u: Omit<User, "id" | "status" | "createdAt">) => User | null;
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;
  // user admin
  addUser: (u: Omit<User, "id" | "createdAt">) => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  deleteUser: (id: string) => void;
  // theme
  theme: Theme;
  toggleTheme: () => void;
  // devices
  devices: Device[];
  addDevice: (d: Omit<Device, "id" | "lastSeen" | "installedAt">) => void;
  updateDevice: (id: string, patch: Partial<Device>) => void;
  deleteDevice: (id: string) => void;
  // lines & machines
  lines: ProductionLine[];
  machines: Machine[];
  setMachineStatus: (id: string, status: MachineStatus) => void;
  // alerts
  alerts: AlertItem[];
  addAlert: (a: Omit<AlertItem, "id" | "createdAt" | "status">) => void;
  setAlertStatus: (id: string, status: AlertStatus) => void;
  // tasks
  tasks: MaintenanceTask[];
  addTask: (t: Omit<MaintenanceTask, "id" | "createdAt">) => void;
  updateTask: (id: string, patch: Partial<MaintenanceTask>) => void;
  deleteTask: (id: string) => void;
  // logs
  logs: LogEntry[];
  log: (entry: Omit<LogEntry, "id" | "at">) => void;
  // realtime sensor reading (global current snapshot per line)
  readings: Record<string, SensorReading>;
  history: { t: string; energy: number; productivity: number; temperature: number; vibration: number }[];
  // thresholds & settings
  thresholds: { temperature: number; vibration: number; energy: number; pressure: number };
  setThresholds: (t: AppCtx["thresholds"]) => void;
  updateInterval: number;
  setUpdateInterval: (n: number) => void;
}

const Ctx = createContext<AppCtx | null>(null);

const LS = {
  user: "iot.user",
  users: "iot.users",
  theme: "iot.theme",
  devices: "iot.devices",
  alerts: "iot.alerts",
  tasks: "iot.tasks",
  logs: "iot.logs",
  thresholds: "iot.thresholds",
  interval: "iot.interval",
  version: "iot.version",
};

// Bump this when seed data structure changes to force a fresh load
const DATA_VERSION = "2";

function migrateIfNeeded() {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(LS.version);
  if (stored !== DATA_VERSION) {
    // Clear devices and alerts so new simulator seed is used
    localStorage.removeItem(LS.devices);
    localStorage.removeItem(LS.alerts);
    localStorage.setItem(LS.version, DATA_VERSION);
  }
}

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, v: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* ignore */
  }
}

// Deterministic sine-wave oscillation — no Math.random(), values follow device settings.
// tick increments each interval so the wave moves forward in time.
const smooth = (
  prev: number,
  target: number,
  amplitude: number,
  lo: number,
  hi: number,
  phase: number,
  tick: number,
) => {
  const wave = Math.sin(tick * 0.18 + phase) * amplitude * 0.45;
  const v = prev * 0.88 + (target + wave) * 0.12;
  return Math.max(lo, Math.min(hi, +v.toFixed(2)));
};

// Generates per-line readings driven by simulator device parameters.
// When a simulator device is offline its sensor contribution drops to 0.
// tick is the global simulation step counter — passed in so oscillations are deterministic.
function genReadingFromSim(
  lineIds: string[],
  devices: Device[],
  prev: Record<string, SensorReading>,
  tick: number = 0,
): Record<string, SensorReading> {
  const tempSim = devices.find((d) => d.isSimulator && d.type === "Harorat sensori");
  const energySim = devices.find((d) => d.isSimulator && d.type === "Energiya hisoblagich");

  const tempOnline = !tempSim || tempSim.status === "online";
  const energyOnline = !energySim || energySim.status === "online";

  const tV = tempSim?.simValue ?? 65;
  const tJ = tempSim?.simJitter ?? 3;
  const tMin = tempSim?.simMin ?? 25;
  const tMax = tempSim?.simMax ?? 95;

  const eV = energySim?.simValue ?? 450;
  const eJ = energySim?.simJitter ?? 40;
  const eMin = energySim?.simMin ?? 100;
  const eMax = energySim?.simMax ?? 900;

  const next: Record<string, SensorReading> = {};
  for (const lineId of lineIds) {
    const p = prev[lineId];
    const energy = energyOnline
      ? smooth(p?.energy ?? eV, eV, eJ, eMin, eMax, 1.1, tick)
      : 0;
    // Productivity scales with energy device's output level (not random)
    const prodBase = energyOnline ? 50 + ((eV - eMin) / Math.max(1, eMax - eMin)) * 45 : 0;
    next[lineId] = {
      temperature: tempOnline
        ? smooth(p?.temperature ?? tV, tV, tJ, tMin, tMax, 0, tick)
        : 0,
      humidity:    smooth(p?.humidity    ?? 55,  55,  1.2, 30,  80,  2.1, tick),
      vibration:   smooth(p?.vibration   ?? 2.5, 2.5, 0.3, 0.2, 9,   3.3, tick),
      energy,
      pressure:    smooth(p?.pressure    ?? 5,   5,   0.2, 1,   12,  4.5, tick),
      current:     energyOnline ? smooth(p?.current ?? 50, energy * 0.11, 1.5, 5, 120, 1.8, tick) : 0,
      voltage:     smooth(p?.voltage     ?? 390, 390, 1.2, 360, 420, 0.3, tick),
      productivity: energyOnline
        ? smooth(p?.productivity ?? prodBase, prodBase, 1.5, 50, 99, 0.7, tick)
        : 0,
    };
  }
  return next;
}

export function AppProvider({ children }: { children: ReactNode }) {
  migrateIfNeeded();
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(demoUsers);
  const [theme, setTheme] = useState<Theme>("dark");
  const [devices, setDevices] = useState<Device[]>(seedDevices);
  const [lines, setLines] = useState<ProductionLine[]>(seedLines);
  const [machines, setMachines] = useState<Machine[]>(seedMachines);
  const [alerts, setAlerts] = useState<AlertItem[]>(seedAlerts);
  const [tasks, setTasks] = useState<MaintenanceTask[]>(seedTasks);
  const [logs, setLogs] = useState<LogEntry[]>(seedLogs);
  const [thresholds, setThresholdsState] = useState({
    temperature: 80,
    vibration: 6,
    energy: 750,
    pressure: 10,
  });
  const [updateInterval, setUpdateIntervalState] = useState<number>(3500);
  const tickRef = useRef(0);
  // Cooldown map: key = "lineId-metric", value = last alert timestamp (ms)
  const alertCooldownRef = useRef<Map<string, number>>(new Map());

  const [readings, setReadings] = useState<Record<string, SensorReading>>(() =>
    genReadingFromSim(seedLines.map((l) => l.id), seedDevices, {}, 0),
  );
  const [history, setHistory] = useState<AppCtx["history"]>(() => {
    const lineIds = seedLines.map((l) => l.id);
    const arr: AppCtx["history"] = [];
    const base = Date.now() - 20 * 60_000;
    let prevR: Record<string, SensorReading> = {};
    for (let i = 0; i < 20; i++) {
      prevR = genReadingFromSim(lineIds, seedDevices, prevR, i);
      const n = lineIds.length || 1;
      arr.push({
        t: new Date(base + i * 60_000).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
        energy: +(lineIds.reduce((s, lid) => s + (prevR[lid]?.energy ?? 0), 0) / n).toFixed(0),
        productivity: +(lineIds.reduce((s, lid) => s + (prevR[lid]?.productivity ?? 0), 0) / n).toFixed(1),
        temperature: +(lineIds.reduce((s, lid) => s + (prevR[lid]?.temperature ?? 0), 0) / n).toFixed(1),
        vibration: +(lineIds.reduce((s, lid) => s + (prevR[lid]?.vibration ?? 0), 0) / n).toFixed(2),
      });
    }
    return arr;
  });

  // Hydrate from localStorage AFTER mount to avoid SSR mismatches.
  useEffect(() => {
    setUser(load<User | null>(LS.user, null));
    setUsers(load<User[]>(LS.users, demoUsers));
    setTheme(load<Theme>(LS.theme, "dark"));
    setDevices(load<Device[]>(LS.devices, seedDevices));
    setAlerts(load<AlertItem[]>(LS.alerts, seedAlerts));
    setTasks(load<MaintenanceTask[]>(LS.tasks, seedTasks));
    setLogs(load<LogEntry[]>(LS.logs, seedLogs));
    setThresholdsState(load(LS.thresholds, { temperature: 80, vibration: 6, energy: 750, pressure: 10 }));
    setUpdateIntervalState(load<number>(LS.interval, 3500));
    setHydrated(true);
  }, []);

  // persistence (only after hydration)
  useEffect(() => { if (hydrated) save(LS.user, user); }, [hydrated, user]);
  useEffect(() => { if (hydrated) save(LS.users, users); }, [hydrated, users]);
  useEffect(() => { if (hydrated) save(LS.theme, theme); }, [hydrated, theme]);
  useEffect(() => { if (hydrated) save(LS.devices, devices); }, [hydrated, devices]);
  useEffect(() => { if (hydrated) save(LS.alerts, alerts); }, [hydrated, alerts]);
  useEffect(() => { if (hydrated) save(LS.tasks, tasks); }, [hydrated, tasks]);
  useEffect(() => { if (hydrated) save(LS.logs, logs); }, [hydrated, logs]);
  useEffect(() => { if (hydrated) save(LS.thresholds, thresholds); }, [hydrated, thresholds]);
  useEffect(() => { if (hydrated) save(LS.interval, updateInterval); }, [hydrated, updateInterval]);

  // theme effect
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Track previous devices to detect changes for immediate reading update
  const prevDevicesRef = useRef(devices);

  // Immediate reading recalculation when simulator devices change (e.g. status or simValue edit)
  useEffect(() => {
    if (prevDevicesRef.current === devices) return;
    prevDevicesRef.current = devices;
    setReadings((prev) => genReadingFromSim(lines.map((l) => l.id), devices, prev, tickRef.current));
  }, [devices, lines]);

  // Realtime simulation: readings driven by simulator device parameters, no Math.random()
  useEffect(() => {
    const lineIds = lines.map((l) => l.id);
    const COOLDOWN_MS = 30_000; // one alert per metric per line every 30 s
    const id = window.setInterval(() => {
      tickRef.current += 1;
      const tick = tickRef.current;
      setReadings((prev) => {
        const next = genReadingFromSim(lineIds, devices, prev, tick);
        const n = lineIds.length || 1;

        const avgT = lineIds.reduce((s, lid) => s + (next[lid]?.temperature ?? 0), 0) / n;
        const avgE = lineIds.reduce((s, lid) => s + (next[lid]?.energy ?? 0), 0) / n;
        const avgP = lineIds.reduce((s, lid) => s + (next[lid]?.productivity ?? 0), 0) / n;
        const avgV = lineIds.reduce((s, lid) => s + (next[lid]?.vibration ?? 0), 0) / n;
        setHistory((h) => [
          ...h.slice(-29),
          {
            t: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            energy: +avgE.toFixed(0),
            productivity: +avgP.toFixed(1),
            temperature: +avgT.toFixed(1),
            vibration: +avgV.toFixed(2),
          },
        ]);

        // Alerts fire deterministically when threshold exceeded, with 30 s cooldown (no Math.random)
        const now = Date.now();
        const cd = alertCooldownRef.current;
        for (const l of lines) {
          const r = next[l.id];
          if (!r) continue;

          const tempKey = `${l.id}-temp`;
          if (r.temperature > 0 && r.temperature > thresholds.temperature && now - (cd.get(tempKey) ?? 0) > COOLDOWN_MS) {
            cd.set(tempKey, now);
            const lvl: AlertItem["level"] = r.temperature > thresholds.temperature + 6 ? "Kritik" : "Yuqori";
            const newAlert: AlertItem = {
              id: `a-${now}t`,
              title: "Harorat me'yordan oshdi",
              message: `${l.name} da harorat ${r.temperature.toFixed(1)}°C ga yetdi`,
              level: lvl, status: "Yangi", source: "Harorat Simulyatori",
              lineId: l.id, deviceId: "sim-001", createdAt: new Date().toISOString(),
            };
            setAlerts((a) => [newAlert, ...a].slice(0, 60));
            toast[lvl === "Kritik" ? "error" : "warning"](newAlert.title, { description: newAlert.message, duration: 6000 });
          }

          const energyKey = `${l.id}-energy`;
          if (r.energy > 0 && r.energy > thresholds.energy && now - (cd.get(energyKey) ?? 0) > COOLDOWN_MS) {
            cd.set(energyKey, now);
            const newAlert: AlertItem = {
              id: `a-${now}e`,
              title: "Energiya sarfi me'yordan oshdi",
              message: `${l.name} da energiya ${r.energy.toFixed(0)} kWh ga yetdi`,
              level: "Yuqori", status: "Yangi", source: "Energiya Simulyatori",
              lineId: l.id, deviceId: "sim-002", createdAt: new Date().toISOString(),
            };
            setAlerts((a) => [newAlert, ...a].slice(0, 60));
            toast.warning(newAlert.title, { description: newAlert.message, duration: 6000 });
          }

          const vibKey = `${l.id}-vib`;
          if (r.vibration > thresholds.vibration && now - (cd.get(vibKey) ?? 0) > COOLDOWN_MS) {
            cd.set(vibKey, now);
            const lvl: AlertItem["level"] = r.vibration > thresholds.vibration + 2 ? "Kritik" : "Yuqori";
            const newAlert: AlertItem = {
              id: `a-${now}v`,
              title: "Vibratsiya me'yordan oshdi",
              message: `${l.name} da vibratsiya ${r.vibration.toFixed(2)} mm/s ga yetdi`,
              level: lvl, status: "Yangi", source: "Real-time tahlilchi",
              lineId: l.id, createdAt: new Date().toISOString(),
            };
            setAlerts((a) => [newAlert, ...a].slice(0, 60));
            toast[lvl === "Kritik" ? "error" : "warning"](newAlert.title, { description: newAlert.message, duration: 6000 });
          }
        }
        return next;
      });
    }, updateInterval);
    return () => window.clearInterval(id);
  }, [lines, devices, thresholds, updateInterval]);

  const log = useCallback((entry: Omit<LogEntry, "id" | "at">) => {
    setLogs((l) => [{ ...entry, id: `l-${Date.now()}`, at: new Date().toISOString() }, ...l].slice(0, 200));
  }, []);

  const value: AppCtx = useMemo(
    () => ({
      user,
      users,
      login: (email, password) => {
        const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (found) {
          setUser(found);
          log({ actor: found.fullName, action: "Tizimga kirdi", target: found.email, category: "auth" });
          return found;
        }
        return null;
      },
      register: (u) => {
        if (users.some((x) => x.email.toLowerCase() === u.email.toLowerCase())) return null;
        // Server-side equivalent guard: self-registration cannot grant elevated roles.
        const allowedSelfRoles: Role[] = ["operator", "analyst", "engineer"];
        const safeRole: Role = allowedSelfRoles.includes(u.role) ? u.role : "operator";
        const created: User = { ...u, role: safeRole, id: `u-${Date.now()}`, status: "faol", createdAt: new Date().toISOString().slice(0, 10) };
        setUsers((arr) => [...arr, created]);
        setUser(created);
        log({ actor: created.fullName, action: "Roʻyxatdan oʻtdi", target: created.email, category: "auth" });
        return created;
      },
      logout: () => {
        if (user) log({ actor: user.fullName, action: "Tizimdan chiqdi", target: user.email, category: "auth" });
        setUser(null);
      },
      updateProfile: (patch) => {
        if (!user) return;
        const merged = { ...user, ...patch };
        setUser(merged);
        setUsers((arr) => arr.map((u) => (u.id === user.id ? merged : u)));
      },
      addUser: (u) => {
        const created: User = { ...u, id: `u-${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10) };
        setUsers((arr) => [...arr, created]);
        log({ actor: user?.fullName ?? "Tizim", action: "Foydalanuvchi qoʻshildi", target: created.fullName, category: "user" });
      },
      updateUser: (id, patch) => {
        setUsers((arr) => arr.map((u) => (u.id === id ? { ...u, ...patch } : u)));
      },
      deleteUser: (id) => {
        const u = users.find((x) => x.id === id);
        setUsers((arr) => arr.filter((x) => x.id !== id));
        if (u) log({ actor: user?.fullName ?? "Tizim", action: "Foydalanuvchi oʻchirildi", target: u.fullName, category: "user" });
      },
      theme,
      toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      devices,
      addDevice: (d) => {
        const created: Device = {
          ...d,
          id: `d-${Date.now()}`,
          lastSeen: "hozir",
          installedAt: new Date().toISOString().slice(0, 10),
        };
        setDevices((arr) => [created, ...arr]);
        log({ actor: user?.fullName ?? "Tizim", action: "Qurilma qoʻshildi", target: created.name, category: "device" });
      },
      updateDevice: (id, patch) =>
        setDevices((arr) => arr.map((d) => (d.id === id ? { ...d, ...patch } : d))),
      deleteDevice: (id) => {
        const d = devices.find((x) => x.id === id);
        setDevices((arr) => arr.filter((x) => x.id !== id));
        if (d) log({ actor: user?.fullName ?? "Tizim", action: "Qurilma oʻchirildi", target: d.name, category: "device" });
      },
      lines,
      machines,
      setMachineStatus: (id, status) => {
        setMachines((arr) => arr.map((m) => (m.id === id ? { ...m, status } : m)));
        const m = machines.find((x) => x.id === id);
        if (m) log({ actor: user?.fullName ?? "Tizim", action: `Mashina holati: ${status}`, target: m.name, category: "device" });
      },
      alerts,
      addAlert: (a) =>
        setAlerts((arr) => [
          { ...a, id: `a-${Date.now()}`, status: "Yangi", createdAt: new Date().toISOString() },
          ...arr,
        ]),
      setAlertStatus: (id, status) => {
        setAlerts((arr) =>
          arr.map((a) => (a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a)),
        );
        log({ actor: user?.fullName ?? "Tizim", action: `Alert holati: ${status}`, target: id, category: "alert" });
      },
      tasks,
      addTask: (t) => {
        const created: MaintenanceTask = { ...t, id: `t-${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10) };
        setTasks((arr) => [created, ...arr]);
        log({ actor: user?.fullName ?? "Tizim", action: "Texnik xizmat vazifasi yaratildi", target: created.title, category: "maintenance" });
      },
      updateTask: (id, patch) => setTasks((arr) => arr.map((t) => (t.id === id ? { ...t, ...patch } : t))),
      deleteTask: (id) => setTasks((arr) => arr.filter((t) => t.id !== id)),
      logs,
      log,
      readings,
      history,
      thresholds,
      setThresholds: (t) => setThresholdsState(t),
      updateInterval,
      setUpdateInterval: (n) => setUpdateIntervalState(n),
    }),
    [user, users, theme, devices, lines, machines, alerts, tasks, logs, readings, history, thresholds, updateInterval, log],
  );

  // unused warning suppress for setLines (kept for future)
  void setLines;

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be inside AppProvider");
  return v;
}

export function useHasAccess(roles: Role[]) {
  const { user } = useApp();
  return user ? roles.includes(user.role) : false;
}

// helper for status colors
export const statusColor = (s: string): "success" | "warning" | "destructive" | "muted" | "info" => {
  if (["faol", "online", "Hal qilindi", "Bajarildi"].includes(s)) return "success";
  if (["ogohlantirish", "Yangi", "Yuqori", "Jarayonda", "Rejalashtirilgan"].includes(s)) return "warning";
  if (["to'xtagan", "offline", "Kritik", "Shoshilinch"].includes(s)) return "destructive";
  if (["xizmatda"].includes(s)) return "info";
  return "muted";
};

// device status helper used in views
export const deviceStatusLabel = (s: DeviceStatus) =>
  ({ online: "Onlayn", offline: "Oflayn", ogohlantirish: "Ogohlantirish", xizmatda: "Xizmatda" } as const)[s];