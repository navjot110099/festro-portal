"use client";

import { RotateCcw } from "lucide-react";
import { useSyncExternalStore } from "react";
import { DEMO_MODE_EVENT, getDemoMode, setDemoMode, type DemoMode } from "@/lib/api/client";

function subscribe(cb: () => void) {
  window.addEventListener(DEMO_MODE_EVENT, cb);
  return () => window.removeEventListener(DEMO_MODE_EVENT, cb);
}

const messages: Record<Exclude<DemoMode, "live">, string> = {
  empty: "Previewing an empty workspace",
  error: "Previewing connection issues",
};

/**
 * Appears only while Settings → Data states previews an empty workspace or
 * connection issues, so there's always a one-click way back to full data.
 */
export function DataStateBanner() {
  const mode = useSyncExternalStore(subscribe, getDemoMode, () => "live" as DemoMode);
  if (mode === "live") return null;

  return (
    <div role="status" className="bg-brand text-brand-fg">
      <div className="mx-auto flex min-h-9 max-w-[1480px] items-center gap-3 px-4 py-1.5 text-caption sm:px-6 lg:px-8">
        <p className="min-w-0 flex-1 truncate">
          {messages[mode]}
          <span className="hidden sm:inline"> · Settings → Data states</span>
        </p>
        <button
          type="button"
          onClick={() => setDemoMode("live")}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-brand-fg/15 px-2 py-1 font-medium transition-colors hover:bg-brand-fg/25"
        >
          <RotateCcw className="size-3.5" aria-hidden /> Restore full data
        </button>
      </div>
    </div>
  );
}
