import type { ReactNode } from "react";
import { cn } from "../utils/cn";
import { DoubleRule } from "./double-rule";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  change?: string;
  trend?: "up" | "down" | "flat";
  meta?: string;
  icon?: ReactNode;
  className?: string;
}

export function KpiCard({ label, value, change, trend = "flat", meta, icon, className }: KpiCardProps) {
  return (
    <section className={cn("rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</p>
          <div className="mt-3 font-serif text-3xl font-semibold leading-none tracking-normal text-ink-900">{value}</div>
        </div>
        {icon ? <div className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-slate-200 bg-paper-50 text-slate-500">{icon}</div> : null}
      </div>
      <DoubleRule className="my-4" />
      <div className="flex items-center justify-between text-xs">
        <span
          className={cn(
            "font-semibold",
            trend === "up" && "text-ledger-green-700",
            trend === "down" && "text-rust-700",
            trend === "flat" && "text-slate-500"
          )}
        >
          {change}
        </span>
        {meta ? <span className="text-slate-500">{meta}</span> : null}
      </div>
    </section>
  );
}
