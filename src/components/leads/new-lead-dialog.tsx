"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { Field, Input, NativeSelect } from "@/components/ui/input";
import { leadSourcesList } from "@/data/leads";
import { team } from "@/data/user";
import { sleep, uid } from "@/lib/utils";
import type { Lead, LeadSource } from "@/types";

const empty = { name: "", company: "", email: "", source: "Referral" as LeadSource, value: "", assignedTo: "tm_priya", interest: "Team headshots" };

export function NewLeadDialog({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (v: boolean) => void; onCreate: (lead: Lead) => void }) {
  const ids = { name: useId(), company: useId(), email: useId(), source: useId(), value: useId(), owner: useId(), interest: useId() };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof empty, string>>>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof typeof empty>(k: K, v: (typeof empty)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const change = (v: boolean) => {
    if (v) {
      setForm(empty);
      setErrors({});
    }
    onOpenChange(v);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.company.trim()) errs.company = "Company is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email.";
    if (form.value && Number.isNaN(Number(form.value))) errs.value = "Use a number, e.g. 1200.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    await sleep(500);
    const now = new Date().toISOString();
    const initials = form.name
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    onCreate({
      id: uid("lead"),
      name: form.name.trim(),
      initials,
      title: "Contact",
      company: form.company.trim(),
      email: form.email.trim(),
      phone: "—",
      location: "—",
      source: form.source,
      campaign: "Manual entry",
      status: "new",
      score: 60,
      value: Number(form.value) || 0,
      assignedTo: form.assignedTo,
      lastActivity: now,
      createdAt: now,
      interest: form.interest,
      insight: "New lead. Festro AI will score intent once activity is recorded.",
      activity: [{ id: uid("act"), type: "created", title: "Lead created manually", at: now, by: "Deep" }],
    });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={change}
      title="Add a lead"
      description="Add a contact to the pipeline. They'll be scored automatically."
      footer={
        <>
          <Button variant="ghost" onClick={() => change(false)}>
            Cancel
          </Button>
          <Button type="submit" form="new-lead-form" loading={saving}>
            Add lead
          </Button>
        </>
      }
    >
      <form id="new-lead-form" onSubmit={submit} noValidate className="grid gap-4 pt-1 sm:grid-cols-2">
        <Field label="Full name" htmlFor={ids.name} error={errors.name}>
          <Input id={ids.name} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Alex Morgan" aria-invalid={!!errors.name || undefined} autoFocus />
        </Field>
        <Field label="Company" htmlFor={ids.company} error={errors.company}>
          <Input id={ids.company} value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Northwind Co." aria-invalid={!!errors.company || undefined} />
        </Field>
        <Field label="Email" htmlFor={ids.email} error={errors.email} className="sm:col-span-2">
          <Input id={ids.email} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="alex@northwind.com" aria-invalid={!!errors.email || undefined} />
        </Field>
        <Field label="Source" htmlFor={ids.source}>
          <NativeSelect id={ids.source} value={form.source} onChange={(e) => set("source", e.target.value as LeadSource)}>
            {leadSourcesList.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Estimated value (USD)" htmlFor={ids.value} error={errors.value}>
          <Input id={ids.value} inputMode="numeric" value={form.value} onChange={(e) => set("value", e.target.value)} placeholder="1,200" aria-invalid={!!errors.value || undefined} />
        </Field>
        <Field label="Interested in" htmlFor={ids.interest}>
          <Input id={ids.interest} value={form.interest} onChange={(e) => set("interest", e.target.value)} />
        </Field>
        <Field label="Owner" htmlFor={ids.owner}>
          <NativeSelect id={ids.owner} value={form.assignedTo} onChange={(e) => set("assignedTo", e.target.value)}>
            {team.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </NativeSelect>
        </Field>
      </form>
    </Modal>
  );
}
