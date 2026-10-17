"use client";

import { Info } from "lucide-react";
import { Sparkline } from "@/components/charts/chart-kit";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/feedback";
import { AnimatedNumber, Delta } from "@/components/ui/metric";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Kpi } from "@/types";

/** Primary KPI tile: label · value · signed delta vs a named period · 12-point trend. */
export function KpiCard({ kpi, index = 0, variant = "primary", className }: { kpi: Kpi; index?: number; variant?: "primary" | "compact"; className?: string }) {
  const compact = variant === "compact";
  return (
    <Card interactive className={cn("group h-full overflow-hidden", compact ? "p-4" : "p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-muted">
            <span className="truncate">{kpi.label}</span>
            {kpi.hint && (
              <Tooltip content={kpi.hint}>
                <button type="button" aria-label={`About ${kpi.label}`} className="text-subtle hover:text-fg">
                  <Info className="size-3.5" />
                </button>
              </Tooltip>
            )}
          </p>
          <p className="mt-0.5 text-[11px] text-subtle">{kpi.period}</p>
        </div>
        {!compact && kpi.spark && <Sparkline data={kpi.spark} width={84} height={30} className="-mt-0.5 hidden shrink-0 opacity-90 transition-opacity group-hover:opacity-100 sm:block" />}
      </div>
      <AnimatedNumber
        value={kpi.value}
        format={kpi.format}
        delay={index * 70}
        className={cn("block font-semibold tracking-[-0.03em] text-fg", compact ? "mt-2 text-[20px] leading-7 sm:text-[22px]" : "mt-2.5 text-[22px] leading-7 sm:mt-3 sm:text-[28px] sm:leading-8")}
      />
      <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
        <Delta change={kpi.change} kind={kpi.changeKind} inverse={kpi.inverse} />
        <span className="text-[11.5px] text-subtle sm:text-[12px]">{kpi.comparison}</span>
      </div>
    </Card>
  );
}

export function KpiCardSkeleton({ variant = "primary" }: { variant?: "primary" | "compact" }) {
  const compact = variant === "compact";
  return (
    <Card className={compact ? "p-4" : "p-5"}>
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2.5 w-16" />
        </div>
        {!compact && <Skeleton className="h-7 w-20" />}
      </div>
      <Skeleton className={cn("w-28", compact ? "mt-3 h-6" : "mt-4 h-7")} />
      <Skeleton className="mt-3 h-3 w-36" />
    </Card>
  );
}
