import type { ReactNode } from "react";
import { cn } from "../utils/cn";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, body, action, className }: EmptyStateProps) {
  return (
    <div className={cn("rounded-[8px] border border-dashed border-slate-300 bg-paper-50 p-6 text-center", className)}>
      {icon ? <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-[8px] bg-white text-brass-500">{icon}</div> : null}
      <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">{body}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
