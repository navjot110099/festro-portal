"use client";

import { Download, Monitor, Smartphone, Tablet } from "lucide-react";
import { useState } from "react";
import { BarList } from "@/components/charts/bar-list";
import { ChartDataTable, Legend, series } from "@/components/charts/chart-kit";
import { GroupedBars, RateLineChart, StackedBars, TrendChart } from "@/components/charts/charts";
import { rangeLabel, rangeOptions } from "@/components/dashboard/revenue-panel";
import { useToast } from "@/components/providers/toast-provider";
import { AsyncView } from "@/components/shared/async-view";
import { PageHeader } from "@/components/shared/page-header";
import { Stagger, StaggerItem } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/feedback";
import { AnimatedNumber, Delta } from "@/components/ui/metric";
import { Segmented } from "@/components/ui/segmented";
import { leadSources, type RangeSeries } from "@/data/analytics";
import { platformMeta } from "@/data/campaigns";
import { useResource, type ResourceStatus } from "@/hooks/use-resource";
import { api } from "@/lib/api";
import { formatCompact, formatCompactCurrency, formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type { CampaignPlatform, TimeRange } from "@/types";

const sourceKeys = leadSources.map((s, i) => ({ key: s.id, label: s.label, color: series[(i + 1) as 1 | 2 | 3 | 4 | 5] }));

function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className="px-5 pt-5 pb-5">
      <Skeleton className="w-full rounded-xl" style={{ height }} />
    </div>
  );
}

function SummaryStrip({ range, res }: { range: TimeRange; res: { status: ResourceStatus; data: RangeSeries | null | undefined; error?: Error; reload: () => void } }) {
  return (
    <AsyncView
      status={res.status}
      data={res.data}
      error={res.error}
      onRetry={res.reload}
      compact
      skeleton={
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-3 h-6 w-24" />
              <Skeleton className="mt-3 h-3 w-16" />
            </Card>
          ))}
        </div>
      }
      empty={{ title: "No analytics yet", description: "Connect GA4 and your CRM to populate analytics." }}
    >
      {(d) => {
        const t = d.totals;
        const items = [
          { label: "Revenue", value: t.revenue, format: "currency" as const, change: t.revenue / t.previousRevenue - 1 },
          { label: "Leads", value: t.leads, format: "number" as const, change: t.leads / t.previousLeads - 1 },
          { label: "Qualified leads", value: t.qualified, format: "number" as const, change: t.qualified / t.previousQualified - 1 },
          { label: "Conversion rate", value: t.conversionRate, format: "percent" as const, change: t.conversionRate - t.previousConversionRate, kind: "points" as const },
        ];
        return (
          <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {items.map((it) => (
              <StaggerItem key={`${it.label}-${range}`}>
                <Card className="p-4">
                  <p className="text-[12.5px] font-medium text-muted">{it.label}</p>
                  <AnimatedNumber value={it.value} format={it.format} className="mt-2 block text-[22px] leading-7 font-semibold tracking-[-0.03em] text-fg" />
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Delta change={it.change} kind={it.kind} />
                    <span className="text-[11.5px] text-subtle">vs previous</span>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        );
      }}
    </AsyncView>
  );
}

export function AnalyticsView() {
  const toast = useToast();
  const [range, setRange] = useState<TimeRange>("30d");
  const seriesRes = useResource(() => api.analytics.series(range), [range], { keepPreviousData: true });
  const breakdown = useResource(() => api.analytics.breakdown());
  const campaigns = useResource(() => api.campaigns.list());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Revenue, acquisition and conversion across every connected channel."
        actions={
          <>
            <Segmented label="Date range" value={range} onChange={setRange} options={rangeOptions} />
            <Button variant="secondary" onClick={() => toast({ title: "Export queued", description: `${rangeLabel[range]} analytics will download as CSV.`, tone: "info" })}>
              <Download /> Export
            </Button>
          </>
        }
      />

      <SummaryStrip range={range} res={seriesRes} />

      {/* Revenue */}
      <Card as="section" aria-labelledby="an-revenue">
        <CardHeader
          titleId="an-revenue"
          title="Revenue"
          description={`${rangeLabel[range]}, compared with the previous period`}
          action={
            <Legend
              items={[
                { label: "This period", color: series[1] },
                { label: range === "12m" ? "Last year" : "Previous period", color: "var(--chart-axis)", dashed: true },
              ]}
            />
          }
        />
        <AsyncView status={seriesRes.status} data={seriesRes.data} error={seriesRes.error} onRetry={seriesRes.reload} skeleton={<ChartSkeleton height={300} />} empty={{ title: "No revenue data" }}>
          {(d) => (
            <div className="px-2 pt-4 pb-4 sm:px-3">
              <TrendChart
                data={d.points}
                dataKey="revenue"
                compareKey="previousRevenue"
                name="Revenue"
                compareName={range === "12m" ? "Last year" : "Previous period"}
                format={formatCurrency}
                axisFormat={formatCompactCurrency}
                height={300}
              />
              <ChartDataTable caption="Revenue by period" columns={["Period", "Revenue", "Previous"]} rows={d.points.map((p) => [p.label, formatCurrency(p.revenue), formatCurrency(p.previousRevenue)])} />
            </div>
          )}
        </AsyncView>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        {/* Leads by source */}
        <Card as="section" aria-labelledby="an-leads" className="xl:col-span-3">
          <CardHeader titleId="an-leads" title="Leads by source" description={`New leads per ${seriesRes.data?.granularity ?? "day"}`} />
          <div className="px-5 pt-3">
            <Legend items={sourceKeys.map((k) => ({ label: k.label, color: k.color }))} />
          </div>
          <AsyncView status={seriesRes.status} data={seriesRes.data} error={seriesRes.error} onRetry={seriesRes.reload} skeleton={<ChartSkeleton />} empty={{ title: "No leads in this period" }}>
            {(d) => {
              const rows = d.points.map((p) => ({ label: p.label, ...p.sources }));
              return (
                <div className="px-2 pt-3 pb-4 sm:px-3">
                  <StackedBars data={rows} keys={sourceKeys} format={formatCompact} height={280} />
                  <ChartDataTable
                    caption="Leads by source"
                    columns={["Period", ...sourceKeys.map((k) => k.label)]}
                    rows={d.points.map((p) => [p.label, ...sourceKeys.map((k) => p.sources[k.key])])}
                  />
                </div>
              );
            }}
          </AsyncView>
        </Card>

        {/* Conversion */}
        <Card as="section" aria-labelledby="an-conv" className="xl:col-span-2">
          <CardHeader titleId="an-conv" title="Conversion rate" description="Qualified lead → client, against the 8% target" />
          <AsyncView status={seriesRes.status} data={seriesRes.data} error={seriesRes.error} onRetry={seriesRes.reload} skeleton={<ChartSkeleton height={260} />} empty={{ title: "No conversions yet" }}>
            {(d) => (
              <div className="px-2 pt-4 pb-4 sm:px-3">
                <div className="mb-2 flex items-baseline gap-2 px-3">
                  <span className="text-[26px] font-semibold tracking-[-0.03em] text-fg">{formatPercent(d.totals.conversionRate)}</span>
                  <Delta change={d.totals.conversionRate - d.totals.previousConversionRate} kind="points" />
                </div>
                <RateLineChart data={d.points} dataKey="conversionRate" name="Conversion rate" target={0.08} targetLabel="Target 8%" format={(v) => formatPercent(v)} height={262} />
              </div>
            )}
          </AsyncView>
        </Card>
      </div>

      {/* Campaign performance */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card as="section" aria-labelledby="an-camp" className="xl:col-span-3">
          <CardHeader
            titleId="an-camp"
            title="Campaign performance by platform"
            description="Spend vs attributed revenue, month to date"
            action={
              <Legend
                items={[
                  { label: "Spend", color: series[2] },
                  { label: "Revenue", color: series[1] },
                ]}
              />
            }
          />
          <AsyncView status={campaigns.status} data={campaigns.data} error={campaigns.error} onRetry={campaigns.reload} skeleton={<ChartSkeleton height={260} />} empty={{ title: "No campaign data" }}>
            {(list) => {
              const byPlatform = (Object.keys(platformMeta) as CampaignPlatform[])
                .filter((p) => p !== "Organic")
                .map((p) => {
                  const cs = list.filter((c) => c.platform === p);
                  return { label: p, spend: cs.reduce((a, c) => a + c.spend, 0), revenue: cs.reduce((a, c) => a + c.revenue, 0) };
                });
              return (
                <div className="px-2 pt-4 pb-4 sm:px-3">
                  <GroupedBars
                    data={byPlatform}
                    keys={[
                      { key: "spend", label: "Spend", color: series[2] },
                      { key: "revenue", label: "Revenue", color: series[1] },
                    ]}
                    format={formatCompactCurrency}
                    height={260}
                  />
                </div>
              );
            }}
          </AsyncView>
        </Card>

        <Card as="section" aria-labelledby="an-roas" className="xl:col-span-2">
          <CardHeader titleId="an-roas" title="Return on ad spend" description="Paid campaigns ranked by ROAS" />
          <div className="px-5 pt-4 pb-5">
            <AsyncView status={campaigns.status} data={campaigns.data} error={campaigns.error} onRetry={campaigns.reload} compact skeleton={<ChartSkeleton height={220} />} empty={{ title: "No paid campaigns" }}>
              {(list) => {
                const paid = list.filter((c) => c.spend > 0 && c.platform !== "Email").map((c) => ({ ...c, roas: c.revenue / c.spend })).sort((a, b) => b.roas - a.roas);
                return (
                  <BarList
                    ariaLabel="ROAS by campaign"
                    items={paid.map((c) => ({
                      id: c.id,
                      label: c.name,
                      value: c.roas,
                      display: `${c.roas.toFixed(1)}x`,
                    }))}
                  />
                );
              }}
            </AsyncView>
          </div>
        </Card>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card as="section" aria-labelledby="an-pages" className="xl:col-span-2">
          <CardHeader titleId="an-pages" title="Top landing pages" description="Last 30 days" />
          <AsyncView
            status={breakdown.status}
            data={breakdown.data}
            error={breakdown.error}
            onRetry={breakdown.reload}
            isEmpty={(d) => d.pages.length === 0}
            skeleton={<ChartSkeleton height={240} />}
            empty={{ title: "No page data yet" }}
          >
            {(d) => (
              <div className="overflow-x-auto px-2 pt-3 pb-3">
                <table className="w-full min-w-[520px] text-left text-[13px]">
                  <thead>
                    <tr className="text-[11.5px] text-subtle">
                      <th scope="col" className="px-3 py-2 font-medium">
                        Page
                      </th>
                      <th scope="col" className="px-3 py-2 text-right font-medium">
                        Visitors
                      </th>
                      <th scope="col" className="px-3 py-2 text-right font-medium">
                        Conversion
                      </th>
                      <th scope="col" className="px-3 py-2 text-right font-medium">
                        Change
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {d.pages.map((p) => (
                      <tr key={p.path} className="transition-colors hover:bg-surface-2/60">
                        <td className="px-3 py-2.5">
                          <p className="font-medium text-fg">{p.title}</p>
                          <p className="font-mono text-[11.5px] text-subtle">{p.path}</p>
                        </td>
                        <td className="px-3 py-2.5 text-right text-fg-2 tabular">{formatNumber(p.visitors)}</td>
                        <td className="px-3 py-2.5 text-right text-fg-2 tabular">{formatPercent(p.conversion)}</td>
                        <td className="px-3 py-2.5 text-right">
                          <Delta change={p.change} size="xs" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AsyncView>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          <Card as="section" aria-labelledby="an-devices">
            <CardHeader titleId="an-devices" title="Devices" description="Share of sessions" />
            <div className="px-5 pt-4 pb-5">
              <AsyncView status={breakdown.status} data={breakdown.data} error={breakdown.error} onRetry={breakdown.reload} compact isEmpty={(d) => d.devices.length === 0} skeleton={<Skeleton className="h-24" />}>
                {(d) => (
                  <div>
                    <div className="flex h-2.5 gap-[2px] overflow-hidden rounded-full" role="img" aria-label={d.devices.map((x) => `${x.label} ${formatPercent(x.value, 0)}`).join(", ")}>
                      {d.devices.map((x, i) => (
                        <div key={x.id} style={{ width: `${x.value * 100}%`, background: series[(i + 1) as 1 | 2 | 3] }} />
                      ))}
                    </div>
                    <ul className="mt-4 grid grid-cols-3 gap-2">
                      {d.devices.map((x, i) => {
                        const Icon = x.id === "mobile" ? Smartphone : x.id === "desktop" ? Monitor : Tablet;
                        return (
                          <li key={x.id} className="rounded-xl bg-surface-2/60 p-3">
                            <span className="flex items-center gap-1.5 text-[12px] text-muted">
                              <span className="size-2 rounded-[3px]" style={{ background: series[(i + 1) as 1 | 2 | 3] }} aria-hidden />
                              <Icon className="size-3.5" aria-hidden /> {x.label}
                            </span>
                            <p className="mt-1 text-[17px] font-semibold text-fg">{formatPercent(x.value, 0)}</p>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </AsyncView>
            </div>
          </Card>
          <Card as="section" aria-labelledby="an-funnel">
            <CardHeader titleId="an-funnel" title="Funnel" description="This month, visitor to won client" />
            <div className="px-5 pt-4 pb-5">
              <AsyncView status={breakdown.status} data={breakdown.data} error={breakdown.error} onRetry={breakdown.reload} compact isEmpty={(d) => d.funnel.length === 0} skeleton={<Skeleton className="h-32" />}>
                {(d) => (
                  <ol className="space-y-2">
                    {d.funnel.map((f, i) => {
                      const prev = i > 0 ? d.funnel[i - 1].value : null;
                      return (
                        <li key={f.id} className="flex items-center justify-between gap-3 text-[13px]">
                          <span className="flex items-center gap-2 text-fg-2">
                            <span className="grid size-5 place-items-center rounded-md bg-surface-3 text-[10.5px] font-semibold text-muted">{i + 1}</span>
                            {f.label}
                          </span>
                          <span className="flex items-baseline gap-2">
                            {prev && <span className="text-[11.5px] text-subtle tabular">{formatPercent(f.value / prev)}</span>}
                            <span className="font-semibold text-fg tabular">{formatNumber(f.value)}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </AsyncView>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
