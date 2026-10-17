"use client";

import { ArrowRight, CalendarDays, Check, Layers, MessageSquare } from "lucide-react";
import { useMemo, useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { AsyncView } from "@/components/shared/async-view";
import { PageHeader, SectionTitle } from "@/components/shared/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/feedback";
import { DataIcon } from "@/components/ui/icon";
import { Segmented } from "@/components/ui/segmented";
import { accountManager, currentUser } from "@/data/user";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Service, ServiceCategory, ServiceStatus } from "@/types";

const statusMeta: Record<ServiceStatus, { label: string; tone: BadgeTone; cta: string }> = {
  active: { label: "Active", tone: "success", cta: "Manage" },
  onboarding: { label: "Onboarding", tone: "info", cta: "View onboarding" },
  recommended: { label: "Recommended", tone: "brand", cta: "See proposal" },
  available: { label: "Available", tone: "outline", cta: "Explore" },
};

function ServiceCard({ service, index, onOpen, featured }: { service: Service; index: number; onOpen: (s: Service) => void; featured?: boolean }) {
  const meta = statusMeta[service.status];
  return (
    <div className="h-full animate-[rise_550ms_cubic-bezier(0.16,1,0.3,1)_backwards]" style={{ animationDelay: `${index * 40}ms` }}>
      <Card
        interactive
        className={cn(
          "group flex h-full flex-col p-5",
          service.status === "recommended" && "border-accent/25 bg-[linear-gradient(160deg,var(--accent-soft),transparent_55%)] bg-surface",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "grid size-11 place-items-center rounded-xl border transition-all duration-300",
              service.status === "active" || service.status === "onboarding"
                ? "border-transparent bg-brand text-brand-fg shadow-brand group-hover:scale-105"
                : "border-line bg-surface-2 text-fg-2 group-hover:border-accent/30 group-hover:text-accent-ink",
            )}
          >
            <DataIcon name={service.icon} className="size-5" />
          </span>
          <Badge tone={meta.tone} dot={service.status === "active" || service.status === "onboarding"}>
            {meta.label}
          </Badge>
        </div>
        <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-fg">{service.name}</h3>
        <p className="mt-1 flex-1 text-[13px] leading-relaxed text-muted">{service.description}</p>
        <div className={cn("mt-4 flex items-end justify-between gap-3 border-t border-line pt-4", featured && "pt-4")}>
          <div>
            <p className="text-[11.5px] text-subtle">{service.metric.label}</p>
            <p className="text-[18px] font-semibold tracking-tight text-fg">{service.metric.value}</p>
          </div>
          <Button variant={service.status === "recommended" ? "primary" : "secondary"} size="sm" onClick={() => onOpen(service)} aria-label={`${meta.cta}: ${service.name}`}>
            {meta.cta} <ArrowRight />
          </Button>
        </div>
      </Card>
    </div>
  );
}

function ServiceDialog({ service, open, onOpenChange }: { service: Service | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const toast = useToast();
  if (!service) return null;
  const inPlan = service.status === "active" || service.status === "onboarding";
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={service.name}
      description={service.description}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {inPlan ? (
            <Button
              onClick={() => {
                onOpenChange(false);
                toast({ title: "Message sent to your team", description: `${accountManager.name} will reply about ${service.name} shortly.`, tone: "info" });
              }}
            >
              <MessageSquare /> Message the team
            </Button>
          ) : (
            <Button
              onClick={() => {
                onOpenChange(false);
                toast({ title: "Proposal requested", description: `A ${service.name} proposal will be in Reports within 2 business days.` });
              }}
            >
              <CalendarDays /> Request proposal
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-5 pt-1">
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-2/70 p-3.5">
          <span className="grid size-10 place-items-center rounded-xl bg-brand text-brand-fg shadow-brand">
            <DataIcon name={service.icon} className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-muted">{service.metric.label}</p>
            <p className="text-[17px] font-semibold text-fg">{service.metric.value}</p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-muted">{inPlan ? "Status" : "Starting at"}</p>
            <p className="text-[14px] font-semibold text-fg">{inPlan ? statusMeta[service.status].label : (service.startingAt ?? "Custom")}</p>
          </div>
        </div>
        <div>
          <p className="mb-2.5 text-[12.5px] font-semibold text-fg">What’s included</p>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {service.deliverables.map((d) => (
              <li key={d} className="flex items-start gap-2 text-[13px] text-fg-2">
                <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden /> {d}
              </li>
            ))}
          </ul>
        </div>
        {service.status === "recommended" && (
          <p className="rounded-xl border border-accent/15 bg-accent-soft p-3.5 text-[13px] leading-relaxed text-fg-2">
            <span className="font-semibold text-accent-ink">Why we recommend it: </span>
            your traffic and lead volume are now high enough that small improvements in conversion compound quickly. FadHype AI projects {service.metric.value} from this service.
          </p>
        )}
      </div>
    </Modal>
  );
}

export function ServicesView() {
  const res = useResource(() => api.services.list());
  const [category, setCategory] = useState<"all" | ServiceCategory>("all");
  const [selected, setSelected] = useState<Service | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => (res.data ?? []).filter((s) => category === "all" || s.category === category), [res.data, category]);
  const inPlan = filtered.filter((s) => s.status === "active" || s.status === "onboarding");
  const recommended = filtered.filter((s) => s.status === "recommended");
  const available = filtered.filter((s) => s.status === "available");
  const counts = {
    active: res.data?.filter((s) => s.status === "active").length ?? 0,
    onboarding: res.data?.filter((s) => s.status === "onboarding").length ?? 0,
  };

  const openService = (s: Service) => {
    setSelected(s);
    setOpen(true);
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Services" description="Your FadHype growth stack: what's running, what's next, and what it's delivering." />

      <Card className="overflow-hidden">
        <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(ellipse_at_right,var(--accent-soft),transparent_70%)]" aria-hidden />
          <div className="relative min-w-0 flex-1">
            <p className="text-[11.5px] font-semibold tracking-[0.08em] text-accent-ink uppercase">{currentUser.plan} plan</p>
            <p className="mt-1 text-[20px] font-semibold tracking-tight text-fg">
              {counts.active} services active{counts.onboarding ? `, ${counts.onboarding} onboarding` : ""}
            </p>
            <p className="mt-1 max-w-xl text-[13px] text-muted">
              One team across build, growth, optimisation and automation. Every service reports into this portal, so you can see what each one returns.
            </p>
          </div>
          <div className="relative flex items-center gap-3 rounded-xl border border-line bg-surface p-3 shadow-xs">
            <Avatar initials={accountManager.initials} hue={accountManager.hue} size="lg" />
            <div>
              <p className="text-[13px] font-semibold text-fg">{accountManager.name}</p>
              <p className="text-[12px] text-muted">{accountManager.role} · replies in ~12 min</p>
            </div>
          </div>
        </div>
      </Card>

      <Segmented
        label="Filter by category"
        value={category}
        onChange={setCategory}
        options={[
          { value: "all", label: "All" },
          { value: "Build", label: "Build" },
          { value: "Grow", label: "Grow" },
          { value: "Optimize", label: "Optimize" },
          { value: "Automate", label: "Automate" },
        ]}
      />

      <AsyncView
        status={res.status}
        data={res.data}
        error={res.error}
        onRetry={res.reload}
        skeleton={
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-5">
                <Skeleton className="size-11 rounded-xl" />
                <Skeleton className="mt-4 h-4 w-40" />
                <Skeleton className="mt-2 h-3 w-full" />
                <Skeleton className="mt-1.5 h-3 w-2/3" />
                <Skeleton className="mt-6 h-8 w-full" />
              </Card>
            ))}
          </div>
        }
        empty={{ title: "No services on this workspace", description: "Talk to your account manager to set up your plan.", icon: Layers }}
      >
        {() => (
          <div className="space-y-10">
            {inPlan.length > 0 && (
              <section aria-labelledby="svc-active">
                <SectionTitle id="svc-active" title="In your plan" description="Running now, with live performance" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {inPlan.map((s, i) => (
                    <ServiceCard key={s.id} service={s} index={i} onOpen={openService} featured />
                  ))}
                </div>
              </section>
            )}
            {recommended.length > 0 && (
              <section aria-labelledby="svc-rec">
                <SectionTitle id="svc-rec" title="Recommended for you" description="Based on your current data, these have the highest projected return" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {recommended.map((s, i) => (
                    <ServiceCard key={s.id} service={s} index={i} onOpen={openService} />
                  ))}
                </div>
              </section>
            )}
            {available.length > 0 && (
              <section aria-labelledby="svc-avail">
                <SectionTitle id="svc-avail" title="Expand your growth stack" description="Capabilities you can add at any time" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {available.map((s, i) => (
                    <ServiceCard key={s.id} service={s} index={i} onOpen={openService} />
                  ))}
                </div>
              </section>
            )}
            {filtered.length === 0 && <p className="py-10 text-center text-[13px] text-muted">No services in this category.</p>}
          </div>
        )}
      </AsyncView>

      <ServiceDialog service={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}
