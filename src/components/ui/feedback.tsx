"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden className={cn("skeleton", className)} {...props} />;
}

export function Progress({
  value,
  className,
  tone = "brand",
  label,
  delay = 0,
}: {
  value: number;
  className?: string;
  tone?: "brand" | "success" | "warning" | "danger" | "muted";
  label?: string;
  delay?: number;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  const fill = {
    brand: "bg-accent",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    muted: "bg-fg-2/50",
  }[tone];
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-3", className)}
    >
      <motion.div
        className={cn("h-full rounded-full", fill)}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

export function Kbd({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-[5px] border border-line bg-surface-2 px-1 font-mono text-[10.5px] font-medium text-muted",
        className,
      )}
      {...props}
    />
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span className={cn("inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent", className)} aria-hidden />
  );
}
