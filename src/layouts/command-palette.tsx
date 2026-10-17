"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, FileChartColumn, Moon, Plus, Search, Sparkles, SquareKanban, Sun } from "lucide-react";
import { Dialog } from "radix-ui";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { Kbd } from "@/components/ui/feedback";
import { allNavItems } from "@/lib/nav";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  group: "Ask AI" | "Go to" | "Actions";
  label: string;
  hint?: string;
  icon: React.ElementType;
  run: () => void;
  keywords?: string;
}

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();

  const close = () => onOpenChange(false);

  const commands = useMemo<Command[]>(() => {
    const go = (href: string) => () => {
      router.push(href);
      close();
    };
    const nav: Command[] = allNavItems.map((item) => ({
      id: `nav-${item.href}`,
      group: "Go to",
      label: item.label,
      hint: item.description,
      icon: item.icon,
      run: go(item.href),
      keywords: item.description,
    }));
    const actions: Command[] = [
      { id: "new-lead", group: "Actions", label: "Add a new lead", icon: Plus, run: go("/leads?new=1"), keywords: "create contact crm" },
      { id: "report", group: "Actions", label: "Generate a client report", icon: FileChartColumn, run: go("/reports"), keywords: "pdf export monthly" },
      { id: "task", group: "Actions", label: "Create a task", icon: SquareKanban, run: go("/tasks?new=1"), keywords: "todo workflow kanban" },
      {
        id: "theme",
        group: "Actions",
        label: theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
        icon: theme === "dark" ? Sun : Moon,
        run: () => {
          setTheme(theme === "dark" ? "light" : "dark");
          close();
        },
        keywords: "theme appearance dark light",
      },
    ];
    return [...nav, ...actions];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, theme, setTheme]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? commands.filter((c) => `${c.label} ${c.keywords ?? ""} ${c.hint ?? ""}`.toLowerCase().includes(q)) : commands;
    const ask: Command[] = q
      ? [
          {
            id: "ask",
            group: "Ask AI",
            label: `Ask FadHype AI: “${query.trim()}”`,
            icon: Sparkles,
            run: () => {
              router.push(`/ai?q=${encodeURIComponent(query.trim())}`);
              close();
            },
          },
        ]
      : [];
    return [...ask, ...filtered];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commands, query, router]);

  const groups = useMemo(() => {
    const map = new Map<string, { cmd: Command; index: number }[]>();
    results.forEach((cmd, index) => {
      const list = map.get(cmd.group) ?? [];
      list.push({ cmd, index });
      map.set(cmd.group, list);
    });
    return [...map.entries()];
  }, [results]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      results[active]?.run();
    }
  };

  const change = (v: boolean) => {
    if (v) {
      setQuery("");
      setActive(0);
    }
    onOpenChange(v);
  };

  return (
    <Dialog.Root open={open} onOpenChange={change}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div className="fixed inset-0 z-[80] bg-overlay backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
                transition={{ type: "spring", stiffness: 500, damping: 36 }}
                className="fixed top-[12vh] left-1/2 z-[81] w-[calc(100vw-24px)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-line bg-surface shadow-lg"
              >
                <Dialog.Title className="sr-only">Command menu</Dialog.Title>
                <Dialog.Description className="sr-only">Search pages and actions, or ask FadHype AI.</Dialog.Description>
                <div className="flex items-center gap-3 border-b border-line px-4">
                  <Search className="size-4 shrink-0 text-subtle" aria-hidden />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setActive(0);
                    }}
                    onKeyDown={onKeyDown}
                    placeholder="Search pages, actions, or ask AI…"
                    className="h-13 min-w-0 flex-1 bg-transparent py-4 text-[14.5px] text-fg outline-none placeholder:text-subtle"
                    role="combobox"
                    aria-expanded="true"
                    aria-controls={listId}
                    aria-activedescendant={results[active] ? `${listId}-${results[active].id}` : undefined}
                    aria-autocomplete="list"
                  />
                  <Kbd>esc</Kbd>
                </div>
                <div id={listId} role="listbox" aria-label="Results" className="max-h-[min(420px,60vh)] overflow-y-auto p-2">
                  {results.length === 0 && <p className="px-3 py-8 text-center text-[13px] text-muted">No results for “{query}”.</p>}
                  {groups.map(([group, items]) => (
                    <div key={group} role="group" aria-label={group} className="mb-1">
                      <p className="px-2.5 pt-2 pb-1 text-[11px] font-medium tracking-wide text-subtle uppercase">{group}</p>
                      {items.map(({ cmd, index }) => {
                        const Icon = cmd.icon;
                        const selected = index === active;
                        return (
                          <div
                            key={cmd.id}
                            id={`${listId}-${cmd.id}`}
                            role="option"
                            aria-selected={selected}
                            onMouseMove={() => setActive(index)}
                            onClick={cmd.run}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-[13.5px] transition-colors",
                              selected ? "bg-surface-2 text-fg" : "text-fg-2",
                            )}
                          >
                            <span className={cn("grid size-7 shrink-0 place-items-center rounded-md border border-line", cmd.group === "Ask AI" ? "bg-accent-soft text-accent-ink" : "bg-surface text-muted")}>
                              <Icon className="size-3.5" aria-hidden />
                            </span>
                            <span className="min-w-0 flex-1 truncate">{cmd.label}</span>
                            {cmd.hint && <span className="hidden truncate text-[12px] text-subtle sm:block">{cmd.hint}</span>}
                            {selected && <CornerDownLeft className="size-3.5 shrink-0 text-subtle" aria-hidden />}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 border-t border-line bg-surface-2/60 px-4 py-2.5 text-[11.5px] text-subtle">
                  <span className="flex items-center gap-1.5">
                    <Kbd>↑</Kbd>
                    <Kbd>↓</Kbd> navigate
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Kbd>↵</Kbd> open
                  </span>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
