"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_KEY = "fh-theme";
const THEME_EVENT = "fh-theme-change";

/** Runs before first paint (inlined in <head>) so the saved theme never flashes. */
export const themeInitScript = `(function(){try{var d=document.documentElement,t=localStorage.getItem("${THEME_KEY}");var m=t==="dark"||t==="light"?t:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");d.setAttribute("data-theme",m);if(localStorage.getItem("fh-reduced-motion")==="true")d.setAttribute("data-reduced-motion","true")}catch(e){}})()`;

function readPreference(): ThemePreference {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function subscribe(onChange: () => void) {
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  mql.addEventListener("change", onChange);
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    mql.removeEventListener("change", onChange);
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function resolve(pref: ThemePreference): ResolvedTheme {
  if (pref !== "system") return pref;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

interface ThemeContextValue {
  preference: ThemePreference;
  theme: ResolvedTheme;
  /** `origin` is the viewport point the reveal animation grows from (e.g. the toggle). */
  setTheme: (pref: ThemePreference, origin?: { x: number; y: number }) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const preference = useSyncExternalStore(subscribe, readPreference, () => "system" as ThemePreference);
  const theme = useSyncExternalStore(
    subscribe,
    () => resolve(readPreference()),
    () => "light" as ResolvedTheme,
  );

  // Keep <html data-theme> in sync with system changes while on "system".
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = useCallback((pref: ThemePreference, origin?: { x: number; y: number }) => {
    const root = document.documentElement;
    const next = resolve(pref);
    const apply = () => {
      try {
        if (pref === "system") localStorage.removeItem(THEME_KEY);
        else localStorage.setItem(THEME_KEY, pref);
      } catch {
        /* storage unavailable: theme still applies for this page */
      }
      root.setAttribute("data-theme", next);
      window.dispatchEvent(new Event(THEME_EVENT));
    };

    const reduce =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches || root.getAttribute("data-reduced-motion") === "true";
    const current = root.getAttribute("data-theme");

    if (current === next || reduce) {
      apply();
      return;
    }

    if (typeof document.startViewTransition === "function") {
      const x = origin?.x ?? window.innerWidth - 40;
      const y = origin?.y ?? 40;
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      const transition = document.startViewTransition(() => flushSync(apply));
      transition.ready
        .then(() => {
          root.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 560, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" },
          );
        })
        .catch(() => {});
      return;
    }

    root.classList.add("theme-transition");
    apply();
    window.setTimeout(() => root.classList.remove("theme-transition"), 420);
  }, []);

  const value = useMemo(() => ({ preference, theme, setTheme }), [preference, theme, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
