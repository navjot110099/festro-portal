"use client";

import { ChevronRight, Menu as MenuIcon, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/feedback";
import { currentUser } from "@/data/user";
import { findNavItem } from "@/lib/nav";
import { NotificationsMenu } from "./notifications";
import { UserMenu } from "./user-menu";

export function Topbar({ onOpenNav, onOpenCommand, onShowShortcuts }: { onOpenNav: () => void; onOpenCommand: () => void; onShowShortcuts: () => void }) {
  const pathname = usePathname();
  const current = findNavItem(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-bg/80 backdrop-blur-xl supports-[backdrop-filter]:bg-bg/70">
      <div className="mx-auto flex h-16 max-w-[1480px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenNav}
          aria-label="Open navigation"
          className="grid size-9 place-items-center rounded-lg text-fg-2 transition-colors hover:bg-surface-2 lg:hidden"
        >
          <MenuIcon className="size-5" />
        </button>
        <Link href="/dashboard" className="lg:hidden" aria-label="FadHype dashboard">
          <LogoMark className="size-7" />
        </Link>

        <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-[13px] md:flex">
          <span className="truncate text-muted">{currentUser.workspace}</span>
          <ChevronRight className="size-3.5 shrink-0 text-subtle" aria-hidden />
          <span className="truncate font-medium text-fg" aria-current="page">
            {current?.label ?? "Overview"}
          </span>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenCommand}
            className="hidden h-9 w-64 items-center gap-2.5 rounded-lg border border-line bg-surface px-3 text-[13px] text-subtle shadow-xs transition-colors hover:border-line-strong hover:text-muted md:flex xl:w-80"
            aria-label="Search or ask AI (Command K)"
          >
            <Search className="size-4" aria-hidden />
            <span className="flex-1 text-left">Search or ask AI…</span>
            <span className="flex gap-0.5" aria-hidden>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </span>
          </button>
          <button
            type="button"
            onClick={onOpenCommand}
            aria-label="Search"
            className="grid size-9 place-items-center rounded-lg border border-line bg-surface text-fg-2 shadow-xs md:hidden"
          >
            <Search className="size-4" />
          </button>
          <Button asChild variant="soft" size="md" className="hidden sm:inline-flex">
            <Link href="/ai">
              <Sparkles /> Ask AI
            </Link>
          </Button>
          <NotificationsMenu />
          <ThemeToggle className="hidden sm:grid" />
          <UserMenu onShowShortcuts={onShowShortcuts} />
        </div>
      </div>
    </header>
  );
}
