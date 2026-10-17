"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { useCountUp } from "@/hooks/use-count-up";
import { formatChange, formatMetric } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MetricFormat } from "@/types";

export function AnimatedNumber({ value, format, className, delay = 0 }: { value: number; format: MetricFormat; className?: string; delay?: number }) {
  const v = useCountUp(value, { delay });
  const precise = format === "percent" || format === "multiplier" || format === "currencyPrecise" || format === "compact";
  return (
    <span className={className}>
      <span aria-hidden>{formatMetric(precise ? v : Math.round(v), format)}</span>
      <span className="sr-only">{formatMetric(value, format)}</span>
    </span>
  );
}

/**
 * Signed change with direction icon. Colour follows whether the movement is
 * good for the business (inverse metrics like CAC are good when they fall).
 */
export function Delta({
  change,
  kind = "percent",
  inverse,
  className,
  size = "sm",
}: {
  change: number;
  kind?: "percent" | "points" | "absolute" | "multiplier";
  inverse?: boolean;
  className?: string;
  size?: "xs" | "sm";
}) {
  const direction = change > 0 ? "up" : change < 0 ? "down" : "flat";
  const good = direction === "flat" ? null : (direction === "up") !== Boolean(inverse);
  const Icon = direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md font-medium tabular",
        size === "xs" ? "text-[11px]" : "text-[12px]",
        good === null ? "text-muted" : good ? "text-success" : "text-danger",
        className,
      )}
    >
      <Icon className={size === "xs" ? "size-3" : "size-3.5"} aria-hidden />
      <span>{formatChange(change, kind)}</span>
      <span className="sr-only">{good === null ? "(no change)" : good ? "(improvement)" : "(decline)"}</span>
    </span>
  );
}
