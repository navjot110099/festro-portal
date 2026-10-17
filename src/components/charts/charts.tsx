"use client";

import { useReducedMotion } from "framer-motion";
import { useId } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
  type TooltipValueType,
} from "recharts";
import { formatChange } from "@/lib/format";
import { axisProps, ChartTooltipCard, gridProps, series, type TooltipRow } from "./chart-kit";

type Row = { label: string };
const read = (row: Row, key: string) => Number((row as Record<string, unknown>)[key] ?? 0);
type Formatter = (v: number) => string;

const MUTED_SERIES = "var(--chart-axis)";

function useAnimation() {
  const reduce = useReducedMotion();
  return { isAnimationActive: !reduce, animationDuration: 900, animationEasing: "ease-out" as const };
}

/* ------------------------------------------------------------------ Trend */

/**
 * One measure over time with an optional previous-period comparison line.
 * Two series of the same unit share the single y-axis (never dual-axis).
 */
export function TrendChart({
  data,
  dataKey,
  compareKey,
  format,
  axisFormat,
  height = 280,
  name,
  compareName = "Previous period",
  color = series[1],
  tickInterval,
}: {
  data: Row[];
  dataKey: string;
  compareKey?: string;
  format: Formatter;
  axisFormat?: Formatter;
  height?: number;
  name: string;
  compareName?: string;
  color?: string;
  tickInterval?: number | "preserveStartEnd";
}) {
  const gid = useId().replace(/:/g, "");
  const anim = useAnimation();

  const content = ({ active, payload, label }: TooltipContentProps<TooltipValueType, string | number>) => {
    if (!active || !payload?.length) return null;
    const cur = Number(payload.find((p) => p.dataKey === dataKey)?.value ?? 0);
    const prev = compareKey ? Number(payload.find((p) => p.dataKey === compareKey)?.value ?? 0) : null;
    const rows: TooltipRow[] = [{ key: "cur", label: name, value: format(cur), color }];
    if (prev !== null) rows.push({ key: "prev", label: compareName, value: format(prev), color: MUTED_SERIES, muted: true });
    const change = prev ? cur / prev - 1 : null;
    return (
      <ChartTooltipCard
        title={String(label)}
        rows={rows}
        footer={
          change !== null ? (
            <span className={change >= 0 ? "font-medium text-success" : "font-medium text-danger"}>{formatChange(change)} vs comparison</span>
          ) : undefined
        }
      />
    );
  };

  return (
    <AreaChart responsive data={data} style={{ width: "100%", height }} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
      <defs>
        <linearGradient id={`fill-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.16} />
          <stop offset="100%" stopColor={color} stopOpacity={0.01} />
        </linearGradient>
      </defs>
      <CartesianGrid {...gridProps} />
      <XAxis dataKey="label" {...axisProps} interval={tickInterval ?? "preserveStartEnd"} minTickGap={24} tickMargin={10} />
      <YAxis {...axisProps} width={48} tickFormatter={axisFormat ?? format} tickMargin={4} />
      <Tooltip content={content} cursor={{ stroke: "var(--line-strong)", strokeWidth: 1 }} />
      {compareKey && (
        <Area
          type="monotone"
          dataKey={compareKey}
          name={compareName}
          stroke={MUTED_SERIES}
          strokeOpacity={0.55}
          strokeWidth={1.5}
          strokeDasharray="4 4"
          fill="transparent"
          dot={false}
          activeDot={false}
          {...anim}
        />
      )}
      <Area
        type="monotone"
        dataKey={dataKey}
        name={name}
        stroke={color}
        strokeWidth={2}
        fill={`url(#fill-${gid})`}
        dot={false}
        activeDot={{ r: 4.5, strokeWidth: 2, stroke: "var(--surface)", fill: color }}
        {...anim}
      />
    </AreaChart>
  );
}

/* ----------------------------------------------------------- Stacked bars */

export function StackedBars({
  data,
  keys,
  format,
  height = 280,
}: {
  data: Row[];
  keys: { key: string; label: string; color: string }[];
  format: Formatter;
  height?: number;
}) {
  const anim = useAnimation();
  const content = ({ active, payload, label }: TooltipContentProps<TooltipValueType, string | number>) => {
    if (!active || !payload?.length) return null;
    const total = payload.reduce((a, p) => a + Number(p.value ?? 0), 0);
    const rows: TooltipRow[] = [...keys].reverse().map((k) => {
      const v = Number(payload.find((p) => p.dataKey === k.key)?.value ?? 0);
      return { key: k.key, label: k.label, value: format(v), color: k.color };
    });
    return <ChartTooltipCard title={String(label)} rows={rows} footer={<span className="flex justify-between text-fg-2"><span>Total</span><span className="font-semibold tabular text-fg">{format(total)}</span></span>} />;
  };
  const barSize = data.length > 20 ? 10 : data.length > 10 ? 16 : 22;
  return (
    <BarChart responsive data={data} style={{ width: "100%", height }} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
      <CartesianGrid {...gridProps} />
      <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" minTickGap={24} tickMargin={10} />
      <YAxis {...axisProps} width={40} tickFormatter={format} />
      <Tooltip content={content} cursor={{ fill: "var(--surface-3)", opacity: 0.5 }} />
      {keys.map((k, i) => (
        <Bar
          key={k.key}
          dataKey={k.key}
          name={k.label}
          stackId="s"
          fill={k.color}
          barSize={barSize}
          stroke="var(--surface)"
          strokeWidth={1}
          radius={i === keys.length - 1 ? [4, 4, 0, 0] : 0}
          {...anim}
        />
      ))}
    </BarChart>
  );
}

/* ------------------------------------------------------------- Line chart */

export function RateLineChart({
  data,
  dataKey,
  name,
  target,
  targetLabel,
  format,
  height = 240,
  color = series[2],
}: {
  data: Row[];
  dataKey: string;
  name: string;
  target?: number;
  targetLabel?: string;
  format: Formatter;
  height?: number;
  color?: string;
}) {
  const anim = useAnimation();
  const values = data.map((d) => read(d, dataKey));
  const min = Math.min(...values, target ?? Infinity);
  const max = Math.max(...values, target ?? -Infinity);
  const pad = (max - min) * 0.25 || 0.01;
  const content = ({ active, payload, label }: TooltipContentProps<TooltipValueType, string | number>) => {
    if (!active || !payload?.length) return null;
    const v = Number(payload[0].value ?? 0);
    const rows: TooltipRow[] = [{ key: "v", label: name, value: format(v), color }];
    return (
      <ChartTooltipCard
        title={String(label)}
        rows={rows}
        footer={
          target !== undefined ? (
            <span className={v >= target ? "font-medium text-success" : "font-medium text-warning"}>
              {v >= target ? "Above" : "Below"} target ({format(target)})
            </span>
          ) : undefined
        }
      />
    );
  };
  return (
    <LineChart responsive data={data} style={{ width: "100%", height }} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
      <CartesianGrid {...gridProps} />
      <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" minTickGap={24} tickMargin={10} />
      <YAxis {...axisProps} width={44} tickFormatter={format} domain={[Math.max(0, min - pad), max + pad]} />
      <Tooltip content={content} cursor={{ stroke: "var(--line-strong)", strokeWidth: 1 }} />
      {target !== undefined && (
        <ReferenceLine
          y={target}
          stroke="var(--chart-axis)"
          strokeOpacity={0.7}
          strokeDasharray="4 4"
          label={{ value: targetLabel ?? "Target", position: "insideTopRight", fill: "var(--muted)", fontSize: 11 }}
        />
      )}
      <Line
        type="monotone"
        dataKey={dataKey}
        name={name}
        stroke={color}
        strokeWidth={2}
        dot={false}
        activeDot={{ r: 4.5, strokeWidth: 2, stroke: "var(--surface)", fill: color }}
        {...anim}
      />
    </LineChart>
  );
}

/* ----------------------------------------------------------- Grouped bars */

export function GroupedBars({
  data,
  keys,
  format,
  height = 260,
  layout = "horizontal",
}: {
  data: Row[];
  keys: { key: string; label: string; color: string }[];
  format: Formatter;
  height?: number;
  layout?: "horizontal" | "vertical";
}) {
  const anim = useAnimation();
  const content = ({ active, payload, label }: TooltipContentProps<TooltipValueType, string | number>) => {
    if (!active || !payload?.length) return null;
    const rows: TooltipRow[] = keys.map((k) => ({
      key: k.key,
      label: k.label,
      value: format(Number(payload.find((p) => p.dataKey === k.key)?.value ?? 0)),
      color: k.color,
    }));
    const a = Number(payload.find((p) => p.dataKey === keys[0].key)?.value ?? 0);
    const b = Number(payload.find((p) => p.dataKey === keys[1]?.key)?.value ?? 0);
    return (
      <ChartTooltipCard
        title={String(label)}
        rows={rows}
        footer={keys.length === 2 && a > 0 ? <span className="flex justify-between text-fg-2"><span>Return</span><span className="font-semibold tabular text-fg">{(b / a).toFixed(1)}x</span></span> : undefined}
      />
    );
  };
  const vertical = layout === "vertical";
  return (
    <BarChart
      responsive
      data={data}
      layout={vertical ? "vertical" : "horizontal"}
      style={{ width: "100%", height }}
      margin={{ top: 8, right: 8, bottom: 0, left: vertical ? 8 : 0 }}
      barGap={3}
      barCategoryGap={vertical ? "28%" : "24%"}
    >
      <CartesianGrid {...gridProps} vertical={vertical} horizontal={!vertical} />
      {vertical ? (
        <>
          <XAxis type="number" {...axisProps} tickFormatter={format} />
          <YAxis type="category" dataKey="label" {...axisProps} width={92} />
        </>
      ) : (
        <>
          <XAxis dataKey="label" {...axisProps} tickMargin={10} />
          <YAxis {...axisProps} width={48} tickFormatter={format} />
        </>
      )}
      <Tooltip content={content} cursor={{ fill: "var(--surface-3)", opacity: 0.5 }} />
      {keys.map((k) => (
        <Bar key={k.key} dataKey={k.key} name={k.label} fill={k.color} maxBarSize={22} radius={vertical ? [0, 4, 4, 0] : [4, 4, 0, 0]} {...anim} />
      ))}
    </BarChart>
  );
}
