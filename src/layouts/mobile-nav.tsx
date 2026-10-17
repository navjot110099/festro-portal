"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChartLine, LayoutDashboard, LayoutGrid, Sparkles, UsersRound, X } from "lucide-react";
import { Dialog } from "radix-ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { cn } from "@/lib/utils";
import { SidebarNav, UtilityNav, WorkspaceCard } from "./sidebar";

const tabs = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: ChartLine },
  { href: "/ai", label: "AI", icon: Sparkles, emphasis: true },
  { href: "/leads", label: "Leads", icon: UsersRound },
];

/** Bottom tab bar for phones and small tablets. */
export function MobileTabBar({ onOpenMore }: { onOpenMore: () => void }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-5 items-center px-2">
        {tabs.map((t) => {
          const active = pathname === t.href || pathname.startsWith(`${t.href}/`);
          const Icon = t.icon;
          return (
            <li key={t.href} className="flex justify-center">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn("flex w-16 flex-col items-center gap-1 rounded-xl py-1.5 text-[10.5px] font-medium transition-colors", active ? "text-fg" : "text-muted")}
              >
                {t.emphasis ? (
                  <span className={cn("grid size-9 place-items-center rounded-xl shadow-brand transition-transform active:scale-95", "bg-brand text-brand-fg")}>
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                ) : (
                  <span className="relative grid h-6 place-items-center">
                    <Icon className={cn("size-5", active && "text-accent")} strokeWidth={active ? 2.1 : 1.8} aria-hidden />
                  </span>
                )}
                {!t.emphasis && t.label}
                {t.emphasis && <span className="sr-only">{t.label}</span>}
              </Link>
            </li>
          );
        })}
        <li className="flex justify-center">
          <button type="button" onClick={onOpenMore} className="flex w-16 flex-col items-center gap-1 py-1.5 text-[10.5px] font-medium text-muted">
            <span className="grid h-6 place-items-center">
              <LayoutGrid className="size-5" strokeWidth={1.8} aria-hidden />
            </span>
            More
          </button>
        </li>
      </ul>
    </nav>
  );
}

/** Full navigation drawer for small screens. */
export function MobileDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const close = () => onOpenChange(false);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div className="fixed inset-0 z-[60] bg-overlay backdrop-blur-[2px] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%", transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 360, damping: 38 }}
                className="fixed inset-y-0 left-0 z-[61] flex w-[min(320px,88vw)] flex-col border-r border-line bg-sidebar shadow-lg lg:hidden"
              >
                <Dialog.Title className="sr-only">Navigation</Dialog.Title>
                <Dialog.Description className="sr-only">All sections of the FadHype portal</Dialog.Description>
                <div className="flex h-16 items-center justify-between px-5">
                  <Logo />
                  <Dialog.Close className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg" aria-label="Close navigation">
                    <X className="size-5" />
                  </Dialog.Close>
                </div>
                <div className="px-4 pb-4">
                  <WorkspaceCard collapsed={false} />
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
                  <SidebarNav onNavigate={close} />
                </div>
                <div className="flex items-end justify-between gap-3 border-t border-line p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
                  <div className="flex-1">
                    <UtilityNav onNavigate={close} />
                  </div>
                  <ThemeToggle />
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
