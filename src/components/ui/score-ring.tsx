"use client";

import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/use-count-up";
import { cn } from "@/lib/utils";

/** Circular score meter. The track is a lighter step of the fill so state reads across the whole ring. */
export function ScoreRing({
  value,
  max = 100,
  size = 132,
  stroke = 10,
  label,
  sublabel,
  tone = "accent",
  className,
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  label: string;
  sublabel?: string;
  tone?: "accent" | "info";
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = value / max;
  const display = Math.round(useCountUp(value, { duration: 1300 }));
  const color = tone === "accent" ? "var(--chart-1)" : "var(--chart-2)";
  return (
    <div className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" role="img" aria-label={`${label}: ${value} out of ${max}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeOpacity={0.14} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden>
        <span className="text-[28px] leading-none font-semibold tracking-tight text-fg">
          {display}
          <span className="text-sm font-medium text-subtle">/{max}</span>
        </span>
        {sublabel && <span className="mt-1.5 text-[11px] font-medium text-muted">{sublabel}</span>}
      </div>
    </div>
  );
}
