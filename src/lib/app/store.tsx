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

const j = (v: number, span: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, +(v + (Math.random() - 0.5) * span).toFixed(2)));

// Generates per-line readings driven by simulator device parameters.
// When a simulator device is offline its sensor contribution drops to 0.
function genReadingFromSim(
  lineIds: string[],
  devices: Device[],
  prev: Record<string, SensorReading>,
): Record<string, SensorReading> {
  const tempSim = devices.find((d) => d.isSimulator && d.type === "Harorat sensori");
  const energySim = devices.find((d) => d.isSimulator && d.type === "Energiya hisoblagich");

  const tempOnline = !tempSim || tempSim.status === "online";
  const energyOnline = !energySim || energySim.status === "online";

  const next: Record<string, SensorReading> = {};
  for (const lineId of lineIds) {
    const p = prev[lineId];
    next[lineId] = {
      temperature: tempOnline
        ? j(p?.temperature ?? (tempSim?.simValue ?? 65), tempSim?.simJitter ?? 3, tempSim?.simMin ?? 25, tempSim?.simMax ?? 95)
        : 0,
      humidity: j(p?.humidity ?? 55, 3, 30, 80),
      vibration: j(p?.vibration ?? 2.5, 1.2, 0.2, 9),
      energy: energyOnline
        ? j(p?.energy ?? (energySim?.simValue ?? 450), energySim?.simJitter ?? 40, energySim?.simMin ?? 100, energySim?.simMax ?? 900)
        : 0,
      pressure: j(p?.pressure ?? 5, 1, 1, 12),
      current: energyOnline ? j(p?.current ?? 50, 8, 5, 120) : 0,
      voltage: j(p?.voltage ?? 390, 4, 360, 420),
      productivity: energyOnline ? j(p?.productivity ?? 82, 3, 50, 99) : 0,
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
  const [readings, setReadings] = useState<Record<string, SensorReading>>(() =>
    genReadingFromSim(seedLines.map((l) => l.id), seedDevices, {}),
  );
  const [history, setHistory] = useState<AppCtx["history"]>(() => {
    const lineIds = seedLines.map((l) => l.id);
    const arr: AppCtx["history"] = [];
    const base = Date.now() - 20 * 60_000;
    let prevR: Record<string, SensorReading> = {};
    for (let i = 0; i < 20; i++) {
      prevR = genReadingFromSim(lineIds, seedDevices, prevR);
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
    setReadings((prev) => genReadingFromSim(lines.map((l) => l.id), devices, prev));
  }, [devices, lines]);

  // Realtime simulation: readings driven by simulator device parameters
  useEffect(() => {
    const lineIds = lines.map((l) => l.id);
    const id = window.setInterval(() => {
      setReadings((prev) => {
        const next = genReadingFromSim(lineIds, devices, prev);
        const n = lineIds.length || 1;

        // History entry from actual readings (not random)
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

        // Alerts only when actual readings exceed thresholds (not randomly)
        for (const l of lines) {
          const r = next[l.id];
          if (!r) continue;
          if (r.temperature > 0 && r.temperature > thresholds.temperature && Math.random() < 0.15) {
            const lvl: AlertItem["level"] = r.temperature > thresholds.temperature + 6 ? "Kritik" : "Yuqori";
            const newAlert: AlertItem = {
              id: `a-${Date.now()}t`,
              title: "Harorat me'yordan oshdi",
              message: `${l.name} da harorat ${r.temperature.toFixed(1)}°C ga yetdi`,
              level: lvl,
              status: "Yangi",
              source: "Harorat Simulyatori",
              lineId: l.id,
              deviceId: "sim-001",
              createdAt: new Date().toISOString(),
            };
            setAlerts((a) => [newAlert, ...a].slice(0, 60));
          }
          if (r.energy > 0 && r.energy > thresholds.energy && Math.random() < 0.1) {
            const newAlert: AlertItem = {
              id: `a-${Date.now()}e`,
              title: "Energiya sarfi me'yordan oshdi",
              message: `${l.name} da energiya ${r.energy.toFixed(0)} kWh ga yetdi`,
              level: "Yuqori",
              status: "Yangi",
              source: "Energiya Simulyatori",
              lineId: l.id,
              deviceId: "sim-002",
              createdAt: new Date().toISOString(),
            };
            setAlerts((a) => [newAlert, ...a].slice(0, 60));
          }
          if (r.vibration > thresholds.vibration && Math.random() < 0.1) {
            const lvl: AlertItem["level"] = r.vibration > thresholds.vibration + 2 ? "Kritik" : "Yuqori";
            const newAlert: AlertItem = {
              id: `a-${Date.now()}v`,
              title: "Vibratsiya me'yordan oshdi",
              message: `${l.name} da vibratsiya ${r.vibration.toFixed(2)} mm/s ga yetdi`,
              level: lvl,
              status: "Yangi",
              source: "Real-time tahlilchi",
              lineId: l.id,
              createdAt: new Date().toISOString(),
            };
            setAlerts((a) => [newAlert, ...a].slice(0, 60));
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