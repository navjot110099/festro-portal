"use client";

import { useDraggable } from "@dnd-kit/core";
import { CalendarClock, GripVertical, ListChecks, MessageSquare, MoreHorizontal } from "lucide-react";
import { AvatarStack } from "@/components/ui/avatar";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Progress } from "@/components/ui/feedback";
import { Menu, MenuContent, MenuItem, MenuLabel, MenuTrigger } from "@/components/ui/menu";
import { priorityMeta, taskColumns } from "@/data/tasks";
import { getMember } from "@/data/user";
import { daysUntil, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types";

export const priorityTone: Record<Task["priority"], BadgeTone> = { urgent: "danger", high: "warning", medium: "info", low: "neutral" };

export function dueLabel(iso: string, status: TaskStatus) {
  const d = daysUntil(iso);
  if (status === "done") return { text: formatDate(iso), tone: "text-subtle" };
  if (d < 0) return { text: `${-d}d overdue`, tone: "text-danger" };
  if (d === 0) return { text: "Due today", tone: "text-danger" };
  if (d === 1) return { text: "Tomorrow", tone: "text-warning" };
  if (d <= 7) return { text: `In ${d} days`, tone: "text-fg-2" };
  return { text: formatDate(iso), tone: "text-muted" };
}

export function TaskCardBody({ task, onMove, onOpen, dragging, handleProps }: { task: Task; onMove?: (s: TaskStatus) => void; onOpen?: () => void; dragging?: boolean; handleProps?: React.HTMLAttributes<HTMLButtonElement> }) {
  const due = dueLabel(task.due, task.status);
  const people = task.assignees.map((id) => getMember(id)).filter(Boolean).map((m) => ({ initials: m!.initials, hue: m!.hue, name: m!.name }));
  return (
    <div
      className={cn(
        "group/card relative rounded-xl border border-line bg-surface p-3.5 shadow-xs transition-[box-shadow,border-color,transform] duration-200",
        dragging ? "rotate-[1.5deg] border-accent/30 shadow-lg" : "hover:border-line-strong hover:shadow-sm",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          {...handleProps}
          className="absolute top-3.5 left-0.5 hidden cursor-grab touch-none rounded p-0.5 text-subtle opacity-0 transition-opacity group-hover/card:opacity-100 focus-visible:opacity-100 active:cursor-grabbing sm:block"
          aria-label={`Drag ${task.title}`}
        >
          <GripVertical className="size-3.5" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Badge tone="neutral" className="h-5 text-[10.5px]">
              {task.tag}
            </Badge>
            <Badge tone={priorityTone[task.priority]} className="h-5 text-[10.5px]">
              {priorityMeta[task.priority].label}
            </Badge>
          </div>
          <button type="button" onClick={onOpen} className="mt-2 block text-left text-[13.5px] leading-snug font-medium text-fg hover:text-accent-ink">
            {task.title}
          </button>
          {task.description && <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted">{task.description}</p>}
        </div>
        {onMove && (
          <Menu>
            <MenuTrigger asChild>
              <button type="button" aria-label={`Move ${task.title}`} className="-mr-1 grid size-6 shrink-0 place-items-center rounded-md text-subtle transition-colors hover:bg-surface-2 hover:text-fg">
                <MoreHorizontal className="size-4" />
              </button>
            </MenuTrigger>
            <MenuContent className="w-44">
              <MenuLabel>Move to</MenuLabel>
              {taskColumns
                .filter((c) => c.id !== task.status)
                .map((c) => (
                  <MenuItem key={c.id} onSelect={() => onMove(c.id)}>
                    {c.label}
                  </MenuItem>
                ))}
            </MenuContent>
          </Menu>
        )}
      </div>
      {task.status !== "done" && task.progress > 0 && <Progress value={task.progress} className="mt-3 h-1" label={`${task.title} progress`} tone={task.status === "review" ? "success" : "brand"} />}
      <div className="mt-3 flex items-center justify-between gap-2 text-[11.5px]">
        <div className="flex items-center gap-3">
          <span className={cn("inline-flex items-center gap-1 font-medium", due.tone)}>
            <CalendarClock className="size-3" aria-hidden /> {due.text}
          </span>
          <span className="inline-flex items-center gap-1 text-subtle" aria-label={`${task.subtasks.done} of ${task.subtasks.total} subtasks done`}>
            <ListChecks className="size-3" aria-hidden /> {task.subtasks.done}/{task.subtasks.total}
          </span>
          {task.comments > 0 && (
            <span className="hidden items-center gap-1 text-subtle sm:inline-flex" aria-label={`${task.comments} comments`}>
              <MessageSquare className="size-3" aria-hidden /> {task.comments}
            </span>
          )}
        </div>
        <AvatarStack people={people} />
      </div>
    </div>
  );
}

export function DraggableTask({ task, onMove, onOpen }: { task: Task; onMove: (s: TaskStatus) => void; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id, data: { status: task.status } });
  // Mouse/touch drag from anywhere on the card; keyboard drag only from the grip handle,
  // so Enter/Space on the title or menu never starts a drag.
  const { onKeyDown, ...pointerListeners } = listeners ?? {};
  return (
    <div ref={setNodeRef} className={cn(isDragging && "opacity-35")} {...pointerListeners}>
      <TaskCardBody task={task} onMove={onMove} onOpen={onOpen} handleProps={{ ...attributes, onKeyDown } as React.HTMLAttributes<HTMLButtonElement>} />
    </div>
  );
}
