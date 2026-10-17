"use client";

import { Megaphone, Pause, Play, Plus, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { ChartDataTable, Legend, Sparkline, series } from "@/components/charts/chart-kit";
import { GroupedBars, RateLineChart } from "@/components/charts/charts";
import { useToast } from "@/components/providers/toast-provider";
import { AsyncView } from "@/components/shared/async-view";
import { PageHeader } from "@/components/shared/page-header";
import { Stagger, StaggerItem } from "@/components/shared/reveal";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Drawer } from "@/components/ui/dialog";
import { Progress, Skeleton } from "@/components/ui/feedback";
import { AnimatedNumber } from "@/components/ui/metric";
import { Segmented } from "@/components/ui/segmented";
import { Tooltip } from "@/components/ui/tooltip";
import { campaignTotals, platformMeta } from "@/data/campaigns";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/lib/api";
import { formatCompactCurrency, formatCurrency, formatCurrencyPrecise, formatDateLong, formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Campaign, CampaignPlatform, CampaignStatus } from "@/types";

const statusMeta: Record<CampaignStatus, { label: string; tone: BadgeTone }> = {
  active: { label: "Active", tone: "success" },
  learning: { label: "Learning", tone: "info" },
  paused: { label: "Paused", tone: "neutral" },
  completed: { label: "Completed", tone: "outline" },
};

type PlatformFilter = "all" | CampaignPlatform;

function PlatformMark({ platform, size = "md" }: { platform: CampaignPlatform; size?: "sm" | "md" }) {
  const meta = platformMeta[platform];
  return (
    <span
      className={cn("grid shrink-0 place-items-center rounded-lg font-semibold text-white", size === "sm" ? "size-6 text-[10px]" : "size-8 text-[11px]")}
      style={{ background: series[meta.chart] }}
      aria-hidden
    >
      {meta.short}
    </span>
  );
}

const roas = (c: Campaign) => (c.spend > 0 ? c.revenue / c.spend : null);

function CampaignDrawer({ campaign, open, onOpenChange, onToggle }: { campaign: Campaign | null; open: boolean; onOpenChange: (v: boolean) => void; onToggle: (c: Campaign) => void }) {
  if (!campaign) return null;
  const r = roas(campaign);
  const ctr = campaign.impressions ? campaign.clicks / campaign.impressions : 0;
  const cpl = campaign.leads ? campaign.spend / campaign.leads : 0;
  const cvr = campaign.leads ? campaign.conversions / campaign.leads : 0;
  const advice =
    r === null
      ? "Organic programme: keep publishing. Each article in this cluster pays back within about 6 weeks."
      : r < 2
        ? "Below break-even on margin. Cut budget about 70% and refresh creative with client-proof angles before relaunching."
        : r > 5
          ? "Top performer with headroom. Impression share is capped, so raise the budget 20% and watch marginal CPA."
          : "Healthy and stable. Test one new creative angle per week to protect efficiency as you scale.";
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={campaign.name}
      description={`${campaign.platform} · ${campaign.objective} · since ${formatDateLong(campaign.startDate)}`}
      footer={
        campaign.status !== "completed" && campaign.platform !== "Organic" ? (
          <Button variant="secondary" onClick={() => onToggle(campaign)}>
            {campaign.status === "paused" ? (
              <>
                <Play /> Resume campaign
              </>
            ) : (
              <>
                <Pause /> Pause campaign
              </>
            )}
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-6 px-6 py-5">
        <div className="flex items-center gap-3">
          <PlatformMark platform={campaign.platform} />
          <Badge tone={statusMeta[campaign.status].tone} dot>
            {statusMeta[campaign.status].label}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            ["Revenue", formatCurrency(campaign.revenue)],
            ["ROAS", r ? `${r.toFixed(1)}x` : "—"],
            ["Spend", formatCurrency(campaign.spend)],
            ["Leads", formatNumber(campaign.leads)],
            ["Conversions", formatNumber(campaign.conversions)],
            ["Cost per lead", cpl ? formatCurrencyPrecise(cpl) : "—"],
            ["Impressions", formatNumber(campaign.impressions)],
            ["Click-through", formatPercent(ctr, 2)],
            ["Lead → client", formatPercent(cvr)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-line bg-surface-2/50 px-3 py-2.5">
              <p className="text-[11.5px] text-muted">{k}</p>
              <p className="mt-0.5 text-[16px] font-semibold tracking-tight text-fg">{v}</p>
            </div>
          ))}
        </div>
        {campaign.trend.length > 1 && (
          <div>
            <p className="mb-2 text-[12.5px] font-medium text-fg-2">ROAS, last {campaign.trend.length} days</p>
            <div className="rounded-xl border border-line p-3">
              <Sparkline data={campaign.trend} width={480} height={80} className="h-20 w-full" />
            </div>
          </div>
        )}
        <div className="rounded-xl border border-accent/15 bg-accent-soft p-3.5">
          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-accent-ink">
            <Sparkles className="size-3.5" aria-hidden /> FadHype AI recommendation
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-fg-2">{advice}</p>
        </div>
        {campaign.budget > 0 && (
          <div>
            <div className="mb-1.5 flex justify-between text-[12.5px]">
              <span className="text-muted">Budget used</span>
              <span className="font-medium text-fg tabular">
                {formatCurrency(campaign.spend)} of {formatCurrency(campaign.budget)}
              </span>
            </div>
            <Progress value={campaign.spend / campaign.budget} label="Budget used" />
          </div>
        )}
      </div>
    </Drawer>
  );
}

export function CampaignsView() {
  const toast = useToast();
  const res = useResource(() => api.campaigns.list());
  const weekly = useResource(() => api.campaigns.weekly());
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const list = useMemo(() => (res.data ?? []).filter((c) => platform === "all" || c.platform === platform), [res.data, platform]);
  const totals = campaignTotals(list);
  const selected = res.data?.find((c) => c.id === selectedId) ?? null;

  const toggle = (c: Campaign) => {
    const next: CampaignStatus = c.status === "paused" ? "active" : "paused";
    res.setData((all) => all.map((x) => (x.id === c.id ? { ...x, status: next } : x)));
    toast({ title: next === "paused" ? "Campaign paused" : "Campaign resumed", description: `${c.name} on ${c.platform}`, tone: "info" });
  };

  const open = (id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        description="Paid, organic and email campaigns, managed to revenue rather than clicks."
        actions={
          <Button onClick={() => toast({ title: "Campaign brief started", description: "Marcus Bell will reach out within one business day.", tone: "info" })}>
            <Plus /> Request campaign
          </Button>
        }
      />

      <div className="-mx-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
        <Segmented
          label="Filter by platform"
          value={platform}
          onChange={setPlatform}
          options={[
            { value: "all", label: "All platforms" },
            ...(Object.keys(platformMeta) as CampaignPlatform[]).map((p) => ({ value: p, label: p })),
          ]}
        />
      </div>

      <AsyncView
        status={res.status}
        data={res.data}
        error={res.error}
        onRetry={res.reload}
        skeleton={
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        }
        empty={{ title: "No campaigns yet", description: "Connect Google Ads, Meta or LinkedIn to bring campaigns in.", icon: Megaphone }}
      >
        {() => (
          <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            {[
              { label: "Paid budget", value: totals.budget, format: "currency" as const, sub: totals.budget ? `${formatPercent(totals.spend / totals.budget, 0)} used` : "No paid budget" },
              { label: "Spend", value: totals.spend, format: "currency" as const, sub: "Month to date" },
              { label: "Leads", value: totals.leads, format: "number" as const, sub: `${totals.active} active campaigns` },
              { label: "Conversions", value: totals.conversions, format: "number" as const, sub: totals.leads ? `${formatPercent(totals.conversions / totals.leads)} of leads` : "—" },
              { label: "Attributed revenue", value: totals.revenue, format: "currency" as const, sub: "Data-driven model" },
              { label: "Blended ROAS", value: totals.roas, format: "multiplier" as const, sub: "Paid media only" },
            ].map((k) => (
              <StaggerItem key={`${k.label}-${platform}`}>
                <Card className="h-full p-4">
                  <p className="text-[12.5px] font-medium text-muted">{k.label}</p>
                  <AnimatedNumber value={k.value} format={k.format} className="mt-1.5 block text-[21px] leading-7 font-semibold tracking-[-0.03em] text-fg" />
                  <p className="mt-1 text-[11.5px] text-subtle">{k.sub}</p>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </AsyncView>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card as="section" aria-labelledby="wk-h">
          <CardHeader
            titleId="wk-h"
            title="Weekly spend vs revenue"
            description="All paid platforms, last 8 weeks"
            action={
              <Legend
                items={[
                  { label: "Spend", color: series[2] },
                  { label: "Revenue", color: series[1] },
                ]}
              />
            }
          />
          <AsyncView status={weekly.status} data={weekly.data} error={weekly.error} onRetry={weekly.reload} skeleton={<Skeleton className="m-5 h-60 rounded-xl" />} empty={{ title: "No weekly data" }}>
            {(w) => (
              <div className="px-2 pt-4 pb-4 sm:px-3">
                <GroupedBars
                  data={w.map((x) => ({ label: x.week, spend: x.spend, revenue: x.revenue }))}
                  keys={[
                    { key: "spend", label: "Spend", color: series[2] },
                    { key: "revenue", label: "Revenue", color: series[1] },
                  ]}
                  format={formatCompactCurrency}
                  height={250}
                />
                <ChartDataTable caption="Weekly spend and revenue" columns={["Week", "Spend", "Revenue"]} rows={w.map((x) => [x.week, formatCurrency(x.spend), formatCurrency(x.revenue)])} />
              </div>
            )}
          </AsyncView>
        </Card>
        <Card as="section" aria-labelledby="roas-h">
          <CardHeader titleId="roas-h" title="Blended ROAS trend" description="Weekly return on ad spend against the 4.0x target" />
          <AsyncView status={weekly.status} data={weekly.data} error={weekly.error} onRetry={weekly.reload} skeleton={<Skeleton className="m-5 h-60 rounded-xl" />} empty={{ title: "No weekly data" }}>
            {(w) => (
              <div className="px-2 pt-4 pb-4 sm:px-3">
                <RateLineChart
                  data={w.map((x) => ({ label: x.week, roas: x.revenue / x.spend }))}
                  dataKey="roas"
                  name="ROAS"
                  target={4}
                  targetLabel="Target 4.0x"
                  format={(v) => `${v.toFixed(1)}x`}
                  height={250}
                  color={series[1]}
                />
              </div>
            )}
          </AsyncView>
        </Card>
      </div>

      <Card as="section" aria-labelledby="cmp-table-h" className="overflow-hidden">
        <CardHeader titleId="cmp-table-h" title="All campaigns" description={`${list.length} campaigns${platform !== "all" ? ` on ${platform}` : ""}`} />
        <AsyncView status={res.status} data={res.data} error={res.error} onRetry={res.reload} skeleton={<Skeleton className="m-5 h-72 rounded-xl" />} empty={{ title: "No campaigns", icon: Megaphone }}>
          {() =>
            list.length === 0 ? (
              <p className="px-5 py-12 text-center text-[13px] text-muted">No campaigns on this platform yet.</p>
            ) : (
              <>
                <div className="mt-3 hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[920px] text-left text-[13px]">
                    <thead className="bg-surface-2/60 text-[11.5px] text-muted">
                      <tr>
                        {["Campaign", "Status", "Budget", "Spend", "Leads", "Conversions", "Revenue", "ROAS", ""].map((h, i) => (
                          <th key={h || i} scope="col" className={cn("px-3 py-2.5 font-medium", i === 0 && "pl-5", i >= 3 && i <= 7 && "text-right", i === 8 && "pr-5")}>
                            {h || <span className="sr-only">Actions</span>}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {list.map((c) => {
                        const r = roas(c);
                        return (
                          <tr key={c.id} onClick={() => open(c.id)} className="group cursor-pointer transition-colors hover:bg-surface-2/60">
                            <td className="py-3 pr-3 pl-5">
                              <div className="flex items-center gap-3">
                                <PlatformMark platform={c.platform} />
                                <div className="min-w-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      open(c.id);
                                    }}
                                    className="font-medium text-fg group-hover:text-accent-ink"
                                  >
                                    {c.name}
                                  </button>
                                  <p className="text-[12px] text-muted">
                                    {c.platform} · {c.objective}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <Badge tone={statusMeta[c.status].tone} dot>
                                {statusMeta[c.status].label}
                              </Badge>
                            </td>
                            <td className="w-36 px-3 py-3">
                              {c.budget > 0 ? (
                                <div>
                                  <p className="text-fg-2 tabular">{formatCurrency(c.budget)}</p>
                                  <Progress value={c.spend / c.budget} className="mt-1.5 h-1" label={`${c.name} budget used`} />
                                </div>
                              ) : (
                                <span className="text-subtle">—</span>
                              )}
                            </td>
                            <td className="px-3 py-3 text-right text-fg-2 tabular">{formatCurrency(c.spend)}</td>
                            <td className="px-3 py-3 text-right text-fg-2 tabular">{formatNumber(c.leads)}</td>
                            <td className="px-3 py-3 text-right text-fg-2 tabular">{formatNumber(c.conversions)}</td>
                            <td className="px-3 py-3 text-right font-medium text-fg tabular">{formatCurrency(c.revenue)}</td>
                            <td className="px-3 py-3 text-right">
                              <span className="inline-flex items-center justify-end gap-2">
                                {c.trend.length > 1 && <Sparkline data={c.trend} width={52} height={20} highlightLast={false} color={r !== null && r < 2 ? "var(--danger)" : series[1]} />}
                                <span className={cn("w-10 font-semibold tabular", r === null ? "text-subtle" : r < 2 ? "text-danger" : r >= 4 ? "text-success" : "text-fg")}>{r === null ? "—" : `${r.toFixed(1)}x`}</span>
                              </span>
                            </td>
                            <td className="py-3 pr-5 pl-3 text-right">
                              {c.status !== "completed" && c.platform !== "Organic" && (
                                <Tooltip content={c.status === "paused" ? "Resume" : "Pause"}>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggle(c);
                                    }}
                                    aria-label={`${c.status === "paused" ? "Resume" : "Pause"} ${c.name}`}
                                    className="grid size-8 place-items-center rounded-lg text-subtle transition-colors hover:bg-surface-3 hover:text-fg"
                                  >
                                    {c.status === "paused" ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
                                  </button>
                                </Tooltip>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <ul className="mt-3 divide-y divide-line md:hidden">
                  {list.map((c) => {
                    const r = roas(c);
                    return (
                      <li key={c.id}>
                        <button type="button" onClick={() => open(c.id)} className="w-full px-4 py-3.5 text-left active:bg-surface-2">
                          <div className="flex items-start gap-3">
                            <PlatformMark platform={c.platform} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="truncate text-[13.5px] font-medium text-fg">{c.name}</p>
                                <Badge tone={statusMeta[c.status].tone} dot>
                                  {statusMeta[c.status].label}
                                </Badge>
                              </div>
                              <dl className="mt-2 grid grid-cols-3 gap-2 text-[12px]">
                                <div>
                                  <dt className="text-subtle">Spend</dt>
                                  <dd className="font-medium text-fg-2 tabular">{formatCurrency(c.spend)}</dd>
                                </div>
                                <div>
                                  <dt className="text-subtle">Revenue</dt>
                                  <dd className="font-medium text-fg tabular">{formatCurrency(c.revenue)}</dd>
                                </div>
                                <div>
                                  <dt className="text-subtle">ROAS</dt>
                                  <dd className={cn("font-semibold tabular", r === null ? "text-subtle" : r < 2 ? "text-danger" : "text-fg")}>{r === null ? "—" : `${r.toFixed(1)}x`}</dd>
                                </div>
                              </dl>
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )
          }
        </AsyncView>
      </Card>

      <CampaignDrawer campaign={selected} open={drawerOpen && Boolean(selected)} onOpenChange={setDrawerOpen} onToggle={toggle} />
    </div>
  );
}
