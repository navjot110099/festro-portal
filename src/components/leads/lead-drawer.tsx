"use client";

import { motion } from "framer-motion";
import { CalendarPlus, FileText, Mail, MapPin, MessageSquare, Phone, PhoneCall, Sparkles, UserRound, Video } from "lucide-react";
import { useId, useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/dialog";
import { NativeSelect, Textarea } from "@/components/ui/input";
import { leadStatuses } from "@/data/leads";
import { getMember, team } from "@/data/user";
import { formatCurrency, formatDateLong, formatRelative } from "@/lib/format";
import { cn, uid } from "@/lib/utils";
import type { Lead, LeadActivity, LeadStatus } from "@/types";
import { LeadScore, LeadStatusBadge, scoreBand, SourceLabel } from "./lead-ui";

const activityIcon: Record<LeadActivity["type"], React.ElementType> = {
  created: UserRound,
  email: Mail,
  call: PhoneCall,
  meeting: Video,
  note: MessageSquare,
  status: Sparkles,
  visit: FileText,
  form: FileText,
};

export function LeadDrawer({
  lead,
  open,
  onOpenChange,
  onUpdate,
}: {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpdate: (lead: Lead) => void;
}) {
  const toast = useToast();
  const ids = { status: useId(), owner: useId(), note: useId() };
  const [note, setNote] = useState("");

  if (!lead) return null;

  const owner = getMember(lead.assignedTo);
  const band = scoreBand(lead.score);

  const setStatus = (status: LeadStatus) => {
    const label = leadStatuses.find((s) => s.id === status)?.label ?? status;
    onUpdate({
      ...lead,
      status,
      lastActivity: new Date().toISOString(),
      activity: [{ id: uid("act"), type: "status", title: `Status changed to ${label}`, at: new Date().toISOString(), by: "Deep" }, ...lead.activity],
    });
    toast({ title: "Lead updated", description: `${lead.name} is now ${label.toLowerCase()}.` });
  };

  const setOwner = (id: string) => {
    onUpdate({ ...lead, assignedTo: id });
    toast({ title: "Lead reassigned", description: `${getMember(id)?.name} now owns ${lead.name}.` });
  };

  const addNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    onUpdate({
      ...lead,
      lastActivity: new Date().toISOString(),
      activity: [{ id: uid("act"), type: "note", title: "Note added", detail: note.trim(), at: new Date().toISOString(), by: "Deep" }, ...lead.activity],
    });
    setNote("");
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={lead.name}
      description={`${lead.title} · ${lead.company}`}
      footer={
        <>
          <Button asChild variant="secondary" className="flex-1 sm:flex-none">
            <a href={`mailto:${lead.email}`}>
              <Mail /> Email
            </a>
          </Button>
          <Button
            variant="secondary"
            className="flex-1 sm:flex-none"
            onClick={() => toast({ title: "Call scheduled", description: `Discovery call with ${lead.name} added for tomorrow, 10:00.` })}
          >
            <CalendarPlus /> Schedule call
          </Button>
          <Button className="w-full sm:ml-auto sm:w-auto" onClick={() => setStatus(lead.status === "proposal" ? "converted" : "proposal")} disabled={lead.status === "converted"}>
            {lead.status === "proposal" ? "Mark as converted" : lead.status === "converted" ? "Converted" : "Send proposal"}
          </Button>
        </>
      }
    >
      <div className="space-y-6 px-6 py-5">
        <div className="flex items-center gap-4">
          <Avatar initials={lead.initials} hue={(lead.name.charCodeAt(0) * 37) % 360} size="xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <LeadStatusBadge status={lead.status} />
              <span className={cn("text-[12px] font-medium", band.tone)}>{band.label} lead</span>
            </div>
            <p className="mt-2 text-[24px] leading-none font-semibold tracking-[-0.03em] text-fg">{formatCurrency(lead.value)}</p>
            <p className="mt-1 text-[12.5px] text-muted">Estimated value · {lead.interest}</p>
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-[11.5px] text-subtle">Lead score</p>
            <LeadScore score={lead.score} className="mt-1" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-accent/15 bg-accent-soft p-3.5"
        >
          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-accent-ink">
            <Sparkles className="size-3.5" aria-hidden /> FadHype AI insight
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-fg-2">{lead.insight}</p>
        </motion.div>

        <dl className="grid grid-cols-1 gap-x-6 gap-y-3.5 text-[13px] sm:grid-cols-2">
          {[
            { k: "Email", v: <a href={`mailto:${lead.email}`} className="text-fg hover:underline">{lead.email}</a>, icon: Mail },
            { k: "Phone", v: lead.phone, icon: Phone },
            { k: "Location", v: lead.location, icon: MapPin },
            { k: "Source", v: <SourceLabel source={lead.source} />, icon: Sparkles },
            { k: "Campaign", v: lead.campaign, icon: FileText },
            { k: "Created", v: formatDateLong(lead.createdAt), icon: CalendarPlus },
          ].map((row) => (
            <div key={row.k} className="min-w-0">
              <dt className="flex items-center gap-1.5 text-[11.5px] text-subtle">
                <row.icon className="size-3" aria-hidden /> {row.k}
              </dt>
              <dd className="mt-0.5 truncate text-fg-2">{row.v}</dd>
            </div>
          ))}
        </dl>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor={ids.status} className="text-[12px] font-medium text-fg-2">
              Stage
            </label>
            <NativeSelect id={ids.status} value={lead.status} onChange={(e) => setStatus(e.target.value as LeadStatus)}>
              {leadStatuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="space-y-1.5">
            <label htmlFor={ids.owner} className="text-[12px] font-medium text-fg-2">
              Owner
            </label>
            <NativeSelect id={ids.owner} value={lead.assignedTo} onChange={(e) => setOwner(e.target.value)}>
              {team.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} · {m.role}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>

        <section aria-labelledby="timeline-h">
          <div className="mb-3 flex items-center justify-between">
            <h3 id="timeline-h" className="text-[13.5px] font-semibold text-fg">
              Timeline
            </h3>
            {owner && (
              <span className="flex items-center gap-1.5 text-[12px] text-muted">
                <Avatar initials={owner.initials} hue={owner.hue} size="xs" /> {owner.name}
              </span>
            )}
          </div>
          <form onSubmit={addNote} className="mb-4">
            <label htmlFor={ids.note} className="sr-only">
              Add a note
            </label>
            <Textarea id={ids.note} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note for the team…" className="min-h-20" />
            <div className="mt-2 flex justify-end">
              <Button type="submit" size="sm" variant="secondary" disabled={!note.trim()}>
                Add note
              </Button>
            </div>
          </form>
          <ol className="relative space-y-4 before:absolute before:top-1 before:bottom-1 before:left-[13px] before:w-px before:bg-line">
            {lead.activity.map((a) => {
              const Icon = activityIcon[a.type];
              return (
                <motion.li key={a.id} layout initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="relative flex gap-3">
                  <span className="relative z-10 grid size-7 shrink-0 place-items-center rounded-full border border-line bg-surface text-muted">
                    <Icon className="size-3.5" aria-hidden />
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-[13px] font-medium text-fg">{a.title}</p>
                    {a.detail && <p className="mt-0.5 text-[12.5px] text-muted">{a.detail}</p>}
                    <p className="mt-0.5 text-[11.5px] text-subtle">
                      {formatRelative(a.at)}
                      {a.by ? ` · ${a.by}` : ""}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </section>
      </div>
    </Drawer>
  );
}
