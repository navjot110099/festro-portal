"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, FileChartColumn } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Modal } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/feedback";
import { Field, Input, NativeSelect } from "@/components/ui/input";
import { currentUser } from "@/data/user";
import { cn, uid } from "@/lib/utils";
import type { GeneratedReport, ReportTemplate, ReportType } from "@/types";

const periods = ["This month", "Last month", "Last 90 days", "Quarter to date", "Year to date"];
const steps = ["Collecting data from 7 sources", "Writing the executive summary", "Rendering charts and tables", "Formatting for delivery"];

export function GenerateReportDialog({
  open,
  onOpenChange,
  templates,
  initialType,
  onGenerated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  templates: ReportTemplate[];
  initialType: ReportType;
  onGenerated: (r: GeneratedReport) => void;
}) {
  const ids = { type: useId(), period: useId(), to: useId() };
  const [type, setType] = useState<ReportType>(initialType);
  const [period, setPeriod] = useState(periods[0]);
  const [recipients, setRecipients] = useState(currentUser.email);
  const [sections, setSections] = useState<string[]>([]);
  const [phase, setPhase] = useState<"form" | "running" | "done">("form");
  const [step, setStep] = useState(0);
  const template = templates.find((t) => t.id === type) ?? templates[0];

  const change = (v: boolean) => {
    if (v) {
      setType(initialType);
      setSections(templates.find((t) => t.id === initialType)?.sections ?? []);
      setPhase("form");
      setStep(0);
    }
    onOpenChange(v);
  };

  useEffect(() => {
    if (phase !== "running") return;
    if (step >= steps.length) {
      const t = window.setTimeout(() => {
        setPhase("done");
        onGenerated({ id: uid("rp"), type, name: template.name, period, createdAt: new Date().toISOString(), status: "ready", size: `${(1 + sections.length * 0.3).toFixed(1)} MB` });
      }, 300);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setStep((s) => s + 1), 700);
    return () => window.clearTimeout(t);
  }, [phase, step, onGenerated, type, template.name, period, sections.length]);

  return (
    <Modal
      open={open}
      onOpenChange={(v) => phase !== "running" && change(v)}
      title="Generate a report"
      description="Built from live workspace data and ready to share with stakeholders."
      footer={
        phase === "form" ? (
          <>
            <Button variant="ghost" onClick={() => change(false)}>
              Cancel
            </Button>
            <Button type="submit" form="gen-report" disabled={sections.length === 0}>
              <FileChartColumn /> Generate report
            </Button>
          </>
        ) : phase === "done" ? (
          <Button onClick={() => change(false)}>View report</Button>
        ) : undefined
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {phase === "form" ? (
          <motion.form
            key="form"
            id="gen-report"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={(e) => {
              e.preventDefault();
              setStep(0);
              setPhase("running");
            }}
            className="space-y-4 pt-1"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Report" htmlFor={ids.type}>
                <NativeSelect
                  id={ids.type}
                  value={type}
                  onChange={(e) => {
                    const next = e.target.value as ReportType;
                    setType(next);
                    setSections(templates.find((t) => t.id === next)?.sections ?? []);
                  }}
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field label="Period" htmlFor={ids.period}>
                <NativeSelect id={ids.period} value={period} onChange={(e) => setPeriod(e.target.value)}>
                  {periods.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </NativeSelect>
              </Field>
            </div>
            <fieldset>
              <legend className="mb-2 text-[12.5px] font-medium text-fg-2">Sections</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {template.sections.map((s) => {
                  const checked = sections.includes(s);
                  return (
                    <label key={s} className={cn("flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-[13px] transition-colors", checked ? "border-accent/30 bg-accent-soft text-fg" : "border-line text-fg-2 hover:bg-surface-2")}>
                      <Checkbox checked={checked} onChange={() => setSections((xs) => (checked ? xs.filter((x) => x !== s) : [...xs, s]))} />
                      {s}
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <Field label="Send to" htmlFor={ids.to} hint="Separate addresses with commas. Recipients get a secure, view-only link.">
              <Input id={ids.to} value={recipients} onChange={(e) => setRecipients(e.target.value)} />
            </Field>
          </motion.form>
        ) : (
          <motion.div key="run" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 py-2" role="status" aria-live="polite">
            {steps.map((s, i) => (
              <div key={s} className={cn("flex items-center gap-3 text-[13.5px] transition-opacity", i > step && "opacity-40")}>
                <span className="grid size-6 place-items-center rounded-full border border-line bg-surface-2">
                  {i < step || phase === "done" ? <Check className="size-3.5 text-success" /> : i === step ? <Spinner className="size-3 border-[1.5px] text-accent" /> : null}
                </span>
                <span className={i <= step ? "text-fg" : "text-muted"}>{s}</span>
              </div>
            ))}
            {phase === "done" && (
              <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-xl bg-success-soft p-3 text-[13px] text-fg-2">
                <span className="font-semibold text-success">{template.name}</span> for {period.toLowerCase()} is ready and was shared with {recipients.split(",")[0]}.
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
