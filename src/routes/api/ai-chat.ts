import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";

const SYSTEM_PROMPT = `Sen "AQLLI-ZAVOD" sanoat IoT monitoring platformasining yordamchi AI muhandisisan.
Foydalanuvchilarga o'zbek tilida (lotin yozuvi) javob ber.
Sen quyidagi mavzularda yordam berasan:
- Ishlab chiqarish liniyalari va mashinalar holatini tahlil qilish
- Sensor ko'rsatkichlari (harorat, vibratsiya, energiya, samaradorlik)
- Alert va texnik xizmat tavsiyalari
- OEE, MTBF, MTTR kabi sanoat KPI'lari
- Prediktiv tahlil va energiya optimizatsiyasi
Javoblar qisqa, aniq va amaliy bo'lsin. Markdown formatdan foydalan.`;

// Lightweight in-memory rate limiter per client IP to mitigate abuse of the
// AI gateway (billing protection). Resets every minute, per Worker isolate.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const MAX_MESSAGES = 40;
const MAX_CONTENT_CHARS = 8_000;
const ipHits = new Map<string, { count: number; resetAt: number }>();

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");
  if (!host) return false;
  const allowed = [`https://${host}`, `http://${host}`];
  if (origin && allowed.includes(origin)) return true;
  if (referer) {
    try {
      const refHost = new URL(referer).host;
      if (refHost === host) return true;
    } catch {
      // ignore
    }
  }
  return false;
}

function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip);
  if (!entry || entry.resetAt < now) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

export const Route = createFileRoute("/api/ai-chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        // Block cross-origin callers — this endpoint is only meant to be
        // called by the platform UI, not by external scripts.
        if (!isSameOrigin(request)) {
          return new Response("Forbidden", { status: 403 });
        }
        const ip = clientIp(request);
        if (rateLimited(ip)) {
          return new Response("Too many requests", { status: 429 });
        }
        const { messages } = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(messages)) {
          return new Response("messages required", { status: 400 });
        }
        if (messages.length === 0 || messages.length > MAX_MESSAGES) {
          return new Response("Invalid messages length", { status: 400 });
        }
        // Cap total payload size to limit prompt-injection / abuse surface.
        const totalChars = JSON.stringify(messages).length;
        if (totalChars > MAX_CONTENT_CHARS) {
          return new Response("Payload too large", { status: 413 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        try {
          const result = streamText({
            model,
            system: SYSTEM_PROMPT,
            messages: await convertToModelMessages(messages),
          });
          return result.toUIMessageStreamResponse({ originalMessages: messages });
        } catch (err) {
          console.error("AI chat error", err);
          return new Response("AI gateway error", { status: 502 });
        }
      },
    },
  },
});