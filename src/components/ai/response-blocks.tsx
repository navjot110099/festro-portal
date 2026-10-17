"use client";

import { motion } from "framer-motion";
import { ArrowRight, CircleCheck, Lightbulb, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AiBlock } from "@/types";
import { RichText } from "./rich-text";

const appear = { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } };

export function BlockView({ block, typed, onIntent }: { block: AiBlock; typed?: string; onIntent: (intent: string, label: string) => void }) {
  switch (block.type) {
    case "text":
      return (
        <p className="text-[14px] leading-[1.7] text-fg-2">
          <RichText text={typed ?? block.text} />
          {typed !== undefined && typed.length < block.text.length && <span className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[3px] animate-caret bg-accent" aria-hidden />}
        </p>
      );
    case "heading":
      return (
        <motion.h3 {...appear} className="pt-1 text-[13.5px] font-semibold text-fg">
          {block.text}
        </motion.h3>
      );
    case "bullets":
      return (
        <ul className="space-y-2">
          {block.items.map((item, i) => (
            <motion.li key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12, duration: 0.35 }} className="flex gap-2.5 text-[14px] leading-relaxed text-fg-2">
              <span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
              <span>
                <RichText text={item} />
              </span>
            </motion.li>
          ))}
        </ul>
      );
    case "metrics":
      return (
        <motion.div {...appear} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {block.items.map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="rounded-xl border border-line bg-surface-2/60 px-3 py-2.5">
              <p className="text-[11.5px] text-muted">{m.label}</p>
              <p className="mt-0.5 text-[17px] font-semibold tracking-tight text-fg">{m.value}</p>
              {m.change && <p className={cn("text-[11.5px] font-medium", m.positive ? "text-success" : "text-danger")}>{m.change}</p>}
            </motion.div>
          ))}
        </motion.div>
      );
    case "table":
      return (
        <motion.div {...appear} className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[460px] text-left text-[13px]">
            <thead className="bg-surface-2/70 text-[11.5px] text-muted">
              <tr>
                {block.columns.map((c) => (
                  <th key={c} scope="col" className="px-3 py-2 font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {block.rows.map((r, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.08 }}>
                  {r.map((cell, j) => (
                    <td key={j} className={cn("px-3 py-2.5 align-top", j === 0 ? "font-medium text-fg" : "text-fg-2", j === r.length - 1 && "whitespace-nowrap")}>
                      {cell}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      );
    case "bars": {
      const max = Math.max(...block.items.map((b) => b.value));
      return (
        <motion.figure {...appear} className="rounded-xl border border-line bg-surface-2/40 p-4">
          <figcaption className="mb-3 text-[12px] font-medium text-muted">{block.title}</figcaption>
          <ul className="space-y-2.5">
            {block.items.map((b, i) => (
              <li key={b.label} className="grid grid-cols-[110px_1fr_auto] items-center gap-3 text-[12.5px] sm:grid-cols-[140px_1fr_auto]">
                <span className="truncate text-fg-2">{b.label}</span>
                <span className="h-2 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--chart-1)_12%,transparent)]">
                  <motion.span
                    className="block h-full rounded-full bg-chart-1"
                    initial={{ width: 0 }}
                    animate={{ width: `${(b.value / max) * 100}%` }}
                    transition={{ delay: 0.15 + i * 0.07, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  />
                </span>
                <span className="font-medium text-fg tabular">{b.display}</span>
              </li>
            ))}
          </ul>
        </motion.figure>
      );
    }
    case "callout": {
      const Icon = block.tone === "warning" ? TriangleAlert : block.tone === "success" ? CircleCheck : Lightbulb;
      const tone = block.tone === "warning" ? "border-warning/25 bg-warning-soft text-warning" : block.tone === "success" ? "border-success/20 bg-success-soft text-success" : "border-accent/20 bg-accent-soft text-accent-ink";
      return (
        <motion.div {...appear} className={cn("flex gap-3 rounded-xl border p-3.5", tone)}>
          <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p className="text-[13px] font-semibold">{block.title}</p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-fg-2">{block.text}</p>
          </div>
        </motion.div>
      );
    }
    case "actions":
      return (
        <motion.div {...appear} className="flex flex-wrap gap-2 pt-1">
          {block.items.map((a, i) =>
            a.href ? (
              <Link
                key={a.label}
                href={a.href}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-medium transition-colors",
                  i === 0 ? "bg-brand text-brand-fg shadow-brand hover:bg-brand-hover" : "border border-line bg-surface text-fg hover:bg-surface-2",
                )}
              >
                {a.label} <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            ) : (
              <button
                key={a.label}
                type="button"
                onClick={() => a.intent && onIntent(a.intent, a.label)}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-[12.5px] font-medium text-fg transition-colors hover:bg-surface-2"
              >
                {a.label}
              </button>
            ),
          )}
        </motion.div>
      );
  }
}
