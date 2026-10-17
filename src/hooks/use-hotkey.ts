"use client";

import { useEffect } from "react";

/** Registers a keyboard shortcut like "mod+k" (⌘ on macOS, Ctrl elsewhere). */
export function useHotkey(combo: string, handler: (e: KeyboardEvent) => void) {
  useEffect(() => {
    const parts = combo.toLowerCase().split("+");
    const key = parts[parts.length - 1];
    const needsMod = parts.includes("mod");
    const listener = (e: KeyboardEvent) => {
      // Some synthetic/autofill keydown events carry no key.
      if (typeof e.key !== "string" || e.key.toLowerCase() !== key) return;
      if (needsMod && !(e.metaKey || e.ctrlKey)) return;
      if (!needsMod) {
        const target = e.target as HTMLElement | null;
        if (target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return;
      }
      e.preventDefault();
      handler(e);
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [combo, handler]);
}
