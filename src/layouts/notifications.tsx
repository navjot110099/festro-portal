"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell, BriefcaseBusiness, ChartLine, CheckCheck, FileChartColumn, Megaphone, Radar, Settings2, Sparkles, SquareKanban, UsersRound } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/feedback";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/menu";
import { ErrorState, EmptyState } from "@/components/ui/states";
import { useResource } from "@/hooks/use-resource";
import { useStoredState } from "@/hooks/use-stored-state";
import { api } from "@/lib/api";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ActivityItem, ActivityKind } from "@/types";

export const activityIcon: Record<ActivityKind, React.ElementType> = {
  lead: UsersRound,
  seo: Radar,
  campaign: Megaphone,
  report: FileChartColumn,
  ai: Sparkles,
  task: SquareKanban,
  system: Settings2,
};

export const activityTint: Record<ActivityKind, string> = {
  lead: "bg-accent-soft text-accent-ink",
  seo: "bg-success-soft text-success",
  campaign: "bg-info-soft text-info",
  report: "bg-surface-3 text-fg-2",
  ai: "bg-accent-soft text-accent-ink",
  task: "bg-warning-soft text-warning",
  system: "bg-surface-3 text-muted",
};

export function ActivityRow({ item, unread, compact }: { item: ActivityItem; unread?: boolean; compact?: boolean }) {
  const Icon = activityIcon[item.kind] ?? ChartLine;
  return (
    <div className="flex gap-3">
      <span className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg", activityTint[item.kind])}>
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-body leading-snug", unread ? "font-semibold text-fg" : "font-medium text-fg-2")}>{item.title}</p>
          {unread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" aria-label="Unread" />}
        </div>
        <p className={cn("mt-0.5 text-caption leading-snug text-muted", compact && "line-clamp-1")}>{item.detail}</p>
        <p className="mt-1 text-micro text-subtle">
          <time dateTime={item.at}>{formatRelative(item.at)}</time>
        </p>
      </div>
    </div>
  );
}

const READ_KEY = "fh-read-notifications";

export function NotificationsMenu() {
  const { status, data, error, reload } = useResource(() => api.activity.list());
  const [readIds, setReadIds] = useStoredState<string[]>(READ_KEY, []);
  const items = useMemo(() => (data ?? []).slice(0, 6), [data]);
  const unread = items.filter((i) => i.unread && !readIds.includes(i.id));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={unread.length ? `Notifications, ${unread.length} unread` : "Notifications"}
          className="relative grid size-9 place-items-center rounded-lg border border-line bg-surface text-fg-2 shadow-xs transition-colors hover:border-line-strong hover:text-fg"
        >
          <Bell className="size-4" />
          <AnimatePresence>
            {unread.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white ring-2 ring-bg dark:text-charcoal"
                aria-hidden
              >
                {unread.length}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(380px,calc(100vw-24px))]" aria-label="Notifications">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div>
            <p className="text-body font-semibold text-fg">Notifications</p>
            <p className="text-caption text-muted">{unread.length ? `${unread.length} unread` : "You're all caught up"}</p>
          </div>
          <button
            type="button"
            disabled={!unread.length}
            onClick={() => setReadIds(items.map((i) => i.id))}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-caption font-medium text-accent-ink transition-colors hover:bg-accent-soft disabled:pointer-events-none disabled:opacity-40"
          >
            <CheckCheck className="size-3.5" aria-hidden /> Mark all read
          </button>
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {status === "loading" && (
            <div className="space-y-4 p-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="size-8 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {status === "error" && <ErrorState compact error={error} onRetry={reload} title="Notifications unavailable" />}
          {status === "success" && items.length === 0 && <EmptyState compact icon={Bell} title="No notifications" description="We'll let you know when something important happens." />}
          {status === "success" && items.length > 0 && (
            <ul className="divide-y divide-line">
              {items.map((item) => (
                <li key={item.id}>
                  <PopoverClose asChild>
                    <Link
                      href={item.href ?? "/dashboard"}
                      onClick={() => setReadIds((ids) => (ids.includes(item.id) ? ids : [...ids, item.id]))}
                      className="block px-4 py-3 transition-colors hover:bg-surface-2"
                    >
                      <ActivityRow item={item} unread={item.unread && !readIds.includes(item.id)} compact />
                    </Link>
                  </PopoverClose>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-line p-2">
          <PopoverClose asChild>
            <Link href="/dashboard#activity" className="flex h-8 items-center justify-center gap-1.5 rounded-lg text-caption font-medium text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg">
              <BriefcaseBusiness className="size-3.5" aria-hidden /> View all activity
            </Link>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}
