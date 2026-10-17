"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, CircleCheck, CircleDashed, CircleMinus, ListPlus, Radar, ScanSearch, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BarList } from "@/components/charts/bar-list";
import { Sparkline, series } from "@/components/charts/chart-kit";
import { TrendChart } from "@/components/charts/charts";
import { useToast } from "@/components/providers/toast-provider";
import { AsyncView } from "@/components/shared/async-view";
import { PageHeader } from "@/components/shared/page-header";
import { Stagger, StaggerItem } from "@/components/shared/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Progress, Skeleton } from "@/components/ui/feedback";
import { AnimatedNumber, Delta } from "@/components/ui/metric";
import { ScoreRing } from "@/components/ui/score-ring";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/lib/api";
import { formatCompact, formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Kpi, Recommendation, ScoreBreakdown, TrackedPrompt } from "@/types";

function ScoreCard({
  title,
  subtitle,
  score,
  change,
  breakdown,
  tone,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  score: number;
  change: number;
  breakdown: ScoreBreakdown[];
  tone: "accent" | "info";
  icon: React.ElementType;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="flex flex-col items-center sm:w-44">
          <ScoreRing value={score} label={title} size={148} stroke={11} tone={tone} sublabel={score >= 85 ? "Excellent" : score >= 70 ? "Strong" : "Needs work"} />
          <span className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-muted">
            <Delta change={change} kind="absolute" size="xs" /> this quarter
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-fg">
            <Icon className="size-4 text-muted" aria-hidden /> {title}
          </h2>
          <p className="mt-0.5 text-[12.5px] text-muted">{subtitle}</p>
          <ul className="mt-4 space-y-3">
            {breakdown.map((b, i) => (
              <li key={b.label}>
                <div className="mb-1 flex items-baseline justify-between text-[12.5px]">
                  <span className="font-medium text-fg-2">{b.label}</span>
                  <span className="font-semibold text-fg tabular">{b.score}</span>
                </div>
                <Progress value={b.score / 100} tone={b.score >= 85 ? "success" : b.score >= 70 ? "brand" : "warning"} label={b.label} delay={0.2 + i * 0.08} />
                <p className="mt-1 text-[11.5px] leading-snug text-subtle">{b.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

function KpiTile({ kpi }: { kpi: Kpi }) {
  return (
    <Card interactive className="h-full p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[12.5px] font-medium text-muted">{kpi.label}</p>
          <p className="text-[11px] text-subtle">{kpi.period}</p>
        </div>
        {kpi.spark && <Sparkline data={kpi.spark} width={64} height={24} color={series[4]} />}
      </div>
      <AnimatedNumber value={kpi.value} format={kpi.format} className="mt-2 block text-[22px] leading-7 font-semibold tracking-[-0.03em] text-fg" />
      <div className="mt-1 flex flex-wrap items-center gap-x-1.5">
        <Delta change={kpi.change} kind={kpi.changeKind} size="xs" />
        <span className="text-[11.5px] text-subtle">{kpi.comparison}</span>
      </div>
    </Card>
  );
}

const promptMeta: Record<TrackedPrompt["result"], { label: string; icon: React.ElementType; tone: "success" | "info" | "neutral" }> = {
  cited: { label: "Cited", icon: CircleCheck, tone: "success" },
  mentioned: { label: "Mentioned", icon: CircleDashed, tone: "info" },
  absent: { label: "Not present", icon: CircleMinus, tone: "neutral" },
};

const impactTone = { High: "brand", Medium: "info", Low: "neutral" } as const;

function Recommendations({ items }: { items: Recommendation[] }) {
  const toast = useToast();
  const router = useRouter();
  const [queued, setQueued] = useState<string[]>([]);
  return (
    <ol className="divide-y divide-line">
      {items.map((r, i) => (
        <motion.li key={r.id} initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start">
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-surface-3 text-[12px] font-semibold text-fg-2">{i + 1}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-semibold text-fg">{r.title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">{r.description}</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <Badge tone={impactTone[r.impact]}>{r.impact} impact</Badge>
              <Badge tone="outline">{r.effort} effort</Badge>
              <Badge tone="neutral">{r.category}</Badge>
              <span className="ml-1 text-[12px] font-medium text-success">{r.estimatedLift}</span>
            </div>
          </div>
          <Button
            variant={queued.includes(r.id) ? "ghost" : "secondary"}
            size="sm"
            disabled={queued.includes(r.id)}
            onClick={() => {
              setQueued((q) => [...q, r.id]);
              toast({ title: "Added to task board", description: r.title, action: { label: "Open board", onClick: () => router.push("/tasks") } });
            }}
          >
            {queued.includes(r.id) ? (
              <>
                <CircleCheck /> Added
              </>
            ) : (
              <>
                <ListPlus /> Create task
              </>
            )}
          </Button>
        </motion.li>
      ))}
    </ol>
  );
}

export function SeoView() {
  const toast = useToast();
  const res = useResource(() => api.seo.overview());
  const [tab, setTab] = useState("seo");
  const [auditing, setAuditing] = useState(false);

  const runAudit = () => {
    setAuditing(true);
    window.setTimeout(() => {
      setAuditing(false);
      toast({ title: "Site audit complete", description: "342 pages crawled. 2 new issues found, both on mobile LCP.", tone: "success" });
    }, 2200);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="SEO & GEO"
        description="Visibility in classic search and inside AI-generated answers, measured side by side."
        actions={
          <>
            <Button variant="secondary" onClick={runAudit} loading={auditing}>
              <ScanSearch /> Run site audit
            </Button>
            <Button asChild>
              <Link href="/ai?intent=seo">
                <Sparkles /> Generate strategy
              </Link>
            </Button>
          </>
        }
      />

      <AsyncView
        status={res.status}
        data={res.data}
        error={res.error}
        onRetry={res.reload}
        skeleton={
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Skeleton className="h-72 rounded-2xl" />
              <Skeleton className="h-72 rounded-2xl" />
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
          </div>
        }
        empty={{ title: "Search visibility isn't tracked yet", description: "Connect Google Search Console and we'll start tracking rankings and AI visibility.", icon: Radar }}
      >
        {(d) => (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ScoreCard title="SEO score" subtitle="How well you compete in traditional search" score={d.seoScore.score} change={d.seoScore.change} breakdown={d.seoScore.breakdown} tone="accent" icon={ScanSearch} />
              <ScoreCard title="GEO visibility" subtitle="How often AI assistants surface and cite you" score={d.geoScore.score} change={d.geoScore.change} breakdown={d.geoScore.breakdown} tone="info" icon={Radar} />
            </div>

            <Tabs value={tab} onValueChange={setTab}>
              <TabsList
                label="Search visibility sections"
                value={tab}
                items={[
                  { value: "seo", label: "SEO overview" },
                  { value: "geo", label: "GEO · AI visibility" },
                ]}
              />

              <TabsContent value="seo" className="mt-5 space-y-4 outline-none">
                <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
                  {d.seoKpis.map((k) => (
                    <StaggerItem key={k.id}>
                      <KpiTile kpi={k} />
                    </StaggerItem>
                  ))}
                </Stagger>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
                  <Card as="section" aria-labelledby="organic-h" className="xl:col-span-2">
                    <CardHeader titleId="organic-h" title="Organic traffic" description="Monthly visits from search, last 12 months" />
                    <div className="px-2 pt-4 pb-4 sm:px-3">
                      <TrendChart data={d.organicTrend} dataKey="organic" name="Organic visits" format={formatNumber} axisFormat={formatCompact} color={series[4]} height={260} />
                    </div>
                  </Card>

                  <Card as="section" aria-labelledby="kw-h" className="overflow-hidden xl:col-span-3">
                    <CardHeader titleId="kw-h" title="Keyword rankings" description="Top tracked keywords by commercial value" />
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full min-w-[560px] text-left text-[13px]">
                        <thead className="bg-surface-2/60 text-[11.5px] text-muted">
                          <tr>
                            <th scope="col" className="py-2.5 pr-3 pl-5 font-medium">
                              Keyword
                            </th>
                            <th scope="col" className="px-3 py-2.5 text-right font-medium">
                              Position
                            </th>
                            <th scope="col" className="px-3 py-2.5 text-right font-medium">
                              Volume
                            </th>
                            <th scope="col" className="py-2.5 pr-5 pl-3 font-medium">
                              Intent
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                          {d.keywords.map((k) => (
                            <tr key={k.id} className="transition-colors hover:bg-surface-2/60">
                              <td className="py-2.5 pr-3 pl-5">
                                <p className="font-medium text-fg">{k.keyword}</p>
                                <p className="font-mono text-[11px] text-subtle">{k.url}</p>
                              </td>
                              <td className="px-3 py-2.5 text-right">
                                <span className="inline-flex items-center gap-2">
                                  <span className={cn("font-semibold tabular", k.position <= 3 ? "text-success" : k.position <= 10 ? "text-fg" : "text-muted")}>#{k.position}</span>
                                  <span className={cn("inline-flex w-9 items-center justify-end text-[11.5px] tabular", k.change > 0 ? "text-success" : k.change < 0 ? "text-danger" : "text-subtle")}>
                                    {k.change > 0 ? <ArrowUpRight className="size-3" aria-hidden /> : k.change < 0 ? <ArrowDownRight className="size-3" aria-hidden /> : null}
                                    {k.change === 0 ? "—" : Math.abs(k.change)}
                                    <span className="sr-only">{k.change > 0 ? "positions up" : k.change < 0 ? "positions down" : "no change"}</span>
                                  </span>
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-right text-fg-2 tabular">{formatNumber(k.volume)}</td>
                              <td className="py-2.5 pr-5 pl-3">
                                <Badge tone={k.intent === "Transactional" ? "brand" : k.intent === "Commercial" ? "info" : "neutral"}>{k.intent}</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="geo" className="mt-5 space-y-4 outline-none">
                <Stagger className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                  {d.geoKpis.map((k) => (
                    <StaggerItem key={k.id}>
                      <KpiTile kpi={k} />
                    </StaggerItem>
                  ))}
                </Stagger>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
                  <Card as="section" aria-labelledby="engines-h" className="xl:col-span-2">
                    <CardHeader titleId="engines-h" title="Generative search presence" description="Share of tracked prompts where you appear, by engine" />
                    <div className="px-5 pt-4 pb-5">
                      <BarList
                        ariaLabel="Visibility by AI engine"
                        color={series[2]}
                        max={1}
                        items={d.aiEngines.map((e) => ({
                          id: e.id,
                          label: e.engine,
                          value: e.visibility,
                          display: formatPercent(e.visibility, 0),
                          meta: <span className="text-[11.5px] text-subtle tabular">{e.citations} citations</span>,
                        }))}
                      />
                    </div>
                  </Card>

                  <Card as="section" aria-labelledby="prompts-h" className="overflow-hidden xl:col-span-3">
                    <CardHeader titleId="prompts-h" title="Tracked prompts" description="How AI assistants answer the questions your buyers ask" />
                    <ul className="mt-3 divide-y divide-line">
                      {d.trackedPrompts.map((p) => {
                        const meta = promptMeta[p.result];
                        const Icon = meta.icon;
                        return (
                          <li key={p.id} className="flex items-start gap-3 px-5 py-3">
                            <Icon className={cn("mt-0.5 size-4 shrink-0", p.result === "cited" ? "text-success" : p.result === "mentioned" ? "text-info" : "text-subtle")} aria-hidden />
                            <div className="min-w-0 flex-1">
                              <p className="text-[13px] font-medium text-fg">“{p.prompt}”</p>
                              <p className="mt-0.5 text-[12px] text-muted">{p.engine}</p>
                            </div>
                            <Badge tone={meta.tone}>
                              {meta.label}
                              {p.position ? ` · #${p.position}` : ""}
                            </Badge>
                          </li>
                        );
                      })}
                    </ul>
                  </Card>
                </div>

                <Card as="section" aria-labelledby="ai-traffic-h">
                  <CardHeader titleId="ai-traffic-h" title="Visits from AI assistants" description="Referral sessions from ChatGPT, Perplexity, Gemini, Copilot and Claude" />
                  <div className="px-2 pt-4 pb-4 sm:px-3">
                    <TrendChart data={d.organicTrend} dataKey="ai" name="AI referral visits" format={formatNumber} axisFormat={formatCompact} color={series[2]} height={220} />
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            <Card as="section" aria-labelledby="recs-h">
              <CardHeader
                titleId="recs-h"
                title="Recommended content opportunities"
                description="Prioritised by expected impact on rankings, AI citations and leads"
                icon={
                  <span className="grid size-8 place-items-center rounded-lg bg-accent-soft text-accent-ink">
                    <Sparkles className="size-4" aria-hidden />
                  </span>
                }
              />
              <div className="px-5 pt-5 pb-5">
                <Recommendations items={d.recommendations} />
              </div>
            </Card>
          </div>
        )}
      </AsyncView>
    </div>
  );
}
