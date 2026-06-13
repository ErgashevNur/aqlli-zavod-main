export type Role = "admin" | "manager" | "engineer" | "operator" | "analyst";

export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: Role;
  department?: string;
  position?: string;
  status: "faol" | "bloklangan";
  createdAt: string;
}

export type DeviceType =
  | "Harorat sensori"
  | "Namlik sensori"
  | "Vibratsiya sensori"
  | "Energiya hisoblagich"
  | "Bosim sensori"
  | "Mashina holati sensori"
  | "Xavfsizlik sensori"
  | "Gaz sensori";

export type DeviceStatus = "online" | "offline" | "ogohlantirish" | "xizmatda";

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  lineId: string;
  machineId?: string;
  status: DeviceStatus;
  signal: number; // 0-100
  lastSeen: string;
  installedAt: string;
  // Simulator-specific fields (only for isSimulator devices)
  isSimulator?: boolean;
  simValue?: number;  // base/target value set by user
  simMin?: number;
  simMax?: number;
  simJitter?: number; // max change per tick
}

export type MachineStatus = "faol" | "ogohlantirish" | "to'xtagan" | "xizmatda";

export interface Machine {
  id: string;
  name: string;
  lineId: string;
  status: MachineStatus;
  operator: string;
  efficiency: number;
  uptimeHours: number;
}

export interface ProductionLine {
  id: string;
  name: string;
  description: string;
  status: MachineStatus;
  productivity: number;
  downtime: number;
  energy: number;
  operator: string;
}

export type AlertLevel = "Past" | "O'rta" | "Yuqori" | "Kritik";
export type AlertStatus = "Yangi" | "Jarayonda" | "Hal qilindi";

export interface AlertItem {
  id: string;
  title: string;
  message: string;
  level: AlertLevel;
  status: AlertStatus;
  source: string;
  lineId?: string;
  deviceId?: string;
  createdAt: string;
  updatedAt?: string;
}

export type MaintenancePriority = "Past" | "O'rta" | "Yuqori" | "Shoshilinch";
export type MaintenanceStatus = "Rejalashtirilgan" | "Jarayonda" | "Bajarildi" | "Bekor qilindi";

export interface MaintenanceTask {
  id: string;
  title: string;
  machineId: string;
  assignee: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  deadline: string;
  notes: string;
  createdAt: string;
}

export interface AIRecommendation {
  id: string;
  title: string;
  reason: string;
  impact: string;
  action: string;
  priority: AlertLevel;
  area: string;
}

export interface LogEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
  category: "auth" | "device" | "alert" | "maintenance" | "user";
}

export interface SensorReading {
  temperature: number;
  humidity: number;
  vibration: number;
  energy: number;
  pressure: number;
  current: number;
  voltage: number;
  productivity: number;
}