import { cn } from "../utils/cn";

interface StatusPillProps {
  children: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export function StatusPill({ children, tone = "neutral", className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em]",
        tone === "neutral" && "border-slate-200 bg-paper-50 text-slate-600",
        tone === "success" && "border-ledger-green-700/20 bg-ledger-green-700/10 text-ledger-green-700",
        tone === "warning" && "border-brass-500/30 bg-brass-500/10 text-ink-900",
        tone === "danger" && "border-rust-700/20 bg-rust-700/10 text-rust-700",
        tone === "info" && "border-focus-blue-500/20 bg-focus-blue-500/10 text-focus-blue-500",
        className
      )}
    >
      {children}
    </span>
  );
}
