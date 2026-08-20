import * as React from "react";
import { cn } from "../utils/cn";

export interface LedgerlineLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export function LedgerlineLogo({
  size = "lg",
  showText = true,
  className,
  ...props
}: LedgerlineLogoProps) {
  const sizeClasses = {
    sm: {
      wrapper: "w-8 h-8 rounded-lg text-sm",
      text: "text-lg",
      gap: "gap-2"
    },
    md: {
      wrapper: "w-10 h-10 rounded-xl text-base",
      text: "text-xl",
      gap: "gap-2.5"
    },
    lg: {
      wrapper: "w-12 h-12 rounded-xl text-xl ring-2",
      text: "text-2xl",
      gap: "gap-3"
    },
    xl: {
      wrapper: "w-16 h-16 rounded-2xl text-2xl ring-2",
      text: "text-3xl",
      gap: "gap-4"
    }
  };

  const { wrapper, text, gap } = sizeClasses[size];

  return (
    <div className={cn("flex justify-center items-center", gap, className)} {...props}>
      <div
        className={cn(
          "bg-gradient-to-tr from-brass-500 to-brass-400 flex items-center justify-center text-white font-bold shadow-lg ring-brass-400/50",
          wrapper
        )}
      >
        LL
      </div>
      {showText && (
        <span className={cn("font-semibold tracking-tight text-white", text)}>
          LedgerLine
        </span>
      )}
    </div>
  );
}
