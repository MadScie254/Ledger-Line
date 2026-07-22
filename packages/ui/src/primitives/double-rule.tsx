import { cn } from "../utils/cn";

export function DoubleRule({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("double-rule", className)} />;
}
