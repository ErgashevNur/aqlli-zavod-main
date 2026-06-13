import type {
  AIRecommendation,
  AlertItem,
  Device,
  LogEntry,
  Machine,
  MaintenanceTask,
  ProductionLine,
  User,
} from "./types";

export const demoUsers: User[] = [
  {
    id: "u-1",
    fullName: "Akmal Yusupov",
    email: "admin@korxona.uz",
    password: "admin123",
    phone: "+998 90 111 22 33",
    role: "admin",
    department: "IT boshqaruvi",
    position: "Tizim administratori",
    status: "faol",
    createdAt: "2025-01-15",
  },
  {
    id: "u-2",
    fullName: "Dilshod Rahimov",
    email: "manager@korxona.uz",
    password: "manager123",
    phone: "+998 91 222 33 44",
    role: "manager",
    department: "Ishlab chiqarish",
    position: "Korxona rahbari",
    status: "faol",
    createdAt: "2025-02-01",
  },
  {
    id: "u-3",
    fullName: "Sherzod Karimov",
    email: "engineer@korxona.uz",
    password: "engineer123",
    phone: "+998 93 333 44 55",
    role: "engineer",
    department: "Texnik xizmat",
    position: "Bosh muhandis",
    status: "faol",
    createdAt: "2025-02-10",
  },
  {
    id: "u-4",
    fullName: "Bekzod Toshpo'latov",
    email: "operator@korxona.uz",
    password: "operator123",
    phone: "+998 94 444 55 66",
    role: "operator",
    department: "1-liniya",
    position: "Smena operatori",
    status: "faol",
    createdAt: "2025-03-05",
  },
  {
    id: "u-5",
    fullName: "Malika Ergasheva",
    email: "analyst@korxona.uz",
    password: "analyst123",
    phone: "+998 95 555 66 77",
    role: "analyst",
    department: "Analitika",
    position: "Ma'lumot tahlilchisi",
    status: "faol",
    createdAt: "2025-03-20",
  },
];

export const departments = [
  "Ishlab chiqarish",
  "Texnik xizmat",
  "Sifat nazorati",
  "Energetika",
  "Analitika",
  "IT boshqaruvi",
  "Logistika",
];

export const productionLines: ProductionLine[] = [
  {
    id: "line-1",
    name: "1-liniya: Metallga ishlov berish",
    description: "CNC va press stanoklari, metall qismlarni tayyorlash",
    status: "faol",
    productivity: 87,
    downtime: 42,
    energy: 612,
    operator: "Bekzod Toshpo'latov",
  },
  {
    id: "line-2",
    name: "2-liniya: Yig'ish jarayoni",
    description: "Konveyer va robotlashtirilgan yig'ish posti",
    status: "ogohlantirish",
    productivity: 74,
    downtime: 88,
    energy: 498,
    operator: "Javohir Olimov",
  },
  {
    id: "line-3",
    name: "3-liniya: Qadoqlash",
    description: "Avtomatik qadoqlash va etiketkalash",
    status: "faol",
    productivity: 92,
    downtime: 21,
    energy: 286,
    operator: "Sardor Ismoilov",
  },
  {
    id: "line-4",
    name: "4-liniya: Sifat nazorati",
    description: "Optik tekshirish va sertifikatsiya",
    status: "xizmatda",
    productivity: 64,
    downtime: 120,
    energy: 154,
    operator: "Nodira Aliyeva",
  },
];

export const machines: Machine[] = [
  { id: "m-1", name: "CNC-101 freza", lineId: "line-1", status: "faol", operator: "Bekzod T.", efficiency: 91, uptimeHours: 1820 },
  { id: "m-2", name: "Press P-200", lineId: "line-1", status: "faol", operator: "Bekzod T.", efficiency: 84, uptimeHours: 2410 },
  { id: "m-3", name: "Robot R-12", lineId: "line-2", status: "ogohlantirish", operator: "Javohir O.", efficiency: 71, uptimeHours: 980 },
  { id: "m-4", name: "Konveyer K-3", lineId: "line-2", status: "faol", operator: "Javohir O.", efficiency: 88, uptimeHours: 3200 },
  { id: "m-5", name: "Qadoqlash A-1", lineId: "line-3", status: "faol", operator: "Sardor I.", efficiency: 95, uptimeHours: 1410 },
  { id: "m-6", name: "Etiketka E-2", lineId: "line-3", status: "faol", operator: "Sardor I.", efficiency: 90, uptimeHours: 1150 },
  { id: "m-7", name: "Optik tekshiruv O-1", lineId: "line-4", status: "xizmatda", operator: "Nodira A.", efficiency: 0, uptimeHours: 760 },
];

export const devices: Device[] = [
  {
    id: "sim-001",
    name: "Harorat Simulyatori",
    type: "Harorat sensori",
    lineId: "line-1",
    status: "online",
    signal: 100,
    lastSeen: "hozir",
    installedAt: "2025-01-01",
    isSimulator: true,
    simValue: 65,
    simMin: 25,
    simMax: 95,
    simJitter: 3,
  },
  {
    id: "sim-002",
    name: "Energiya Simulyatori",
    type: "Energiya hisoblagich",
    lineId: "line-1",
    status: "online",
    signal: 100,
    lastSeen: "hozir",
    installedAt: "2025-01-01",
    isSimulator: true,
    simValue: 450,
    simMin: 100,
    simMax: 900,
    simJitter: 40,
  },
];

const now = Date.now();
const minsAgo = (m: number) => new Date(now - m * 60_000).toISOString();

export const alerts: AlertItem[] = [
  { id: "a-1", title: "Harorat me'yordan oshdi", message: "1-liniyada harorat 86°C ga yetdi", level: "Yuqori", status: "Yangi", source: "Harorat Simulyatori", lineId: "line-1", deviceId: "sim-001", createdAt: minsAgo(4) },
  { id: "a-2", title: "Energiya sarfi yuqori", message: "1-liniyada energiya sarfi 820 kWh ga yetdi", level: "Yuqori", status: "Jarayonda", source: "Energiya Simulyatori", lineId: "line-1", deviceId: "sim-002", createdAt: minsAgo(18) },
  { id: "a-3", title: "Harorat kritik darajada", message: "1-liniyada harorat 91°C ga yetdi", level: "Kritik", status: "Yangi", source: "Harorat Simulyatori", lineId: "line-1", deviceId: "sim-001", createdAt: minsAgo(55) },
  { id: "a-4", title: "Texnik xizmat muddati keldi", message: "Harorat sensorini davriy tekshirish vaqti keldi", level: "Past", status: "Hal qilindi", source: "Tizim", lineId: "line-1", createdAt: minsAgo(360) },
];

export const maintenanceTasks: MaintenanceTask[] = [
  { id: "t-1", title: "Press P-200 yog' almashtirish", machineId: "m-2", assignee: "Sherzod Karimov", priority: "O'rta", status: "Rejalashtirilgan", deadline: "2026-05-22", notes: "Yog' sifatini tekshirish va filtrlarni almashtirish", createdAt: "2026-05-10" },
  { id: "t-2", title: "Robot R-12 vibratsiya tahlili", machineId: "m-3", assignee: "Sherzod Karimov", priority: "Yuqori", status: "Jarayonda", deadline: "2026-05-18", notes: "Podshipniklar holatini diagnostika qilish", createdAt: "2026-05-12" },
  { id: "t-3", title: "Optik tekshiruv O-1 kalibrlash", machineId: "m-7", assignee: "Nodira Aliyeva", priority: "Shoshilinch", status: "Jarayonda", deadline: "2026-05-17", notes: "Linzalarni tozalash va sozlash", createdAt: "2026-05-14" },
  { id: "t-4", title: "CNC-101 dasturiy ta'minot yangilash", machineId: "m-1", assignee: "Sherzod Karimov", priority: "Past", status: "Bajarildi", deadline: "2026-05-10", notes: "v2.4.1 versiyasiga yangilandi", createdAt: "2026-05-05" },
];

export const aiRecommendations: AIRecommendation[] = [
  {
    id: "r-1",
    title: "3-liniyada energiya sarfini optimallashtirish",
    reason: "Soʻnggi 7 kun ichida energiya sarfi meʼyordan 18% yuqori.",
    impact: "Oylik xarajatlar 12-15% gacha qisqaradi.",
    action: "Tungi smenada ortiqcha quvvatdagi mashinalarni avtomatik oʻchirish.",
    priority: "Yuqori",
    area: "Energetika",
  },
  {
    id: "r-2",
    title: "Robot R-12 uchun profilaktik xizmat",
    reason: "Vibratsiya darajasi 30 kun ichida 2.1 dan 6.4 mm/s gacha oshdi.",
    impact: "Toʻxtab qolish ehtimoli 65% ga kamayadi.",
    action: "Podshipniklarni almashtirish va lubrikatsiyani yangilash.",
    priority: "Kritik",
    area: "Texnik xizmat",
  },
  {
    id: "r-3",
    title: "Qadoqlash liniyasi samaradorligini oshirish",
    reason: "Samaradorlik soʻnggi 14 kunda 12% pasaygan.",
    impact: "Kunlik ishlab chiqarish 8-10% oshadi.",
    action: "Operatorlar yuklamasini qayta taqsimlash va smenani moslashtirish.",
    priority: "O'rta",
    area: "Ishlab chiqarish",
  },
  {
    id: "r-4",
    title: "Sovutish tizimini tekshirish",
    reason: "1-liniyada harorat trendi barqaror oshib bormoqda.",
    impact: "Mashina muddatini 20% gacha uzaytiradi.",
    action: "Sovutgich nasoslari va radiatorlarni diagnostika qilish.",
    priority: "Yuqori",
    area: "Texnik xizmat",
  },
];

export const logs: LogEntry[] = [
  { id: "l-1", actor: "Akmal Yusupov", action: "Tizimga kirdi", target: "admin@korxona.uz", at: minsAgo(3), category: "auth" },
  { id: "l-2", actor: "Sherzod Karimov", action: "Mashinaga buyruq berildi: Restart", target: "Robot R-12", at: minsAgo(12), category: "device" },
  { id: "l-3", actor: "Tizim", action: "Avtomatik alert yaratildi", target: "Vibratsiya-201", at: minsAgo(18), category: "alert" },
  { id: "l-4", actor: "Dilshod Rahimov", action: "Texnik xizmat tasdiqlandi", target: "Press P-200", at: minsAgo(60), category: "maintenance" },
  { id: "l-5", actor: "Akmal Yusupov", action: "Yangi foydalanuvchi qoʻshildi", target: "Malika Ergasheva", at: minsAgo(240), category: "user" },
  { id: "l-6", actor: "Bekzod Toshpoʻlatov", action: "Smena boshlandi", target: "1-liniya", at: minsAgo(420), category: "auth" },
];

export const rolePermissions: Record<string, string[]> = {
  admin: ["dashboard", "monitoring", "devices", "lines", "control", "alerts", "maintenance", "analytics", "reports", "ai", "architecture", "users", "logs", "profile", "settings"],
  manager: ["dashboard", "monitoring", "lines", "alerts", "maintenance", "analytics", "reports", "ai", "architecture", "profile", "settings"],
  engineer: ["dashboard", "monitoring", "devices", "lines", "control", "alerts", "maintenance", "ai", "architecture", "profile", "settings"],
  operator: ["dashboard", "monitoring", "lines", "alerts", "profile", "settings"],
  analyst: ["dashboard", "monitoring", "analytics", "reports", "ai", "architecture", "profile", "settings"],
};

export const roleLabels: Record<string, string> = {
  admin: "Super Admin",
  manager: "Korxona rahbari",
  engineer: "Muhandis",
  operator: "Operator",
  analyst: "Analitik",
};

export const factoryInfo = {
  name: "AQLLI-ZAVOD MChJ",
  city: "Toshkent",
  founded: 2019,
  employees: 248,
  area: "12 400 m²",
};