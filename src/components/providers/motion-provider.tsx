"use client";

import { MotionConfig } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";

const KEY = "fh-reduced-motion";
const EVENT = "fh-motion-change";

function read() {
  try {
    return localStorage.getItem(KEY) === "true";
  } catch {
    return false;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

const MotionPrefContext = createContext<{ reduced: boolean; setReduced: (v: boolean) => void } | null>(null);

/**
 * Honors the OS "reduce motion" setting by default, plus an in-app override
 * (Settings → Appearance) that also stops CSS animations via a root attribute.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const reduced = useSyncExternalStore(subscribe, read, () => false);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-reduced-motion", reduced);
    if (reduced) document.documentElement.setAttribute("data-reduced-motion", "true");
  }, [reduced]);

  const setReduced = useCallback((v: boolean) => {
    try {
      localStorage.setItem(KEY, String(v));
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const value = useMemo(() => ({ reduced, setReduced }), [reduced, setReduced]);

  return (
    <MotionPrefContext.Provider value={value}>
      <MotionConfig reducedMotion={reduced ? "always" : "user"} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
        {children}
      </MotionConfig>
    </MotionPrefContext.Provider>
  );
}

export function useMotionPreference() {
  const ctx = useContext(MotionPrefContext);
  if (!ctx) throw new Error("useMotionPreference must be used inside <MotionProvider>");
  return ctx;
}
