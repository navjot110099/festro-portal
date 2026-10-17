"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface BarListItem {
  id: string;
  label: React.ReactNode;
  value: number;
  display: string;
  meta?: React.ReactNode;
}

/**
 * Ranked horizontal bars in plain HTML: one series, one hue, value at the tip.
 * Lighter than a chart runtime and fully readable by screen readers.
 */
export function BarList({
  items,
  max,
  className,
  color = "var(--chart-1)",
  ariaLabel,
}: {
  items: BarListItem[];
  max?: number;
  className?: string;
  color?: string;
  ariaLabel: string;
}) {
  const top = max ?? Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className={cn("space-y-3", className)} aria-label={ariaLabel}>
      {items.map((item, i) => (
        <li key={item.id} className="group">
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[13px]">
            <span className="min-w-0 truncate text-fg-2">{item.label}</span>
            <span className="flex shrink-0 items-baseline gap-2">
              {item.meta}
              <span className="font-medium tabular text-fg">{item.display}</span>
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full" style={{ background: `color-mix(in oklab, ${color} 12%, transparent)` }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: color }}
              initial={{ width: 0 }}
              whileInView={{ width: `${(item.value / top) * 100}%` }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.9, delay: 0.05 * i, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
