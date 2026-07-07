import { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
}

export function KpiCard({ label, value, hint }: KpiCardProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="text-xs font-medium text-muted uppercase tracking-wide">{label}</p>
      <div className="mt-2 text-2xl font-semibold font-display">{value}</div>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
