"use client";

import { ArrowRight, CalendarClock, Megaphone, Radar, SquareKanban } from "lucide-react";
import Link from "next/link";
import { BarList } from "@/components/charts/bar-list";
import { AsyncView } from "@/components/shared/async-view";
import { Card, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/feedback";
import { Delta } from "@/components/ui/metric";
import { ScoreRing } from "@/components/ui/score-ring";
import { platformMeta } from "@/data/campaigns";
import { priorityMeta } from "@/data/tasks";
import { getMember } from "@/data/user";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/lib/api";
import { daysUntil, formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ActivityRow } from "@/layouts/notifications";
import { series } from "@/components/charts/chart-kit";

function ViewAll({ href, label = "View all" }: { href: string; label?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-caption font-medium text-accent-ink hover:underline">
      {label} <ArrowRight className="size-3.5" aria-hidden />
    </Link>
  );
}

function RowsSkeleton({ rows = 5, avatar }: { rows?: number; avatar?: boolean }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          {avatar && <Skeleton className="size-8 rounded-lg" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-2.5 w-1/3" />
          </div>
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------- Campaigns */

export function TopCampaignsCard() {
  const res = useResource(() => api.campaigns.list());
  return (
    <Card as="section" aria-labelledby="top-campaigns" className="flex flex-col">
      <CardHeader titleId="top-campaigns" title="Top campaigns" description="Month to date, by attributed revenue" action={<ViewAll href="/campaigns" />} />
      <div className="flex-1 px-5 pt-4 pb-5">
        <AsyncView
          status={res.status}
          data={res.data}
          error={res.error}
          onRetry={res.reload}
          compact
          skeleton={<RowsSkeleton />}
          empty={{ title: "No campaigns running", description: "Launch a campaign to track spend, leads and ROAS.", icon: Megaphone }}
        >
          {(list) => {
            const top = [...list].filter((c) => c.revenue > 0).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
            return (
              <ul className="divide-y divide-line">
                {top.map((c) => {
                  const roas = c.spend ? c.revenue / c.spend : null;
                  const meta = platformMeta[c.platform];
                  return (
                    <li key={c.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                      <span
                        className="grid size-8 shrink-0 place-items-center rounded-lg text-micro font-semibold text-white"
                        style={{ background: series[meta.chart] }}
                        aria-hidden
                      >
                        {meta.short}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-body font-medium text-fg">{c.name}</p>
                        <p className="text-micro text-muted">
                          {c.platform} · {c.conversions} conversions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-body font-semibold text-fg tabular">{formatCurrency(c.revenue)}</p>
                        <p className="text-micro text-muted tabular">{roas ? `${roas.toFixed(1)}x ROAS` : "Organic"}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            );
          }}
        </AsyncView>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------- Channels */

export function ChannelMixCard() {
  const res = useResource(() => api.analytics.breakdown());
  return (
    <Card as="section" aria-labelledby="channel-mix" className="flex flex-col">
      <CardHeader titleId="channel-mix" title="Traffic sources" description="Share of visitors, last 30 days" action={<ViewAll href="/analytics" label="Analytics" />} />
      <div className="flex-1 px-5 pt-4 pb-5">
        <AsyncView
          status={res.status}
          data={res.data}
          error={res.error}
          onRetry={res.reload}
          compact
          isEmpty={(d) => d.channels.length === 0}
          skeleton={<RowsSkeleton rows={6} />}
          empty={{ title: "No traffic data", description: "Connect Google Analytics to see where visitors come from." }}
        >
          {(d) => (
            <BarList
              ariaLabel="Traffic sources"
              items={d.channels.map((c) => ({
                id: c.id,
                label: c.label,
                value: c.value,
                display: formatPercent(c.value, 0),
                meta: <Delta change={c.change} size="xs" />,
              }))}
            />
          )}
        </AsyncView>
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------- Activity */

export function ActivityCard({ className }: { className?: string }) {
  const res = useResource(() => api.activity.list());
  return (
    <Card as="section" id="activity" aria-labelledby="activity-title" className={cn("flex scroll-mt-24 flex-col", className)}>
      <CardHeader
        titleId="activity-title"
        title="Activity"
        description="Across leads, campaigns, search and AI"
        action={
          res.status === "success" && res.data && res.data.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-caption font-medium text-success">
              <span className="size-1.5 animate-pulse-soft rounded-full bg-success" aria-hidden /> Live
            </span>
          ) : undefined
        }
      />
      <div className="flex-1 px-5 pt-4 pb-5">
        <AsyncView status={res.status} data={res.data} error={res.error} onRetry={res.reload} compact skeleton={<RowsSkeleton avatar />} empty={{ title: "No activity yet" }}>
          {(items) => (
            <ol className="relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-4 before:w-px before:bg-line">
              {items.slice(0, 6).map((item, i) => (
                <li key={item.id} className="relative animate-[menu-in_400ms_cubic-bezier(0.16,1,0.3,1)_both]" style={{ animationDelay: `${i * 60}ms` }}>
                  <Link href={item.href ?? "/dashboard"} className="-m-1.5 block rounded-lg p-1.5 transition-colors hover:bg-surface-2">
                    <ActivityRow item={item} unread={item.unread} compact />
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </AsyncView>
      </div>
    </Card>
  );
}

/* ----------------------------------------------------------------- Tasks */

const priorityTone = { urgent: "danger", high: "warning", medium: "info", low: "neutral" } as const;

export function PriorityTasksCard() {
  const res = useResource(() => api.tasks.list());
  return (
    <Card as="section" aria-labelledby="tasks-title" className="flex flex-col">
      <CardHeader titleId="tasks-title" title="Priority work" description="What your Festro team is shipping next" action={<ViewAll href="/tasks" label="Board" />} />
      <div className="flex-1 px-5 pt-4 pb-5">
        <AsyncView
          status={res.status}
          data={res.data}
          error={res.error}
          onRetry={res.reload}
          compact
          skeleton={<RowsSkeleton rows={4} />}
          empty={{ title: "No open tasks", description: "Your team's work will show up here.", icon: SquareKanban }}
        >
          {(tasks) => {
            const open = tasks
              .filter((t) => t.status !== "done")
              .sort((a, b) => priorityMeta[a.priority].rank - priorityMeta[b.priority].rank || +new Date(a.due) - +new Date(b.due))
              .slice(0, 4);
            return (
              <ul className="space-y-2.5">
                {open.map((t) => {
                  const d = daysUntil(t.due);
                  const owner = getMember(t.assignees[0]);
                  return (
                    <li key={t.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/40 px-3 py-2.5">
                      {owner && <Avatar initials={owner.initials} hue={owner.hue} size="sm" label={owner.name} />}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-body font-medium text-fg">{t.title}</p>
                        <p className={cn("mt-0.5 flex items-center gap-1 text-micro", d <= 0 ? "text-danger" : d <= 2 ? "text-warning" : "text-muted")}>
                          <CalendarClock className="size-3" aria-hidden />
                          {d < 0 ? `${-d}d overdue` : d === 0 ? "Due today" : d === 1 ? "Due tomorrow" : `Due in ${d} days`}
                        </p>
                      </div>
                      <Badge tone={priorityTone[t.priority]}>{priorityMeta[t.priority].label}</Badge>
                    </li>
                  );
                })}
              </ul>
            );
          }}
        </AsyncView>
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------- Visibility */

export function VisibilityCard() {
  const res = useResource(() => api.seo.overview());
  return (
    <Card as="section" aria-labelledby="visibility-title" className="flex flex-col">
      <CardHeader titleId="visibility-title" title="Search visibility" description="Classic search and AI answers" action={<ViewAll href="/seo" label="SEO & GEO" />} />
      <div className="flex-1 px-5 pt-4 pb-5">
        <AsyncView
          status={res.status}
          data={res.data}
          error={res.error}
          onRetry={res.reload}
          compact
          skeleton={
            <div className="flex justify-around py-2">
              <Skeleton className="size-28 rounded-full" />
              <Skeleton className="size-28 rounded-full" />
            </div>
          }
          empty={{ title: "Visibility not tracked yet", description: "Connect Search Console to start tracking.", icon: Radar }}
        >
          {(d) => (
            <div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "SEO score", score: d.seoScore.score, change: d.seoScore.change, tone: "accent" as const },
                  { label: "GEO visibility", score: d.geoScore.score, change: d.geoScore.change, tone: "info" as const },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center rounded-xl bg-surface-2/60 px-2 py-4">
                    <ScoreRing value={s.score} label={s.label} size={108} stroke={8} tone={s.tone} />
                    <p className="mt-2.5 text-caption font-medium text-fg-2">{s.label}</p>
                    <Delta change={s.change} kind="absolute" size="xs" className="mt-0.5" />
                  </div>
                ))}
              </div>
              <p className="mt-4 text-caption leading-relaxed text-muted">
                <span className="font-medium text-fg-2">Next best move:</span> publish an on-location vs studio comparison page to win a prompt where you&apos;re absent.
              </p>
            </div>
          )}
        </AsyncView>
      </div>
    </Card>
  );
}
