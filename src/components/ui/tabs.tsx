"use client";

import { motion } from "framer-motion";
import { Tabs as TabsPrimitive } from "radix-ui";
import { useId } from "react";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;
export const TabsContent = TabsPrimitive.Content;

/** Underline tabs with an animated indicator. Keyboard support comes from Radix. */
export function TabsList({
  items,
  value,
  className,
  label,
}: {
  items: { value: string; label: React.ReactNode; count?: number }[];
  value: string;
  className?: string;
  label: string;
}) {
  const id = useId();
  return (
    <TabsPrimitive.List aria-label={label} className={cn("flex items-center gap-1 overflow-x-auto border-b border-line scrollbar-none", className)}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <TabsPrimitive.Trigger
            key={item.value}
            value={item.value}
            className={cn(
              "relative inline-flex h-10 shrink-0 items-center gap-2 px-3 text-[13px] font-medium transition-colors focus-visible:outline-offset-[-2px]",
              active ? "text-fg" : "text-muted hover:text-fg",
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span className={cn("rounded-full px-1.5 text-[11px] tabular", active ? "bg-accent-soft text-accent-ink" : "bg-surface-3 text-muted")}>
                {item.count}
              </span>
            )}
            {active && (
              <motion.span
                layoutId={`tab-${id}`}
                className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-accent"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
          </TabsPrimitive.Trigger>
        );
      })}
    </TabsPrimitive.List>
  );
}
