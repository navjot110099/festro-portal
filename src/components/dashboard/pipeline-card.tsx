"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AsyncView } from "@/components/shared/async-view";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/feedback";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/lib/api";
import { formatNumber, formatPercent } from "@/lib/format";

/** Ordinal ramp: one hue, stepping lighter as the funnel narrows (lightest step still ≥2:1 on surface). */
const ramp = [1, 0.84, 0.7, 0.58, 0.48];

export function PipelineCard() {
  const res = useResource(() => api.leads.summary());
  return (
    <Card as="section" aria-labelledby="pipeline-title" className="flex flex-col">
      <CardHeader
        titleId="pipeline-title"
        title="Lead pipeline"
        description="Last 90 days, by furthest stage reached"
        action={
          <Link href="/leads" className="inline-flex items-center gap-1 text-caption font-medium text-accent-ink hover:underline">
            View leads <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        }
      />
      <div className="flex-1 px-5 pt-4 pb-5">
        <AsyncView
          status={res.status}
          data={res.data}
          error={res.error}
          onRetry={res.reload}
          compact
          empty={{ title: "No leads yet", description: "Leads from forms, ads and your CRM will appear here." }}
          skeleton={
            <div className="space-y-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-6" style={{ width: `${100 - i * 16}%` }} />
                </div>
              ))}
            </div>
          }
        >
          {(s) => {
            const stages = [
              { id: "total", label: "All leads", value: s.total },
              { id: "qualified", label: "Qualified", value: s.byStatus.qualified },
              { id: "contacted", label: "Contacted", value: s.byStatus.contacted },
              { id: "proposal", label: "Proposal sent", value: s.byStatus.proposal },
              { id: "converted", label: "Converted", value: s.byStatus.converted },
            ];
            const qualifiedToClient = s.byStatus.qualified ? s.byStatus.converted / s.byStatus.qualified : 0;
            return (
              <>
              <ol className="space-y-3.5">
                {stages.map((stage, i) => {
                  const pct = stage.value / s.total;
                  const step = i > 0 ? stage.value / stages[i - 1].value : null;
                  return (
                    <li key={stage.id}>
                      <div className="mb-1.5 flex items-baseline justify-between gap-2 text-caption">
                        <span className="text-fg-2">{stage.label}</span>
                        <span className="flex items-baseline gap-2">
                          {step !== null && <span className="text-micro text-subtle tabular">{formatPercent(step, 0)} of prior</span>}
                          <span className="font-semibold text-fg tabular">{formatNumber(stage.value)}</span>
                        </span>
                      </div>
                      <div className="h-6 overflow-hidden rounded-md bg-surface-2">
                        <motion.div
                          className="h-full rounded-md"
                          style={{ background: "var(--chart-1)", opacity: ramp[i] }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(pct * 100, 3)}%` }}
                          transition={{ duration: 1, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ol>
              <div className="mt-5 flex items-center justify-between rounded-xl bg-surface-2 px-3.5 py-2.5 text-caption">
                <span className="text-muted">Qualified → client</span>
                <span className="font-semibold text-fg tabular">{formatPercent(qualifiedToClient)}</span>
              </div>
              </>
            );
          }}
        </AsyncView>
      </div>
    </Card>
  );
}
