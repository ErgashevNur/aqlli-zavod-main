import { cn } from "@/lib/utils";
import { statusColor } from "@/lib/app/store";

const cls: Record<string, string> = {
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  destructive: "bg-destructive/15 text-destructive border-destructive/30",
  info: "bg-info/15 text-info border-info/30",
  muted: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({
  status,
  className,
  pulse,
}: {
  status: string;
  className?: string;
  pulse?: boolean;
}) {
  const c = statusColor(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        cls[c],
        className,
      )}
    >
      {pulse && <span className={cn("h-1.5 w-1.5 rounded-full bg-current pulse-dot")} />}
      {status}
    </span>
  );
}