import { ShieldAlert } from "lucide-react";
export function EmptyAccess({ message = "Sizda bu modulga ruxsat yo'q." }: { message?: string }) {
  return (
    <div className="glass mx-auto mt-12 max-w-md rounded-xl p-8 text-center shadow-card">
      <ShieldAlert className="mx-auto h-10 w-10 text-warning" />
      <h2 className="mt-4 text-lg font-semibold">Ruxsat cheklangan</h2>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
