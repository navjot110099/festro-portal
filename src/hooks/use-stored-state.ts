"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const EVENT = "fh-storage";
/** In-memory fallback for private windows / blocked storage. */
const memory = new Map<string, string>();

function read(key: string) {
  try {
    return window.localStorage.getItem(key) ?? memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

/** State persisted to localStorage, safe for SSR (server renders `initial`). */
export function useStoredState<T>(key: string, initial: T) {
  const raw = useSyncExternalStore(subscribe, () => read(key), () => null);
  const value = useMemo<T>(() => {
    if (raw == null) return initial;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
    // `initial` is a default; changes to it should not re-parse.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const current = (() => {
        const r = read(key);
        if (r == null) return initial;
        try {
          return JSON.parse(r) as T;
        } catch {
          return initial;
        }
      })();
      const resolved = typeof next === "function" ? (next as (p: T) => T)(current) : next;
      const serialized = JSON.stringify(resolved);
      memory.set(key, serialized);
      try {
        window.localStorage.setItem(key, serialized);
      } catch {
        /* storage unavailable — memory fallback keeps this session working */
      }
      window.dispatchEvent(new Event(EVENT));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  return [value, set] as const;
}
