"use client";

import { ArrowUpRight, BriefcaseBusiness, Check, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { ProjectThumbnail } from "@/components/projects/project-thumbnail";
import { AsyncView } from "@/components/shared/async-view";
import { PageHeader } from "@/components/shared/page-header";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/feedback";
import { NativeSelect } from "@/components/ui/input";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Project, ProjectStatus } from "@/types";

const statusMeta: Record<ProjectStatus, { label: string; tone: BadgeTone }> = {
  live: { label: "Live", tone: "success" },
  "in-progress": { label: "In progress", tone: "info" },
  completed: { label: "Completed", tone: "outline" },
};

function ProjectCard({ project, index, onOpen }: { project: Project; index: number; onOpen: () => void }) {
  return (
    <li className="animate-[rise_550ms_cubic-bezier(0.16,1,0.3,1)_backwards]" style={{ animationDelay: `${index * 50}ms` }}>
      <Card as="article" interactive className="group h-full overflow-hidden">
        <button type="button" onClick={onOpen} className="flex h-full w-full flex-col text-left focus-visible:outline-offset-[-2px]" aria-label={`Open ${project.name} case study`}>
          <div className="relative">
            <ProjectThumbnail project={project} />
            <div className="absolute top-3 left-3">
              <Badge tone={statusMeta[project.status].tone} dot className="bg-surface/90 backdrop-blur">
                {statusMeta[project.status].label}
              </Badge>
            </div>
          </div>
          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[15.5px] font-semibold tracking-tight text-fg">
                  {project.name} <span className="font-normal text-muted">· {project.industry}</span>
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{project.summary}</p>
              </div>
              <ArrowUpRight className="size-4 shrink-0 text-subtle transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" aria-hidden />
            </div>
            <p className="mt-4 text-[22px] leading-tight font-semibold tracking-[-0.03em] text-fg">{project.headline}</p>
            <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3">
              {project.metrics.map((m) => (
                <div key={m.label} className="min-w-0">
                  <dt className="truncate text-[11px] text-subtle">{m.label}</dt>
                  <dd className="text-[14px] font-semibold text-fg-2">{m.value}</dd>
                </div>
              ))}
            </dl>
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Services provided">
              {project.services.map((s) => (
                <li key={s} className="rounded-md bg-surface-2 px-2 py-0.5 text-[11.5px] text-fg-2">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </button>
      </Card>
    </li>
  );
}

function CaseStudy({ project, open, onOpenChange }: { project: Project | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  if (!project) return null;
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={`${project.name} · ${project.industry}`} description={project.summary} size="xl">
      <div className="space-y-6 pt-1">
        <div className="overflow-hidden rounded-xl border border-line">
          <ProjectThumbnail project={project} large />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {project.metrics.map((m) => (
            <div key={m.label} className="rounded-xl border border-line bg-surface-2/50 p-4">
              <p className="text-[12px] text-muted">{m.label}</p>
              <p className="mt-1 text-[24px] font-semibold tracking-[-0.03em] text-fg">{m.value}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          <div className="space-y-5 md:col-span-3">
            <section>
              <h3 className="text-[13px] font-semibold text-fg">The challenge</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-fg-2">{project.challenge}</p>
            </section>
            <section>
              <h3 className="text-[13px] font-semibold text-fg">What we did</h3>
              <ul className="mt-2 space-y-2">
                {project.approach.map((a) => (
                  <li key={a} className="flex items-start gap-2 text-[13.5px] text-fg-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden /> {a}
                  </li>
                ))}
              </ul>
            </section>
          </div>
          <aside className="space-y-3 rounded-xl bg-surface-2/60 p-4 md:col-span-2">
            <div>
              <p className="text-[11.5px] text-subtle">Status</p>
              <Badge tone={statusMeta[project.status].tone} dot className="mt-1">
                {statusMeta[project.status].label}
              </Badge>
            </div>
            <div>
              <p className="text-[11.5px] text-subtle">Timeline</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[13px] font-medium text-fg">
                <Clock className="size-3.5 text-muted" aria-hidden /> {project.duration} · {project.year}
              </p>
            </div>
            <div>
              <p className="text-[11.5px] text-subtle">Services</p>
              <ul className="mt-1 flex flex-wrap gap-1.5">
                {project.services.map((s) => (
                  <li key={s} className="rounded-md border border-line bg-surface px-2 py-0.5 text-[11.5px] text-fg-2">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </Modal>
  );
}

export function ProjectsView() {
  const res = useResource(() => api.projects.list());
  const [industry, setIndustry] = useState("all");
  const [status, setStatus] = useState<"all" | ProjectStatus>("all");
  const [selected, setSelected] = useState<Project | null>(null);
  const [open, setOpen] = useState(false);

  const industries = useMemo(() => [...new Set((res.data ?? []).map((p) => p.industry))], [res.data]);
  const filtered = (res.data ?? []).filter((p) => (industry === "all" || p.industry === industry) && (status === "all" || p.status === status));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Selected work from the Festro studio: what we built, and what it returned."
        actions={
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <NativeSelect aria-label="Filter by industry" value={industry} onChange={(e) => setIndustry(e.target.value)} className="sm:w-44">
              <option value="all">All industries</option>
              {industries.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </NativeSelect>
            <NativeSelect aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value as "all" | ProjectStatus)} className="sm:w-36">
              <option value="all">Any status</option>
              <option value="live">Live</option>
              <option value="in-progress">In progress</option>
              <option value="completed">Completed</option>
            </NativeSelect>
          </div>
        }
      />

      <AsyncView
        status={res.status}
        data={res.data}
        error={res.error}
        onRetry={res.reload}
        skeleton={
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[16/10] rounded-none" />
                <div className="space-y-2 p-5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="mt-4 h-6 w-48" />
                </div>
              </Card>
            ))}
          </div>
        }
        empty={{ title: "No projects yet", description: "Case studies appear here as engagements go live.", icon: BriefcaseBusiness }}
      >
        {() =>
          filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-sm font-medium text-fg">No projects match these filters</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIndustry("all");
                  setStatus("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <ul className={cn("grid gap-5 md:grid-cols-2 xl:grid-cols-3")}>
              {filtered.map((p, i) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  index={i}
                  onOpen={() => {
                    setSelected(p);
                    setOpen(true);
                  }}
                />
              ))}
            </ul>
          )
        }
      </AsyncView>

      <CaseStudy project={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}
