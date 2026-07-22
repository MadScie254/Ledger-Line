import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { cn } from "../utils/cn";

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function Field({ label, hint, error, children }: FieldProps) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-ink-900">
      <span>{label}</span>
      {children}
      {hint ? <span className="text-xs font-normal text-slate-500">{hint}</span> : null}
      {error ? <span className="text-xs font-semibold text-rust-700">{error}</span> : null}
    </label>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-9 rounded-[6px] border border-slate-300 bg-white px-3 text-sm text-ink-900 shadow-sm outline-none transition focus:border-focus-blue-500 focus:ring-2 focus:ring-focus-blue-500/20",
      className
    )}
    {...props}
  />
));

Input.displayName = "Input";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-9 rounded-[6px] border border-slate-300 bg-white px-3 text-sm text-ink-900 shadow-sm outline-none transition focus:border-focus-blue-500 focus:ring-2 focus:ring-focus-blue-500/20",
      className
    )}
    {...props}
  />
));

Select.displayName = "Select";
