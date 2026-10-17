"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
  type KeyboardCoordinateGetter,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { taskColumns } from "@/data/tasks";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types";
import { DraggableTask, TaskCardBody } from "./task-card";

const columnDot: Record<TaskStatus, string> = {
  todo: "bg-subtle",
  "in-progress": "bg-info",
  review: "bg-warning",
  done: "bg-success",
};

function Column({ id, label, hint, tasks, onMove, onOpen }: { id: TaskStatus; label: string; hint: string; tasks: Task[]; onMove: (task: Task, s: TaskStatus) => void; onOpen: (t: Task) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <section aria-labelledby={`col-${id}`} className="flex w-[82vw] max-w-[340px] shrink-0 snap-start flex-col sm:w-[300px] xl:w-auto xl:max-w-none xl:flex-1">
      <header className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", columnDot[id])} aria-hidden />
          <h2 id={`col-${id}`} className="text-[13px] font-semibold text-fg">
            {label}
          </h2>
          <span className="rounded-full bg-surface-3 px-1.5 text-[11px] font-medium text-muted tabular">{tasks.length}</span>
        </div>
        <span className="hidden text-[11.5px] text-subtle 2xl:inline">{hint}</span>
      </header>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[220px] flex-1 flex-col gap-2.5 rounded-2xl border border-dashed p-2.5 transition-colors duration-200",
          isOver ? "border-accent/40 bg-accent-soft" : "border-transparent bg-surface-2/50",
        )}
      >
        <AnimatePresence initial={false}>
          {tasks.map((t) => (
            <motion.div key={t.id} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.25 }}>
              <DraggableTask task={t} onMove={(s) => onMove(t, s)} onOpen={() => onOpen(t)} />
            </motion.div>
          ))}
        </AnimatePresence>
        {tasks.length === 0 && <p className="m-auto px-4 py-6 text-center text-[12px] text-subtle">Drop a task here</p>}
      </div>
    </section>
  );
}

/** Drop where the pointer is; keyboard drags (no pointer) fall back to rectangle overlap. */
const collision: CollisionDetection = (args) => (args.pointerCoordinates ? pointerWithin(args) : rectIntersection(args));

/** Arrow keys jump the dragged card to the next column instead of nudging it 25px. */
const columnKeyboardCoordinates: KeyboardCoordinateGetter = (event, { context: { droppableRects, collisionRect } }) => {
  if (!collisionRect) return undefined;
  const dir = event.code === "ArrowRight" ? 1 : event.code === "ArrowLeft" ? -1 : 0;
  if (!dir) return undefined;
  event.preventDefault();
  const center = collisionRect.left + collisionRect.width / 2;
  const targets = [...droppableRects.values()]
    .filter((r) => (dir > 0 ? r.left + r.width / 2 > center + 4 : r.left + r.width / 2 < center - 4))
    .sort((a, b) => Math.abs(a.left - collisionRect.left) - Math.abs(b.left - collisionRect.left));
  const target = targets[0];
  if (!target) return undefined;
  return { x: target.left + (target.width - collisionRect.width) / 2, y: target.top + 12 };
};

export function KanbanBoard({ tasks, onMove, onOpen }: { tasks: Task[]; onMove: (task: Task, s: TaskStatus) => void; onOpen: (t: Task) => void }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: columnKeyboardCoordinates }),
  );
  const active = tasks.find((t) => t.id === activeId) ?? null;
  const title = (id: string | number) => tasks.find((t) => t.id === id)?.title ?? "task";
  const colName = (id: string | number | undefined) => taskColumns.find((c) => c.id === id)?.label ?? "column";

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const task = tasks.find((t) => t.id === e.active.id);
    const to = e.over?.id as TaskStatus | undefined;
    if (task && to && to !== task.status) onMove(task, to);
  };

  return (
    <DndContext
      collisionDetection={collision}
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
      accessibility={{
        screenReaderInstructions: { draggable: "To move a task, press space or enter on its handle, use the left and right arrow keys to choose a column, then press space or enter again. Press escape to cancel." },
        announcements: {
          onDragStart: ({ active: a }) => `Picked up ${title(a.id)}.`,
          onDragOver: ({ active: a, over }) => (over ? `${title(a.id)} is over ${colName(over.id)}.` : `${title(a.id)} is not over a column.`),
          onDragEnd: ({ active: a, over }) => (over ? `${title(a.id)} moved to ${colName(over.id)}.` : `${title(a.id)} was dropped.`),
          onDragCancel: ({ active: a }) => `Moving ${title(a.id)} was cancelled.`,
        },
      }}
    >
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 xl:overflow-visible">
        {taskColumns.map((c) => (
          <Column key={c.id} id={c.id} label={c.label} hint={c.hint} tasks={tasks.filter((t) => t.status === c.id)} onMove={onMove} onOpen={onOpen} />
        ))}
      </div>
      {mounted &&
        createPortal(
          <DragOverlay dropAnimation={{ duration: 220, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }}>{active ? <TaskCardBody task={active} dragging /> : null}</DragOverlay>,
          document.body,
        )}
    </DndContext>
  );
}
