"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Download, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ActivityCard, ChannelMixCard, PriorityTasksCard, TopCampaignsCard, VisibilityCard } from "@/components/dashboard/overview-cards";
import { PipelineCard } from "@/components/dashboard/pipeline-card";
import { RevenuePanel } from "@/components/dashboard/revenue-panel";
import { useToast } from "@/components/providers/toast-provider";
import { KpiCard, KpiCardSkeleton } from "@/components/shared/kpi-card";
import { PageHeader } from "@/components/shared/page-header";
import { Stagger, StaggerItem } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState, EmptyState } from "@/components/ui/states";
import { currentUser } from "@/data/user";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/lib/api";
import { greeting } from "@/lib/format";

const noop = () => () => {};

function useClientValue<T>(get: () => T, server: T) {
  return useSyncExternalStore(noop, get, () => server);
}

function InsightBanner({ title, detail }: { title: string; detail: string }) {
  const [open, setOpen] = useState(true);
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.section
          aria-label="AI insight"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="relative overflow-hidden rounded-2xl border border-accent/15 bg-[linear-gradient(100deg,var(--accent-soft)_0%,transparent_55%)] bg-surface p-4 sm:p-5">
            <div className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-[radial-gradient(circle,var(--accent-soft-2),transparent_70%)]" aria-hidden />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-brand-fg shadow-brand">
                <Sparkles className="size-[18px]" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11.5px] font-semibold tracking-[0.08em] text-accent-ink uppercase">FadHype AI · this week</p>
                <p className="mt-0.5 text-[14.5px] font-semibold text-fg">{title}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{detail}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button asChild size="md">
                  <Link href="/ai?intent=growth">
                    Review opportunities <ArrowRight />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" aria-label="Dismiss insight" onClick={() => setOpen(false)}>
                  <X />
                </Button>
              </div>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

export function DashboardView() {
  const toast = useToast();
  const overview = useResource(() => api.dashboard.overview());
  const hello = useClientValue(() => greeting(), "Good morning");
  const today = useClientValue(() => new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }), "");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={
          <>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-success" aria-hidden /> All sources synced
            </span>
            {today && (
              <>
                <span className="text-subtle" aria-hidden>
                  ·
                </span>
                <span suppressHydrationWarning>{today}</span>
              </>
            )}
          </>
        }
        title={
          <span suppressHydrationWarning>
            {hello}, {currentUser.firstName}.
          </span>
        }
        description="Here's your business performance overview."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => toast({ title: "Export started", description: "A CSV of this overview will be ready in Reports shortly.", tone: "info" })}
            >
              <Download /> Export
            </Button>
            <Button asChild>
              <Link href="/ai">
                <Sparkles /> Ask FadHype AI
              </Link>
            </Button>
          </>
        }
      />

      {overview.status === "error" ? (
        <Card>
          <ErrorState title="Performance data didn't load" error={overview.error} onRetry={overview.reload} />
        </Card>
      ) : overview.status === "success" && overview.data && overview.data.primary.length === 0 ? (
        <Card>
          <EmptyState
            title="Your dashboard is ready for data"
            description="Connect your analytics, ad accounts and CRM in Settings → Integrations, and your KPIs will appear here within minutes."
            action={
              <Button asChild variant="secondary" size="sm">
                <Link href="/settings">Connect data sources</Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <section aria-label="Key metrics">
            {overview.status === "loading" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                  {[0, 1, 2, 3].map((i) => (
                    <KpiCardSkeleton key={i} />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                  {[0, 1, 2, 3].map((i) => (
                    <KpiCardSkeleton key={i} variant="compact" />
                  ))}
                </div>
              </div>
            ) : (
              overview.data && (
                <div className="space-y-4">
                  <Stagger className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                    {overview.data.primary.map((kpi, i) => (
                      <StaggerItem key={kpi.id}>
                        <KpiCard kpi={kpi} index={i} />
                      </StaggerItem>
                    ))}
                  </Stagger>
                  <Stagger className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                    {overview.data.secondary.map((kpi, i) => (
                      <StaggerItem key={kpi.id}>
                        <KpiCard kpi={kpi} index={i + 4} variant="compact" />
                      </StaggerItem>
                    ))}
                  </Stagger>
                </div>
              )
            )}
          </section>

          {overview.data?.insight && <InsightBanner title={overview.data.insight.title} detail={overview.data.insight.detail} />}
        </>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenuePanel />
        </div>
        <PipelineCard />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <TopCampaignsCard />
        <ChannelMixCard />
        <ActivityCard />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PriorityTasksCard />
        <VisibilityCard />
      </div>
    </div>
  );
}
