import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label, value, delta, icon, tone = "default",
}: {
  label: string; value: ReactNode; delta?: string; icon?: ReactNode;
  tone?: "default" | "success" | "warning" | "destructive" | "info";
}) {
  const toneCls: Record<string, string> = {
    default: "from-primary/10 to-transparent text-primary",
    success: "from-success/15 to-transparent text-success",
    warning: "from-warning/15 to-transparent text-warning",
    destructive: "from-destructive/15 to-transparent text-destructive",
    info: "from-info/15 to-transparent text-info",
  };
  return (
    <div className="glass rounded-xl p-5 shadow-card relative overflow-hidden">
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none", toneCls[tone])} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
          {delta && <p className="mt-1 text-xs text-muted-foreground">{delta}</p>}
        </div>
        {icon && <div className={cn("rounded-lg p-2 bg-background/40", toneCls[tone])}>{icon}</div>}
      </div>
    </div>
  );
}
