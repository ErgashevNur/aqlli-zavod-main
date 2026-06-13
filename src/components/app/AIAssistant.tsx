import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const transport = new DefaultChatTransport({ api: "/api/ai-chat" });

const SUGGESTIONS = [
  "Hozir kritik alertlar bormi?",
  "Energiya sarfini qanday kamaytirsam bo'ladi?",
  "OEE ko'rsatkichi nima va qanday hisoblanadi?",
  "Vibratsiya yuqori bo'lsa nima qilishim kerak?",
];

export function AIAssistant({ contextSummary }: { contextSummary?: string }) {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    id: "aqlli-zavod-assistant",
    transport,
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const submit = (text: string) => {
    const t = text.trim();
    if (!t || isLoading) return;
    const prefixed = contextSummary
      ? `[Joriy zavod holati: ${contextSummary}]\n\n${t}`
      : t;
    sendMessage({ text: prefixed });
    setInput("");
  };

  return (
    <div className="glass rounded-xl shadow-card overflow-hidden flex flex-col h-[480px]">
      <div className="flex items-center justify-between border-b border-border bg-card/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">AI yordamchi</p>
            <p className="text-xs text-muted-foreground">Sanoat IoT bo'yicha intellektual maslahatchi</p>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Lovable AI</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Salom! Men AQLLI-ZAVOD platformasining AI yordamchisiman. Quyidagi savollardan birini tanlang yoki o'zingiznikini yozing:
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="text-left rounded-lg border border-border bg-card/60 px-3 py-2 text-xs hover:border-primary/50 hover:bg-primary/5 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m: UIMessage) => {
          const text = m.parts
            .map((p) => (p.type === "text" ? p.text : ""))
            .join("");
          const isUser = m.role === "user";
          const display = isUser ? text.replace(/^\[Joriy zavod holati:[^\]]*\]\s*\n*/, "") : text;
          return (
            <div key={m.id} className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
              {!isUser && (
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                  isUser
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-card/80 border border-border rounded-bl-sm"
                }`}
              >
                {display || (isLoading && !isUser ? "..." : "")}
              </div>
              {isUser && (
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          );
        })}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-primary/15 text-primary">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="rounded-2xl rounded-bl-sm border border-border bg-card/80 px-3 py-2 text-sm">
              <span className="inline-flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
              </span>
            </div>
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            Xatolik yuz berdi: {error.message}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="border-t border-border bg-card/40 p-3 flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Savolingizni yozing..."
          disabled={isLoading}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          Yuborish
        </button>
      </form>
    </div>
  );
}