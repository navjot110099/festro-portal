"use client";

import { isEmptyData } from "@/hooks/use-resource";
import { EmptyState, ErrorState } from "@/components/ui/states";

interface AsyncViewProps<T> {
  status: "loading" | "success" | "error";
  data: T | undefined;
  error?: Error;
  onRetry?: () => void;
  skeleton: React.ReactNode;
  empty?: { title: string; description?: string; icon?: React.ElementType; action?: React.ReactNode };
  isEmpty?: (data: NonNullable<T>) => boolean;
  children: (data: NonNullable<T>) => React.ReactNode;
  compact?: boolean;
  errorTitle?: string;
}

/** Renders the right state for a resource: loading skeleton, error, empty, or content. */
export function AsyncView<T>({ status, data, error, onRetry, skeleton, empty, isEmpty, children, compact, errorTitle }: AsyncViewProps<T>) {
  let key: string;
  let node: React.ReactNode;
  if (status === "loading") {
    key = "loading";
    node = (
      <div aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading…</span>
        {skeleton}
      </div>
    );
  } else if (status === "error") {
    key = "error";
    node = <ErrorState title={errorTitle ?? "This section couldn't load"} error={error} onRetry={onRetry} compact={compact} />;
  } else if (data === undefined || data === null || (isEmpty ? isEmpty(data as NonNullable<T>) : isEmptyData(data))) {
    key = "empty";
    node = (
      <EmptyState
        title={empty?.title ?? "Nothing here yet"}
        description={empty?.description ?? "Data will appear as soon as your sources sync."}
        icon={empty?.icon}
        action={empty?.action}
        compact={compact}
      />
    );
  } else {
    key = "ready";
    node = children(data as NonNullable<T>);
  }
  // A keyed CSS fade: content appears the moment data arrives, without waiting on a JS exit animation.
  return (
    <div key={key} className={key === "loading" ? undefined : "animate-[fade_280ms_ease-out_backwards]"}>
      {node}
    </div>
  );
}
