"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { useHotkey } from "@/hooks/use-hotkey";
import { useStoredState } from "@/hooks/use-stored-state";
import { CommandPalette } from "./command-palette";
import { DataStateBanner } from "./data-state-banner";
import { MobileDrawer, MobileTabBar } from "./mobile-nav";
import { ShortcutsDialog } from "./shortcuts-dialog";
import { Sidebar, SIDEBAR_COLLAPSED, SIDEBAR_EXPANDED } from "./sidebar";
import { Topbar } from "./topbar";

/** Surfaces one "live" event per session so the workspace feels connected. */
function useLiveSignal() {
  const toast = useToast();
  const router = useRouter();
  useEffect(() => {
    let shown = false;
    try {
      shown = sessionStorage.getItem("fh-live-signal") === "1";
    } catch {
      /* ignore */
    }
    if (shown) return;
    const t = window.setTimeout(() => {
      toast({
        title: "New qualified lead",
        description: "Harper Lyons · Lumen Dental Group, team headshots for 42 staff",
        tone: "ai",
        duration: 7000,
        action: { label: "View lead", onClick: () => router.push("/leads?lead=lead_1040") },
      });
      try {
        sessionStorage.setItem("fh-live-signal", "1");
      } catch {
        /* ignore */
      }
    }, 9000);
    return () => window.clearTimeout(t);
  }, [toast, router]);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useStoredState("fh-sidebar-collapsed", false);
  const [navOpen, setNavOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const pendingG = useRef<number | null>(null);

  useLiveSignal();

  useHotkey("mod+k", useCallback(() => setCommandOpen((v) => !v), []));
  useHotkey("[", useCallback(() => setCollapsed((v) => !v), [setCollapsed]));
  useHotkey("?", useCallback(() => setShortcutsOpen(true), []));
  useHotkey(
    "g",
    useCallback(() => {
      pendingG.current = window.setTimeout(() => (pendingG.current = null), 900);
    }, []),
  );

  useEffect(() => {
    const routes: Record<string, string> = { d: "/dashboard", l: "/leads", a: "/ai", c: "/campaigns", s: "/seo", t: "/tasks", r: "/reports" };
    const onKey = (e: KeyboardEvent) => {
      if (pendingG.current === null || typeof e.key !== "string") return;
      const target = e.target as HTMLElement | null;
      if (target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return;
      const href = routes[e.key.toLowerCase()];
      if (href && e.key.toLowerCase() !== "g") {
        window.clearTimeout(pendingG.current);
        pendingG.current = null;
        router.push(href);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <div className="min-h-dvh bg-bg" style={{ "--sidebar-w": `${collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED}px` } as React.CSSProperties}>
      <a
        href="#main"
        className="fixed top-3 left-3 z-[100] -translate-y-20 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-fg shadow-lg transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div className="transition-[padding] duration-300 ease-out lg:pl-[var(--sidebar-w)]">
        <DataStateBanner />
        <Topbar onOpenNav={() => setNavOpen(true)} onOpenCommand={() => setCommandOpen(true)} onShowShortcuts={() => setShortcutsOpen(true)} />
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1480px] px-4 pt-6 pb-28 outline-none sm:px-6 lg:px-8 lg:pt-8 lg:pb-14">
          {children}
        </main>
      </div>
      <MobileTabBar onOpenMore={() => setNavOpen(true)} />
      <MobileDrawer open={navOpen} onOpenChange={setNavOpen} />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </div>
  );
}
