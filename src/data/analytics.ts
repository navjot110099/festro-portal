import { createRandom } from "@/lib/random";
import type { ChannelShare, SeriesPoint, TimeRange } from "@/types";

/**
 * Twelve trailing "months" of business performance (oldest → newest).
 * Every chart, KPI and AI answer derives from these figures, so totals stay
 * consistent across the portal (e.g. the last six months sum to $84,620 and
 * the latest month is $18,430, +18.4% on the month before).
 */
export const monthly = {
  revenue: [6120, 6840, 7410, 8260, 9150, 9870, 10980, 12040, 13310, 14293, 15567, 18430],
  /** Same months, one year earlier — used for the 12-month comparison line. */
  revenueLastYear: [3980, 4210, 4520, 4890, 5140, 5520, 5860, 6230, 6610, 7020, 7480, 7960],
  leads: [520, 580, 640, 690, 740, 790, 840, 900, 960, 1018, 1121, 1273],
  qualifiedRate: [0.29, 0.3, 0.31, 0.32, 0.33, 0.335, 0.34, 0.345, 0.35, 0.36, 0.375, 0.392],
  conversionRate: [0.058, 0.061, 0.063, 0.066, 0.068, 0.071, 0.073, 0.075, 0.077, 0.075, 0.079, 0.087],
  visitors: [22400, 24100, 25300, 27200, 28900, 30100, 31800, 33600, 35200, 37100, 39510, 48240],
};

export const leadSources = [
  { id: "organic", label: "Organic SEO", share: 0.28 },
  { id: "google", label: "Google Ads", share: 0.24 },
  { id: "meta", label: "Meta & Instagram", share: 0.26 },
  { id: "linkedin", label: "LinkedIn", share: 0.1 },
  { id: "referral", label: "Referral", share: 0.12 },
] as const;

export type LeadSourceId = (typeof leadSources)[number]["id"];

const DAYS_PER_MONTH = 30;
const TOTAL_DAYS = DAYS_PER_MONTH * 12;

interface DailyPoint {
  date: Date;
  revenue: number;
  leads: number;
  qualified: number;
  conversionRate: number;
  visitors: number;
  sources: Record<LeadSourceId, number>;
}

/** Spread a period total across days with weekday seasonality + gentle noise, preserving the exact total. */
function distribute(total: number, weights: number[]) {
  const w = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((x) => (total * x) / w);
  const rounded = raw.map((x) => Math.round(x));
  const drift = total - rounded.reduce((a, b) => a + b, 0);
  rounded[rounded.length - 1] += drift;
  return rounded;
}

function buildDaily(asOf: Date): DailyPoint[] {
  const rand = createRandom(20261016);
  const days: DailyPoint[] = [];
  const end = new Date(asOf);
  end.setHours(12, 0, 0, 0);

  for (let m = 0; m < 12; m++) {
    const weights: number[] = [];
    const leadWeights: number[] = [];
    const dates: Date[] = [];
    for (let d = 0; d < DAYS_PER_MONTH; d++) {
      const offset = TOTAL_DAYS - 1 - (m * DAYS_PER_MONTH + d);
      const date = new Date(end);
      date.setDate(end.getDate() - offset);
      dates.push(date);
      const weekday = date.getDay();
      const weekdayFactor = weekday === 0 || weekday === 6 ? 0.84 : weekday === 2 || weekday === 3 ? 1.06 : 1;
      const ramp = 0.9 + (d / DAYS_PER_MONTH) * 0.2;
      weights.push(weekdayFactor * ramp * rand.range(0.9, 1.1));
      leadWeights.push(weekdayFactor * ramp * rand.range(0.9, 1.12));
    }
    const revenue = distribute(monthly.revenue[m], weights);
    const leads = distribute(monthly.leads[m], leadWeights);
    const visitors = distribute(monthly.visitors[m], leadWeights.map((x) => x * rand.range(0.92, 1.08)));

    for (let d = 0; d < DAYS_PER_MONTH; d++) {
      const dayLeads = leads[d];
      const qualified = Math.round(dayLeads * monthly.qualifiedRate[m] * rand.range(0.9, 1.1));
      const sources = {} as Record<LeadSourceId, number>;
      let assigned = 0;
      leadSources.forEach((s, i) => {
        if (i === leadSources.length - 1) {
          sources[s.id] = Math.max(0, dayLeads - assigned);
        } else {
          const n = Math.round(dayLeads * s.share * rand.range(0.82, 1.18));
          sources[s.id] = n;
          assigned += n;
        }
      });
      days.push({
        date: dates[d],
        revenue: revenue[d],
        leads: dayLeads,
        qualified,
        conversionRate: monthly.conversionRate[m] * rand.range(0.86, 1.14),
        visitors: visitors[d],
        sources,
      });
    }
  }
  return days;
}

let cache: { key: string; days: DailyPoint[] } | null = null;
function daily(asOf = new Date()) {
  const key = asOf.toDateString();
  if (!cache || cache.key !== key) cache = { key, days: buildDaily(asOf) };
  return cache.days;
}

const dayLabel = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
const monthLabel = (d: Date) => d.toLocaleDateString("en-US", { month: "short" });

export interface RangeSeries {
  points: (SeriesPoint & { sources: Record<LeadSourceId, number> })[];
  totals: {
    revenue: number;
    previousRevenue: number;
    leads: number;
    previousLeads: number;
    qualified: number;
    previousQualified: number;
    visitors: number;
    previousVisitors: number;
    conversionRate: number;
    previousConversionRate: number;
  };
  granularity: "day" | "week" | "month";
}

function aggregate(slice: DailyPoint[]) {
  const sources = {} as Record<LeadSourceId, number>;
  leadSources.forEach((s) => (sources[s.id] = slice.reduce((a, d) => a + d.sources[s.id], 0)));
  return {
    revenue: slice.reduce((a, d) => a + d.revenue, 0),
    leads: slice.reduce((a, d) => a + d.leads, 0),
    qualified: slice.reduce((a, d) => a + d.qualified, 0),
    visitors: slice.reduce((a, d) => a + d.visitors, 0),
    conversionRate: slice.reduce((a, d) => a + d.conversionRate, 0) / slice.length,
    sources,
  };
}

/** Build the chart series + period totals for one of the dashboard's time ranges. */
export function buildRangeSeries(range: TimeRange, asOf = new Date()): RangeSeries {
  const days = daily(asOf);

  if (range === "12m") {
    const points = Array.from({ length: 12 }, (_, m) => {
      const slice = days.slice(m * DAYS_PER_MONTH, (m + 1) * DAYS_PER_MONTH);
      const agg = aggregate(slice);
      const monthDate = new Date(asOf.getFullYear(), asOf.getMonth() - (11 - m), 1);
      return {
        date: monthDate.toISOString(),
        label: monthLabel(monthDate),
        revenue: monthly.revenue[m],
        previousRevenue: monthly.revenueLastYear[m],
        leads: monthly.leads[m],
        qualified: agg.qualified,
        conversionRate: monthly.conversionRate[m],
        visitors: monthly.visitors[m],
        sources: agg.sources,
      };
    });
    const sumOf = (k: "revenue" | "previousRevenue" | "leads" | "qualified" | "visitors") =>
      points.reduce((a, p) => a + p[k], 0);
    return {
      granularity: "month",
      points,
      totals: {
        revenue: sumOf("revenue"),
        previousRevenue: sumOf("previousRevenue"),
        leads: sumOf("leads"),
        previousLeads: Math.round(sumOf("leads") * 0.58),
        qualified: sumOf("qualified"),
        previousQualified: Math.round(sumOf("qualified") * 0.52),
        visitors: sumOf("visitors"),
        previousVisitors: Math.round(sumOf("visitors") * 0.66),
        conversionRate: monthly.conversionRate[11],
        previousConversionRate: monthly.conversionRate[0],
      },
    };
  }

  const length = range === "7d" ? 7 : range === "30d" ? 30 : 91;
  const current = days.slice(-length);
  const previous = days.slice(-length * 2, -length);
  const bucket = range === "90d" ? 7 : 1;

  const points = [];
  for (let i = 0; i < current.length; i += bucket) {
    const slice = current.slice(i, i + bucket);
    const prevSlice = previous.slice(i, i + bucket);
    const agg = aggregate(slice);
    const prev = aggregate(prevSlice);
    const first = slice[0].date;
    points.push({
      date: first.toISOString(),
      label: bucket === 1 ? dayLabel(first) : `Wk of ${dayLabel(first)}`,
      revenue: agg.revenue,
      previousRevenue: prev.revenue,
      leads: agg.leads,
      qualified: agg.qualified,
      conversionRate: agg.conversionRate,
      visitors: agg.visitors,
      sources: agg.sources,
    });
  }

  const cur = aggregate(current);
  const prev = aggregate(previous);
  return {
    granularity: bucket === 1 ? "day" : "week",
    points,
    totals: {
      revenue: cur.revenue,
      previousRevenue: prev.revenue,
      leads: cur.leads,
      previousLeads: prev.leads,
      qualified: cur.qualified,
      previousQualified: prev.qualified,
      visitors: cur.visitors,
      previousVisitors: prev.visitors,
      conversionRate: cur.conversionRate,
      previousConversionRate: prev.conversionRate,
    },
  };
}

/** Traffic acquisition mix for the last 30 days. */
export const channelMix: ChannelShare[] = [
  { id: "organic", label: "Organic search", value: 0.34, change: 0.168 },
  { id: "paid", label: "Paid search", value: 0.22, change: 0.094 },
  { id: "social", label: "Paid social", value: 0.19, change: 0.122 },
  { id: "direct", label: "Direct", value: 0.12, change: 0.031 },
  { id: "referral", label: "Referral", value: 0.08, change: 0.214 },
  { id: "ai", label: "AI assistants", value: 0.05, change: 0.612 },
];

export const topPages = [
  { path: "/corporate-headshots", title: "Corporate headshots", visitors: 9840, conversion: 0.052, change: 0.18 },
  { path: "/pricing", title: "Packages & pricing", visitors: 6120, conversion: 0.071, change: 0.09 },
  { path: "/brand-photography", title: "Brand photography", visitors: 5310, conversion: 0.038, change: 0.24 },
  { path: "/journal/team-headshot-guide", title: "The team headshot guide (2026)", visitors: 4720, conversion: 0.021, change: 0.46 },
  { path: "/book", title: "Book a session", visitors: 3180, conversion: 0.164, change: 0.15 },
  { path: "/event-coverage", title: "Conference & event coverage", visitors: 2460, conversion: 0.043, change: -0.05 },
];

export const deviceSplit = [
  { id: "mobile", label: "Mobile", value: 0.61 },
  { id: "desktop", label: "Desktop", value: 0.34 },
  { id: "tablet", label: "Tablet", value: 0.05 },
];

export const funnel = [
  { id: "visitors", label: "Visitors", value: 48240 },
  { id: "leads", label: "Leads", value: 1273 },
  { id: "qualified", label: "Qualified", value: 499 },
  { id: "proposal", label: "Proposal sent", value: 96 },
  { id: "won", label: "Won", value: 43 },
];
