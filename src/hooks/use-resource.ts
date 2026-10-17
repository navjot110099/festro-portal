"use client";

import { useCallback, useEffect, useEffectEvent, useState } from "react";
import { DEMO_MODE_EVENT } from "@/lib/api/client";

export type ResourceStatus = "loading" | "success" | "error";

interface Settled<T> {
  key: string;
  status: "success" | "error";
  data?: T;
  error?: Error;
}

/**
 * Minimal data-fetching hook with loading / error / success states and retry,
 * shaped like TanStack Query's result so it can be swapped for it later.
 * Refetches when the demo data mode changes in Settings.
 *
 * `keepPreviousData` keeps showing the last successful payload while a new
 * key (e.g. a different date range) loads, so charts animate instead of flashing.
 */
export function useResource<T>(fetcher: () => Promise<T>, deps: unknown[] = [], { keepPreviousData = false } = {}) {
  const [nonce, setNonce] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const [lastGood, setLastGood] = useState<T | undefined>(undefined);
  const [overrides, setOverrides] = useState<{ key: string; data: T } | null>(null);
  const key = JSON.stringify([nonce, ...deps]);

  const run = useEffectEvent(() => fetcher());
  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    run()
      .then((data) => {
        if (cancelled) return;
        setSettled({ key, status: "success", data });
        setLastGood(data);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setSettled({ key, status: "error", error: error instanceof Error ? error : new Error(String(error)) });
        setLastGood(undefined);
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  useEffect(() => {
    const onMode = () => {
      setLastGood(undefined);
      reload();
    };
    window.addEventListener(DEMO_MODE_EVENT, onMode);
    return () => window.removeEventListener(DEMO_MODE_EVENT, onMode);
  }, [reload]);

  const isCurrent = settled?.key === key;
  let status: ResourceStatus = isCurrent ? settled.status : "loading";
  let data: T | undefined = isCurrent ? settled.data : undefined;
  if (!isCurrent && keepPreviousData && lastGood !== undefined) {
    status = "success";
    data = lastGood;
  }
  if (status === "success" && overrides?.key === key) data = overrides.data;

  /** Optimistic local update of the loaded payload (e.g. after editing a lead). */
  const setData = useCallback(
    (updater: (prev: T) => T) => {
      setOverrides((prev) => {
        const base = prev?.key === key ? prev.data : data;
        return base === undefined ? prev : { key, data: updater(base) };
      });
    },
    [key, data],
  );

  return {
    status,
    data,
    error: isCurrent ? settled.error : undefined,
    isFetching: !isCurrent,
    reload,
    setData,
  };
}

export function isEmptyData(data: unknown) {
  if (data == null) return true;
  if (Array.isArray(data)) return data.length === 0;
  return false;
}
