"use client";

import { motion } from "framer-motion";
import { CalendarClock, Download, Eye, FileChartColumn, Link2, Plus, Printer } from "lucide-react";
import { useCallback, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useToast } from "@/components/providers/toast-provider";
import { GenerateReportDialog } from "@/components/reports/generate-dialog";
import { ReportPreview } from "@/components/reports/report-preview";
import { AsyncView } from "@/components/shared/async-view";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/feedback";
import { Switch } from "@/components/ui/switch";
import { Tooltip } from "@/components/ui/tooltip";
import { currentUser } from "@/data/user";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/lib/api";
import { formatDate, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { GeneratedReport, ReportType } from "@/types";

const statusTone = { ready: "success", scheduled: "info", generating: "warning" } as const;

export function ReportsView() {
  const toast = useToast();
  const templates = useResource(() => api.reports.templates());
  const recent = useResource(() => api.reports.recent());
  const [selected, setSelected] = useState<ReportType>("monthly");
  const [genOpen, setGenOpen] = useState(false);
  const [schedules, setSchedules] = useState({ monthly: true, seo: true, campaign: false });
  const defaultPeriod = `${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })} · month to date`;
  const [period, setPeriod] = useState(defaultPeriod);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const template = templates.data?.find((t) => t.id === selected);

  const onGenerated = useCallback(
    (r: GeneratedReport) => {
      recent.setData((list) => [r, ...list]);
      setSelected(r.type);
      setPeriod(r.period);
      toast({ title: "Report ready", description: `${r.name} · ${r.period}` });
    },
    [recent, toast],
  );

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/reports?share=${selected}`);
      toast({ title: "Share link copied", description: "Anyone with the link can view this report (view-only).", tone: "info" });
    } catch {
      toast({ title: "Couldn't copy the link", tone: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Client-ready reporting, generated from live data and shareable in one click."
        actions={
          <Button onClick={() => setGenOpen(true)} disabled={!templates.data?.length}>
            <Plus /> Generate report
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card as="section" aria-labelledby="tpl-h">
            <CardHeader titleId="tpl-h" title="Report templates" description="Choose a template to preview" />
            <div className="p-3">
              <AsyncView
                status={templates.status}
                data={templates.data}
                error={templates.error}
                onRetry={templates.reload}
                compact
                skeleton={
                  <div className="space-y-2 p-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-14 rounded-xl" />
                    ))}
                  </div>
                }
                empty={{ title: "No templates", icon: FileChartColumn }}
              >
                {(list) => (
                  <ul className="space-y-1" role="listbox" aria-label="Report templates">
                    {list.map((t) => {
                      const active = t.id === selected;
                      return (
                        <li key={t.id} role="option" aria-selected={active}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelected(t.id);
                              setPeriod(defaultPeriod);
                            }}
                            className={cn("relative flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors", active ? "bg-surface-2" : "hover:bg-surface-2/60")}
                          >
                            {active && <motion.span layoutId="tpl-active" className="absolute inset-y-3 left-0 w-[3px] rounded-full bg-accent" />}
                            <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", active ? "bg-brand text-brand-fg shadow-brand" : "bg-surface-3 text-muted")}>
                              <FileChartColumn className="size-4" aria-hidden />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-[13.5px] font-medium text-fg">{t.name}</span>
                              <span className="mt-0.5 block text-[12px] leading-snug text-muted">{t.description}</span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </AsyncView>
            </div>
          </Card>

          <Card as="section" aria-labelledby="recent-h">
            <CardHeader titleId="recent-h" title="Recent reports" />
            <div className="px-3 pt-2 pb-3">
              <AsyncView
                status={recent.status}
                data={recent.data}
                error={recent.error}
                onRetry={recent.reload}
                compact
                skeleton={<Skeleton className="m-2 h-40 rounded-xl" />}
                empty={{ title: "No reports yet", description: "Generate your first report to see it here." }}
              >
                {(list) => (
                  <ul className="divide-y divide-line">
                    {list.map((r) => (
                      <li key={r.id} className="flex items-center gap-3 px-2 py-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium text-fg">{r.name}</p>
                          <p className="text-[11.5px] text-muted">
                            {r.period} · {r.status === "scheduled" ? `sends ${formatDate(r.createdAt)}` : formatRelative(r.createdAt)} {r.status === "ready" && `· ${r.size}`}
                          </p>
                        </div>
                        <Badge tone={statusTone[r.status]}>{r.status === "ready" ? "Ready" : r.status === "scheduled" ? "Scheduled" : "Generating"}</Badge>
                        {r.status === "ready" && (
                          <Tooltip content="Preview">
                            <button
                              type="button"
                              onClick={() => {
                                setSelected(r.type);
                                setPeriod(r.period);
                              }}
                              aria-label={`Preview ${r.name}, ${r.period}`}
                              className="grid size-8 place-items-center rounded-lg text-subtle transition-colors hover:bg-surface-2 hover:text-fg"
                            >
                              <Eye className="size-4" />
                            </button>
                          </Tooltip>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </AsyncView>
            </div>
          </Card>

          <Card as="section" aria-labelledby="sched-h">
            <CardHeader titleId="sched-h" title="Scheduled delivery" description={`Sent automatically to ${currentUser.email}`} />
            <ul className="space-y-3 px-5 pt-4 pb-5">
              {[
                { id: "monthly" as const, label: "Monthly performance", when: "1st of every month, 8:00" },
                { id: "seo" as const, label: "SEO & GEO", when: "Every other Monday" },
                { id: "campaign" as const, label: "Campaign summary", when: "Every Friday, 16:00" },
              ].map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-medium text-fg">{s.label}</p>
                    <p className="flex items-center gap-1 text-[11.5px] text-muted">
                      <CalendarClock className="size-3" aria-hidden /> {s.when}
                    </p>
                  </div>
                  <Switch
                    label={`Schedule ${s.label} report`}
                    checked={schedules[s.id]}
                    onCheckedChange={(v) => {
                      setSchedules((x) => ({ ...x, [s.id]: v }));
                      toast({ title: v ? "Schedule on" : "Schedule paused", description: `${s.label} report`, tone: "info" });
                    }}
                  />
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <section aria-label="Report preview" className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[13.5px] font-semibold text-fg">Preview</p>
              <p className="text-[12px] text-muted">Exactly what your stakeholders receive</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={share} disabled={!template}>
                <Link2 /> Share link
              </Button>
              <Button variant="secondary" size="sm" onClick={() => window.print()} disabled={!template} className="hidden sm:inline-flex">
                <Printer /> Print
              </Button>
              <Button size="sm" onClick={() => window.print()} disabled={!template}>
                <Download /> Download PDF
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-surface-3/60 p-3 sm:p-8">
            {templates.status === "loading" ? (
              <Skeleton className="mx-auto aspect-[1/1.3] w-full max-w-[760px] rounded-sm" />
            ) : template ? (
              <div key={`${template.id}-${period}`} className="animate-[rise_550ms_cubic-bezier(0.16,1,0.3,1)_backwards]">
                <ReportPreview template={template} period={period} />
              </div>
            ) : (
              <p className="py-24 text-center text-[13px] text-muted">Select a template to preview it.</p>
            )}
          </div>
          <p className="mt-2 text-center text-[11.5px] text-subtle">“Download PDF” opens your browser’s print dialog. Choose “Save as PDF”.</p>
        </section>
      </div>

      {mounted && template && createPortal(<div className="print-root"><ReportPreview template={template} period={period} /></div>, document.body)}

      {templates.data && templates.data.length > 0 && (
        <GenerateReportDialog open={genOpen} onOpenChange={setGenOpen} templates={templates.data} initialType={selected} onGenerated={onGenerated} />
      )}
    </div>
  );
}
