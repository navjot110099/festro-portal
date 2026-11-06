"use client";

import { cn } from "@/lib/utils";

/** Categorical slots — fixed order, never cycled (validated for CVD separation in both themes). */
export const series = {
  1: "var(--chart-1)",
  2: "var(--chart-2)",
  3: "var(--chart-3)",
  4: "var(--chart-4)",
  5: "var(--chart-5)",
} as const;

export const axisProps = {
  tick: { fill: "var(--chart-axis)", fontSize: 11 },
  tickLine: false,
  axisLine: false,
} as const;

export const gridProps = {
  stroke: "var(--chart-grid)",
  strokeDasharray: undefined,
  vertical: false,
} as const;

export interface TooltipRow {
  key: string;
  label: string;
  value: string;
  color?: string;
  muted?: boolean;
}

/** Shared tooltip chrome. Text stays in ink tokens; the swatch carries identity. */
export function ChartTooltipCard({ title, rows, footer }: { title: string; rows: TooltipRow[]; footer?: React.ReactNode }) {
  return (
    <div className="min-w-44 rounded-xl border border-line bg-surface/95 px-3 py-2.5 shadow-lg backdrop-blur-sm">
      <p className="mb-1.5 text-micro font-medium text-muted">{title}</p>
      <div className="space-y-1">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center justify-between gap-5 text-caption">
            <span className="flex items-center gap-2 text-fg-2">
              {r.color && <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: r.color, opacity: r.muted ? 0.55 : 1 }} aria-hidden />}
              {r.label}
            </span>
            <span className={cn("font-semibold tabular", r.muted ? "text-muted" : "text-fg")}>{r.value}</span>
          </div>
        ))}
      </div>
      {footer && <div className="mt-2 border-t border-line pt-2 text-micro">{footer}</div>}
    </div>
  );
}

export function Legend({ items, className }: { items: { label: string; color: string; dashed?: boolean; muted?: boolean }[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5", className)} aria-label="Legend">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-2 text-caption text-muted">
          {i.dashed ? (
            <svg width="16" height="4" aria-hidden>
              <line x1="0" y1="2" x2="16" y2="2" stroke={i.color} strokeWidth="2" strokeDasharray="3 3" strokeLinecap="round" />
            </svg>
          ) : (
            <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: i.color, opacity: i.muted ? 0.5 : 1 }} aria-hidden />
          )}
          {i.label}
        </li>
      ))}
    </ul>
  );
}

/** Lightweight inline sparkline (SVG, no chart runtime) for KPI tiles. */
export function Sparkline({
  data,
  className,
  color = "var(--chart-1)",
  height = 36,
  width = 112,
  highlightLast = true,
}: {
  data: number[];
  className?: string;
  color?: string;
  height?: number;
  width?: number;
  highlightLast?: boolean;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pad = 4;
  const x = (i: number) => pad + (i / (data.length - 1)) * (width - pad * 2);
  const y = (v: number) => pad + (1 - (v - min) / (max - min || 1)) * (height - pad * 2);
  const d = data.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${d} L${x(data.length - 1)},${height} L${x(0)},${height} Z`;
  const lx = x(data.length - 1);
  const ly = y(data[data.length - 1]);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className={cn("overflow-visible", className)} aria-hidden>
      <path d={area} fill={color} opacity={0.09} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="[stroke-dasharray:400] [stroke-dashoffset:400] motion-safe:animate-[draw_1.4s_cubic-bezier(0.16,1,0.3,1)_forwards] motion-reduce:[stroke-dashoffset:0]" />
      {highlightLast && <circle cx={lx} cy={ly} r={3} fill={color} stroke="var(--surface)" strokeWidth={2} />}
    </svg>
  );
}

/** Accessible data table alternative for any chart. */
export function ChartDataTable({ caption, columns, rows }: { caption: string; columns: string[]; rows: (string | number)[][] }) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c} scope="col">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((cell, j) => (j === 0 ? <th key={j} scope="row">{cell}</th> : <td key={j}>{cell}</td>))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
