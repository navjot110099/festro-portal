"use client";

import { ErrorState } from "@/components/ui/states";

export default function PortalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-2xl border border-line bg-surface">
      <ErrorState title="This page hit an unexpected error" error={error} onRetry={reset} />
    </div>
  );
}
