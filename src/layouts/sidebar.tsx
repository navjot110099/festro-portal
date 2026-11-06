"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronsUpDown, PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { Tooltip } from "@/components/ui/tooltip";
import { currentUser } from "@/data/user";
import { DEMO_MODE_EVENT, getDemoMode, type DemoMode } from "@/lib/api/client";
import { navGroups, utilityNav, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";

function subscribeDemoMode(cb: () => void) {
  window.addEventListener(DEMO_MODE_EVENT, cb);
  return () => window.removeEventListener(DEMO_MODE_EVENT, cb);
}

export const SIDEBAR_EXPANDED = 264;
export const SIDEBAR_COLLAPSED = 76;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, collapsed, pathname, onNavigate }: { item: NavItem; collapsed: boolean; pathname: string; onNavigate?: () => void }) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex h-9 items-center gap-3 rounded-lg text-[13.5px] font-medium transition-colors duration-200",
        collapsed ? "w-10 justify-center" : "px-2.5",
        active ? "text-fg" : "text-muted hover:text-fg",
      )}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-lg border border-line bg-surface shadow-xs"
          transition={{ type: "spring", stiffness: 520, damping: 40 }}
        />
      )}
      {!active && <span className="absolute inset-0 rounded-lg opacity-0 transition-opacity group-hover:bg-surface-2/80 group-hover:opacity-100" />}
      <Icon
        className={cn("relative z-10 size-[18px] shrink-0 transition-colors", active ? "text-accent" : "text-subtle group-hover:text-fg-2")}
        strokeWidth={active ? 2.1 : 1.8}
        aria-hidden
      />
      {!collapsed && (
        <span className="relative z-10 flex min-w-0 flex-1 items-center justify-between gap-2">
          <span className="truncate">{item.label}</span>
          {item.badge && (
            <span className="rounded-md bg-accent-soft px-1.5 py-px text-[10px] font-semibold tracking-wide text-accent-ink">{item.badge}</span>
          )}
        </span>
      )}
    </Link>
  );
  return collapsed ? (
    <Tooltip content={item.label} side="right" sideOffset={12}>
      {link}
    </Tooltip>
  ) : (
    link
  );
}

export function SidebarNav({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="flex flex-col gap-5">
      {navGroups.map((group) => (
        <div key={group.id}>
          {collapsed ? (
            <div className="mx-auto mb-2 h-px w-6 bg-line" aria-hidden />
          ) : (
            <p className="mb-1.5 px-2.5 text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">{group.label}</p>
          )}
          <ul className={cn("flex flex-col gap-0.5", collapsed && "items-center")}>
            {group.items.map((item) => (
              <li key={item.href}>
                <NavLink item={item} collapsed={collapsed} pathname={pathname} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function UtilityNav({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Support and settings">
      <ul className={cn("flex flex-col gap-0.5", collapsed && "items-center")}>
        {utilityNav.map((item) => (
          <li key={item.href}>
            <NavLink item={item} collapsed={collapsed} pathname={pathname} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function WorkspaceCard({ collapsed }: { collapsed: boolean }) {
  const initials = currentUser.workspace
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
  const badge = (
    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#2e4762] bg-[linear-gradient(140deg,#3a5a7a,#22344a)] text-[11px] font-semibold text-white shadow-xs">{initials}</span>
  );
  if (collapsed) {
    return (
      <Tooltip content={`${currentUser.workspace} · ${currentUser.plan}`} side="right" sideOffset={12}>
        <div className="mx-auto" tabIndex={0} aria-label={`Workspace: ${currentUser.workspace}`}>
          {badge}
        </div>
      </Tooltip>
    );
  }
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface p-2 shadow-xs">
      {badge}
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-[13px] font-semibold text-fg">{currentUser.workspace}</p>
        <p className="truncate text-[11.5px] text-muted">{currentUser.plan} plan</p>
      </div>
      <ChevronsUpDown className="mr-1 size-4 text-subtle" aria-hidden />
    </div>
  );
}

function AiCard() {
  const mode = useSyncExternalStore(subscribeDemoMode, getDemoMode, () => "live" as DemoMode);
  if (mode !== "live") return null;
  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-[linear-gradient(160deg,var(--accent-soft),transparent_70%)] p-3.5">
      <div className="flex items-center gap-2 text-[12px] font-semibold text-accent-ink">
        <Sparkles className="size-3.5" aria-hidden /> Festro AI
      </div>
      <p className="mt-1.5 text-[12.5px] leading-snug text-fg-2">3 growth opportunities found this week, worth about $5.9K.</p>
      <Link href="/ai" className="mt-2.5 inline-flex items-center gap-1 text-[12.5px] font-medium text-fg hover:text-accent-ink">
        Review in AI Mode <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </div>
  );
}

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
      transition={{ type: "spring", stiffness: 380, damping: 40 }}
      className="fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-line bg-sidebar lg:flex"
      aria-label="Sidebar"
    >
      <div className={cn("flex h-16 shrink-0 items-center", collapsed ? "justify-center" : "justify-between px-5")}>
        <Link href="/dashboard" aria-label="Festro dashboard" className="rounded-lg">
          {collapsed ? <LogoMark /> : <Logo />}
        </Link>
        {!collapsed && (
          <Tooltip content="Collapse sidebar" side="right">
            <button
              type="button"
              onClick={onToggle}
              aria-label="Collapse sidebar"
              aria-expanded="true"
              className="grid size-8 place-items-center rounded-lg text-subtle transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <PanelLeftClose className="size-[18px]" />
            </button>
          </Tooltip>
        )}
      </div>

      <div className={cn("shrink-0 pb-4", collapsed ? "px-3" : "px-4")}>
        <WorkspaceCard collapsed={collapsed} />
      </div>

      <div className={cn("min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-4", collapsed ? "px-3" : "px-3")}>
        <SidebarNav collapsed={collapsed} />
      </div>

      <div className={cn("shrink-0 space-y-3 border-t border-line py-4", collapsed ? "px-3" : "px-3")}>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden px-1">
              <AiCard />
            </motion.div>
          )}
        </AnimatePresence>
        <UtilityNav collapsed={collapsed} />
        {collapsed && (
          <Tooltip content="Expand sidebar" side="right" sideOffset={12}>
            <button
              type="button"
              onClick={onToggle}
              aria-label="Expand sidebar"
              aria-expanded="false"
              className="mx-auto grid size-10 place-items-center rounded-lg text-subtle transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <PanelLeftOpen className="size-[18px]" />
            </button>
          </Tooltip>
        )}
      </div>
    </motion.aside>
  );
}
