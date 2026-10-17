"use client";

import { Check, ListChecks, MessageSquare } from "lucide-react";
import { useId, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/feedback";
import { Field, Input, NativeSelect, Textarea } from "@/components/ui/input";
import { priorityMeta, taskColumns } from "@/data/tasks";
import { getMember, team } from "@/data/user";
import { formatDateLong } from "@/lib/format";
import { uid } from "@/lib/utils";
import type { Task, TaskPriority, TaskStatus } from "@/types";
import { dueLabel, priorityTone } from "./task-card";

const tags: Task["tag"][] = ["SEO", "Paid Media", "Content", "Reporting", "Web", "CRM", "Automation"];

export function TaskDetailDialog({ task, open, onOpenChange, onMove }: { task: Task | null; open: boolean; onOpenChange: (v: boolean) => void; onMove: (t: Task, s: TaskStatus) => void }) {
  const id = useId();
  if (!task) return null;
  const due = dueLabel(task.due, task.status);
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={task.title}
      description={`${task.tag} · due ${formatDateLong(task.due)}`}
      footer={
        task.status === "review" ? (
          <>
            <Button variant="ghost" onClick={() => {
                onMove(task, "in-progress");
                onOpenChange(false);
              }}>
              Request changes
            </Button>
            <Button onClick={() => {
                onMove(task, "done");
                onOpenChange(false);
              }}>
              <Check /> Approve
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        )
      }
    >
      <div className="space-y-5 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={priorityTone[task.priority]}>{priorityMeta[task.priority].label} priority</Badge>
          <Badge tone="neutral">{task.tag}</Badge>
          <span className={`text-[12px] font-medium ${due.tone}`}>{due.text}</span>
        </div>
        {task.description && <p className="text-[13.5px] leading-relaxed text-fg-2">{task.description}</p>}
        <div>
          <div className="mb-1.5 flex justify-between text-[12.5px]">
            <span className="flex items-center gap-1.5 text-muted">
              <ListChecks className="size-3.5" aria-hidden /> {task.subtasks.done} of {task.subtasks.total} subtasks
            </span>
            <span className="font-medium text-fg tabular">{Math.round(task.progress * 100)}%</span>
          </div>
          <Progress value={task.progress} label="Task progress" tone={task.status === "done" ? "success" : "brand"} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-[12px] font-medium text-fg-2">Assignees</p>
            <ul className="space-y-2">
              {task.assignees.map((a) => {
                const m = getMember(a);
                return m ? (
                  <li key={a} className="flex items-center gap-2 text-[13px] text-fg-2">
                    <Avatar initials={m.initials} hue={m.hue} size="sm" /> {m.name} <span className="text-[11.5px] text-subtle">· {m.role}</span>
                  </li>
                ) : null;
              })}
            </ul>
          </div>
          <div className="space-y-1.5">
            <label htmlFor={id} className="text-[12px] font-medium text-fg-2">
              Status
            </label>
            <NativeSelect id={id} value={task.status} onChange={(e) => onMove(task, e.target.value as TaskStatus)}>
              {taskColumns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>
        <p className="flex items-center gap-1.5 text-[12px] text-subtle">
          <MessageSquare className="size-3.5" aria-hidden /> {task.comments} comments from the team
        </p>
      </div>
    </Modal>
  );
}

export function NewTaskDialog({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (v: boolean) => void; onCreate: (t: Task) => void }) {
  const ids = { title: useId(), desc: useId(), tag: useId(), priority: useId(), owner: useId(), due: useId() };
  const defaultDue = () => new Date(Date.now() + 5 * 86_400_000).toISOString().slice(0, 10);
  const [form, setForm] = useState({ title: "", description: "", tag: "SEO" as Task["tag"], priority: "medium" as TaskPriority, owner: "tm_aanya", due: "" });
  const [error, setError] = useState<string | null>(null);

  const change = (v: boolean) => {
    if (v) {
      setForm({ title: "", description: "", tag: "SEO", priority: "medium", owner: "tm_aanya", due: defaultDue() });
      setError(null);
    }
    onOpenChange(v);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Give the task a title.");
      return;
    }
    onCreate({
      id: uid("task"),
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      status: "todo",
      priority: form.priority,
      tag: form.tag,
      assignees: [form.owner],
      due: new Date(`${form.due || defaultDue()}T12:00:00`).toISOString(),
      progress: 0,
      subtasks: { done: 0, total: 1 },
      comments: 0,
    });
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={change}
      title="New task"
      description="Add work to the board. Your FadHype team is notified automatically."
      footer={
        <>
          <Button variant="ghost" onClick={() => change(false)}>
            Cancel
          </Button>
          <Button type="submit" form="new-task-form">
            Create task
          </Button>
        </>
      }
    >
      <form id="new-task-form" onSubmit={submit} noValidate className="grid gap-4 pt-1 sm:grid-cols-2">
        <Field label="Title" htmlFor={ids.title} error={error ?? undefined} className="sm:col-span-2">
          <Input
            id={ids.title}
            value={form.title}
            autoFocus
            onChange={(e) => {
              setForm((f) => ({ ...f, title: e.target.value }));
              setError(null);
            }}
            placeholder="e.g. Refresh Reels creative"
            aria-invalid={!!error || undefined}
          />
        </Field>
        <Field label="Description" htmlFor={ids.desc} className="sm:col-span-2">
          <Textarea id={ids.desc} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="What does done look like?" className="min-h-20" />
        </Field>
        <Field label="Category" htmlFor={ids.tag}>
          <NativeSelect id={ids.tag} value={form.tag} onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value as Task["tag"] }))}>
            {tags.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Priority" htmlFor={ids.priority}>
          <NativeSelect id={ids.priority} value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))}>
            {(Object.keys(priorityMeta) as TaskPriority[]).map((p) => (
              <option key={p} value={p}>
                {priorityMeta[p].label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Assignee" htmlFor={ids.owner}>
          <NativeSelect id={ids.owner} value={form.owner} onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}>
            {team.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Due date" htmlFor={ids.due}>
          <Input id={ids.due} type="date" value={form.due} onChange={(e) => setForm((f) => ({ ...f, due: e.target.value }))} />
        </Field>
      </form>
    </Modal>
  );
}
