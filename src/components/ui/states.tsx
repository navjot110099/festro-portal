"use client";

import { CircleAlert, Inbox, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  compact,
}: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex animate-[rise_400ms_cubic-bezier(0.16,1,0.3,1)_backwards] flex-col items-center justify-center text-center", compact ? "gap-2 px-4 py-8" : "gap-3 px-6 py-14", className)}>
      <span className="relative grid size-11 place-items-center rounded-xl border border-line bg-surface-2 text-muted">
        <Icon className="size-5" aria-hidden />
        <span className="absolute -inset-1.5 -z-10 rounded-2xl border border-dashed border-line" aria-hidden />
      </span>
      <div className="max-w-sm space-y-1">
        <p className="text-sm font-medium text-fg">{title}</p>
        {description && <p className="text-[13px] leading-relaxed text-muted">{description}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  error,
  onRetry,
  className,
  compact,
}: {
  title?: string;
  error?: Error;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div role="alert" className={cn("flex animate-[rise_400ms_cubic-bezier(0.16,1,0.3,1)_backwards] flex-col items-center justify-center text-center", compact ? "gap-2 px-4 py-8" : "gap-3 px-6 py-14", className)}>
      <span className="grid size-11 place-items-center rounded-xl bg-danger-soft text-danger">
        <CircleAlert className="size-5" aria-hidden />
      </span>
      <div className="max-w-sm space-y-1">
        <p className="text-sm font-medium text-fg">{title}</p>
        <p className="text-[13px] leading-relaxed text-muted">{error?.message ?? "Please try again in a moment."}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-1">
          <RotateCcw /> Try again
        </Button>
      )}
    </div>
  );
}
