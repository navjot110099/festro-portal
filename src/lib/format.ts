import type { MetricFormat } from "@/types";

const LOCALE = "en-US";

const currency0 = new Intl.NumberFormat(LOCALE, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const currency2 = new Intl.NumberFormat(LOCALE, { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const integer = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const compactFmt = new Intl.NumberFormat(LOCALE, { notation: "compact", maximumFractionDigits: 1 });
const compactCurrency = new Intl.NumberFormat(LOCALE, { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });

export const formatCurrency = (v: number) => currency0.format(v);
export const formatCurrencyPrecise = (v: number) => currency2.format(v);
export const formatCompactCurrency = (v: number) => compactCurrency.format(v);
export const formatNumber = (v: number) => integer.format(v);
export const formatCompact = (v: number) => compactFmt.format(v);
export const formatPercent = (v: number, digits = 1) => `${(v * 100).toFixed(digits)}%`;
export const formatMultiplier = (v: number) => `${v.toFixed(1)}x`;

export function formatMetric(value: number, format: MetricFormat) {
  switch (format) {
    case "currency":
      return formatCurrency(value);
    case "currencyPrecise":
      return formatCurrencyPrecise(value);
    case "compact":
      return formatCompact(value);
    case "percent":
      return formatPercent(value);
    case "multiplier":
      return formatMultiplier(value);
    default:
      return formatNumber(value);
  }
}

/** Signed change label: "+18.4%", "−9.3%", "+1.2 pts", "+0.6x". */
export function formatChange(change: number, kind: "percent" | "points" | "absolute" | "multiplier" = "percent") {
  const sign = change > 0 ? "+" : change < 0 ? "−" : "±";
  const abs = Math.abs(change);
  switch (kind) {
    case "points":
      return `${sign}${(abs * 100).toFixed(1)} pts`;
    case "absolute":
      return `${sign}${integer.format(abs)}`;
    case "multiplier":
      return `${sign}${abs.toFixed(1)}x`;
    default:
      return `${sign}${(abs * 100).toFixed(1)}%`;
  }
}

const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto", style: "short" });

/** "2 min ago", "yesterday", "3 days ago" */
export function formatRelative(iso: string, now: number = Date.now()) {
  const diff = new Date(iso).getTime() - now;
  const abs = Math.abs(diff);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (abs < minute) return "just now";
  if (abs < hour) return rtf.format(Math.round(diff / minute), "minute");
  if (abs < day) return rtf.format(Math.round(diff / hour), "hour");
  if (abs < 7 * day) return rtf.format(Math.round(diff / day), "day");
  return formatDate(iso);
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) {
  return new Intl.DateTimeFormat(LOCALE, opts).format(new Date(iso));
}

export function formatDateLong(iso: string) {
  return formatDate(iso, { month: "long", day: "numeric", year: "numeric" });
}

/** Days from now until the given date (negative when overdue). */
export function daysUntil(iso: string, now: number = Date.now()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - start.getTime()) / 86_400_000);
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return "Good evening";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
