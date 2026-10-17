"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ChartDataTable, Legend, series } from "@/components/charts/chart-kit";
import { TrendChart } from "@/components/charts/charts";
import { AsyncView } from "@/components/shared/async-view";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/feedback";
import { Delta } from "@/components/ui/metric";
import { Segmented } from "@/components/ui/segmented";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/lib/api";
import { formatCompact, formatCompactCurrency, formatCurrency, formatNumber } from "@/lib/format";
import type { TimeRange } from "@/types";

export const rangeOptions: { value: TimeRange; label: string }[] = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "12m", label: "12M" },
];

export const rangeLabel: Record<TimeRange, string> = { "7d": "Last 7 days", "30d": "Last 30 days", "90d": "Last 90 days", "12m": "Last 12 months" };
const compareLabel: Record<TimeRange, string> = { "7d": "Previous 7 days", "30d": "Previous 30 days", "90d": "Previous 90 days", "12m": "Same month last year" };

type Metric = "revenue" | "leads" | "visitors";

const metricMeta: Record<Metric, { label: string; key: string; compare?: string; format: (v: number) => string; axis: (v: number) => string; color: string }> = {
  revenue: { label: "Revenue", key: "revenue", compare: "previousRevenue", format: formatCurrency, axis: formatCompactCurrency, color: series[1] },
  leads: { label: "Leads", key: "leads", format: formatNumber, axis: formatCompact, color: series[2] },
  visitors: { label: "Visitors", key: "visitors", format: formatNumber, axis: formatCompact, color: series[4] },
};

export function RevenuePanel() {
  const [range, setRange] = useState<TimeRange>("30d");
  const [metric, setMetric] = useState<Metric>("revenue");
  const res = useResource(() => api.analytics.series(range), [range], { keepPreviousData: true });
  const meta = metricMeta[metric];

  return (
    <Card as="section" aria-labelledby="perf-title" className="h-full overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 px-5 pt-5">
        <div>
          <h2 id="perf-title" className="text-[14.5px] font-semibold tracking-tight text-fg">
            Performance
          </h2>
          <p className="mt-0.5 text-[12.5px] text-muted">{rangeLabel[range]} · compared with {compareLabel[range].toLowerCase()}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            label="Metric"
            value={metric}
            onChange={setMetric}
            options={[
              { value: "revenue", label: "Revenue" },
              { value: "leads", label: "Leads" },
              { value: "visitors", label: "Visitors" },
            ]}
          />
          <Segmented label="Date range" value={range} onChange={setRange} options={rangeOptions} />
        </div>
      </div>

      <AsyncView
        status={res.status}
        data={res.data}
        error={res.error}
        onRetry={res.reload}
        skeleton={
          <div className="px-5 pt-6 pb-5">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="mt-6 h-[260px] w-full rounded-xl" />
          </div>
        }
        empty={{ title: "No performance data yet", description: "Connect analytics and your CRM to see revenue, leads and visitors over time." }}
      >
        {(data) => {
          const totals = data.totals;
          const value = metric === "revenue" ? totals.revenue : metric === "leads" ? totals.leads : totals.visitors;
          const prev = metric === "revenue" ? totals.previousRevenue : metric === "leads" ? totals.previousLeads : totals.previousVisitors;
          return (
            <div className="px-2 pt-4 pb-4 sm:px-3">
              <div className="flex flex-wrap items-end justify-between gap-3 px-3">
                <div className="flex items-baseline gap-3">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.p
                      key={`${metric}-${range}-${value}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="text-[30px] leading-none font-semibold tracking-[-0.03em] text-fg"
                    >
                      {meta.format(value)}
                    </motion.p>
                  </AnimatePresence>
                  <Delta change={prev ? value / prev - 1 : 0} />
                </div>
                <Legend
                  items={[
                    { label: rangeLabel[range], color: meta.color },
                    ...(meta.compare ? [{ label: compareLabel[range], color: "var(--chart-axis)", dashed: true }] : []),
                  ]}
                />
              </div>
              <div className={res.isFetching ? "opacity-60 transition-opacity" : "transition-opacity"}>
                <div className="mt-4">
                  <TrendChart
                    data={data.points}
                    dataKey={meta.key}
                    compareKey={meta.compare}
                    name={meta.label}
                    compareName={compareLabel[range]}
                    format={meta.format}
                    axisFormat={meta.axis}
                    color={meta.color}
                    height={270}
                  />
                </div>
              </div>
              <ChartDataTable
                caption={`${meta.label}, ${rangeLabel[range]}`}
                columns={["Period", meta.label]}
                rows={data.points.map((p) => [p.label, meta.format(Number(p[meta.key as keyof typeof p]))])}
              />
            </div>
          );
        }}
      </AsyncView>
    </Card>
  );
}
