"use client";

import { Columns3, List, Plus, SquareKanban } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { AsyncView } from "@/components/shared/async-view";
import { PageHeader } from "@/components/shared/page-header";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { dueLabel, priorityTone } from "@/components/tasks/task-card";
import { NewTaskDialog, TaskDetailDialog } from "@/components/tasks/task-dialogs";
import { Avatar, AvatarStack } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress, Skeleton } from "@/components/ui/feedback";
import { NativeSelect } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { Tooltip } from "@/components/ui/tooltip";
import { priorityMeta, taskColumns } from "@/data/tasks";
import { getMember, team } from "@/data/user";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/lib/api";
import { daysUntil } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Task, TaskPriority, TaskStatus } from "@/types";

export function TasksView() {
  const toast = useToast();
  const router = useRouter();
  const params = useSearchParams();
  const res = useResource(() => api.tasks.list());
  const [view, setView] = useState<"board" | "list">("board");
  const [assignee, setAssignee] = useState<string | null>(null);
  const [priority, setPriority] = useState<"all" | TaskPriority>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(params.get("new") === "1");

  const tasks = useMemo(
    () => (res.data ?? []).filter((t) => (!assignee || t.assignees.includes(assignee)) && (priority === "all" || t.priority === priority)),
    [res.data, assignee, priority],
  );
  const all = res.data ?? [];
  const stats = [
    { label: "Open tasks", value: all.filter((t) => t.status !== "done").length },
    { label: "Due this week", value: all.filter((t) => t.status !== "done" && daysUntil(t.due) <= 7 && daysUntil(t.due) >= 0).length },
    { label: "Awaiting your review", value: all.filter((t) => t.status === "review").length, highlight: true },
    { label: "Completed this cycle", value: all.filter((t) => t.status === "done").length },
  ];
  const selected = res.data?.find((t) => t.id === selectedId) ?? null;

  const move = (task: Task, status: TaskStatus) => {
    if (task.status === status) return;
    res.setData((list) =>
      list.map((t) =>
        t.id === task.id
          ? { ...t, status, progress: status === "done" ? 1 : status === "todo" ? Math.min(t.progress, 0.1) : Math.max(t.progress, status === "review" ? 0.9 : 0.15), subtasks: status === "done" ? { ...t.subtasks, done: t.subtasks.total } : t.subtasks }
          : t,
      ),
    );
    const col = taskColumns.find((c) => c.id === status)?.label;
    toast({ title: status === "done" ? "Task completed" : `Moved to ${col}`, description: task.title, tone: status === "done" ? "success" : "info" });
  };

  const openTask = (t: Task) => {
    setSelectedId(t.id);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Your delivery board: what your Festro team is working on, and what needs your approval."
        actions={
          <>
            <Segmented
              label="View"
              value={view}
              onChange={setView}
              options={[
                { value: "board", label: "Board", icon: <Columns3 /> },
                { value: "list", label: "List", icon: <List /> },
              ]}
            />
            <Button onClick={() => setNewOpen(true)}>
              <Plus /> New task
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className={cn("p-4", s.highlight && s.value > 0 && "border-warning/30")}>
            <p className="text-[12.5px] font-medium text-muted">{s.label}</p>
            {res.status === "loading" ? <Skeleton className="mt-2 h-6 w-10" /> : <p className="mt-1 text-[22px] font-semibold tracking-tight text-fg">{s.value}</p>}
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1" role="group" aria-label="Filter by assignee">
          {team.map((m) => {
            const on = assignee === m.id;
            return (
              <Tooltip key={m.id} content={m.name}>
                <button
                  type="button"
                  aria-pressed={on}
                  aria-label={`Show tasks for ${m.name}`}
                  onClick={() => setAssignee(on ? null : m.id)}
                  className={cn("rounded-full transition-all", on ? "ring-2 ring-accent ring-offset-2 ring-offset-bg" : assignee ? "opacity-45 hover:opacity-100" : "hover:-translate-y-0.5")}
                >
                  <Avatar initials={m.initials} hue={m.hue} size="sm" />
                </button>
              </Tooltip>
            );
          })}
        </div>
        <NativeSelect aria-label="Filter by priority" selectSize="sm" value={priority} onChange={(e) => setPriority(e.target.value as "all" | TaskPriority)} className="w-36">
          <option value="all">All priorities</option>
          {(Object.keys(priorityMeta) as TaskPriority[]).map((p) => (
            <option key={p} value={p}>
              {priorityMeta[p].label}
            </option>
          ))}
        </NativeSelect>
        {(assignee || priority !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setAssignee(null);
              setPriority("all");
            }}
          >
            Clear
          </Button>
        )}
        <p className="ml-auto hidden text-[12px] text-subtle md:block">Drag cards between columns, or use the ··· menu.</p>
      </div>

      <AsyncView
        status={res.status}
        data={res.data}
        error={res.error}
        onRetry={res.reload}
        skeleton={
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-2.5 rounded-2xl bg-surface-2/50 p-2.5">
                <Skeleton className="h-4 w-24" />
                {[0, 1, 2].map((j) => (
                  <Skeleton key={j} className="h-28 rounded-xl" />
                ))}
              </div>
            ))}
          </div>
        }
        empty={{
          title: "No tasks yet",
          description: "Create the first task, or ask Festro AI to turn recommendations into work.",
          icon: SquareKanban,
          action: (
            <Button size="sm" onClick={() => setNewOpen(true)}>
              <Plus /> New task
            </Button>
          ),
        }}
      >
        {() =>
          view === "board" ? (
            <KanbanBoard tasks={tasks} onMove={move} onOpen={openTask} />
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-[13px]">
                  <thead className="bg-surface-2/60 text-[11.5px] text-muted">
                    <tr>
                      {["Task", "Status", "Priority", "Assignee", "Due", "Progress"].map((h, i) => (
                        <th key={h} scope="col" className={cn("px-3 py-2.5 font-medium", i === 0 && "pl-5", i === 5 && "pr-5")}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {[...tasks]
                      .sort((a, b) => taskColumns.findIndex((c) => c.id === a.status) - taskColumns.findIndex((c) => c.id === b.status) || priorityMeta[a.priority].rank - priorityMeta[b.priority].rank)
                      .map((t) => {
                        const due = dueLabel(t.due, t.status);
                        const people = t.assignees.map(getMember).filter(Boolean).map((m) => ({ initials: m!.initials, hue: m!.hue, name: m!.name }));
                        return (
                          <tr key={t.id} className="transition-colors hover:bg-surface-2/60">
                            <td className="py-3 pr-3 pl-5">
                              <button type="button" onClick={() => openTask(t)} className="text-left font-medium text-fg hover:text-accent-ink">
                                {t.title}
                              </button>
                              <p className="text-[12px] text-muted">{t.tag}</p>
                            </td>
                            <td className="px-3 py-3">
                              <NativeSelect aria-label={`Status for ${t.title}`} selectSize="sm" value={t.status} onChange={(e) => move(t, e.target.value as TaskStatus)} className="w-36">
                                {taskColumns.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.label}
                                  </option>
                                ))}
                              </NativeSelect>
                            </td>
                            <td className="px-3 py-3">
                              <Badge tone={priorityTone[t.priority]}>{priorityMeta[t.priority].label}</Badge>
                            </td>
                            <td className="px-3 py-3">
                              <AvatarStack people={people} size="sm" />
                            </td>
                            <td className={cn("px-3 py-3 font-medium whitespace-nowrap", due.tone)}>{due.text}</td>
                            <td className="w-40 py-3 pr-5 pl-3">
                              <div className="flex items-center gap-2">
                                <Progress value={t.progress} className="h-1" label={`${t.title} progress`} tone={t.status === "done" ? "success" : "brand"} />
                                <span className="w-9 text-right text-[12px] text-muted tabular">{Math.round(t.progress * 100)}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </Card>
          )
        }
      </AsyncView>

      <TaskDetailDialog task={selected} open={detailOpen && Boolean(selected)} onOpenChange={setDetailOpen} onMove={move} />
      <NewTaskDialog
        open={newOpen}
        onOpenChange={(v) => {
          setNewOpen(v);
          if (!v && params.get("new")) router.replace("/tasks", { scroll: false });
        }}
        onCreate={(t) => {
          res.setData((list) => [t, ...list]);
          toast({ title: "Task created", description: `${t.title} was added to To do.` });
        }}
      />
    </div>
  );
}
