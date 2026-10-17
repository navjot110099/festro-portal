import { monthly } from "@/data/analytics";
import { campaignTotals } from "@/data/campaigns";
import { pipelineSummary } from "@/data/leads";
import type { Kpi } from "@/types";

const last = <T,>(arr: T[], n = 1) => arr.slice(-n);
const sumOf = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

const revenue6 = sumOf(last(monthly.revenue, 6));
const revenuePrev6 = sumOf(monthly.revenue.slice(0, 6));
const [prevMonth, thisMonth] = last(monthly.revenue, 2);
const [prevVisitors, visitors] = last(monthly.visitors, 2);
const [prevConv, conv] = last(monthly.conversionRate, 2);
const totals = campaignTotals();
const cac = totals.spend / totals.conversions;

/**
 * Primary KPIs (the first row) answer "is the business growing?".
 * Secondary KPIs explain why. Values are derived from the shared data so they
 * reconcile with charts, campaign tables and AI answers.
 */
export const primaryKpis: Kpi[] = [
  {
    id: "total-revenue",
    label: "Total revenue",
    value: revenue6,
    format: "currency",
    change: revenue6 / revenuePrev6 - 1,
    comparison: "vs previous 6 months",
    period: "Last 6 months",
    spark: monthly.revenue,
  },
  {
    id: "revenue-month",
    label: "Revenue this month",
    value: thisMonth,
    format: "currency",
    change: thisMonth / prevMonth - 1,
    comparison: "vs previous month",
    period: "Month to date",
    spark: monthly.revenue.slice(-8),
  },
  {
    id: "qualified-leads",
    label: "Qualified leads",
    value: pipelineSummary.byStatus.qualified,
    format: "number",
    change: pipelineSummary.change.qualified,
    comparison: "vs previous 90 days",
    period: "Last 90 days",
    spark: monthly.leads.map((l, i) => Math.round(l * monthly.qualifiedRate[i])),
  },
  {
    id: "conversion-rate",
    label: "Conversion rate",
    value: conv,
    format: "percent",
    change: conv - prevConv,
    changeKind: "points",
    comparison: "vs previous month",
    period: "Qualified → client",
    spark: monthly.conversionRate,
  },
];

export const secondaryKpis: Kpi[] = [
  {
    id: "active-campaigns",
    label: "Active campaigns",
    value: totals.active,
    format: "number",
    change: 2,
    changeKind: "absolute",
    comparison: "launched this month",
    period: "Across 5 platforms",
  },
  {
    id: "cac",
    label: "Client acquisition cost",
    value: cac,
    format: "currencyPrecise",
    change: -0.093,
    comparison: "vs previous month",
    inverse: true,
    period: "Blended",
  },
  {
    id: "roi",
    label: "Return on ad spend",
    value: totals.roas,
    format: "multiplier",
    change: 0.6,
    changeKind: "multiplier",
    comparison: "vs previous month",
    period: "Paid media",
  },
  {
    id: "visitors",
    label: "Website visitors",
    value: visitors,
    format: "compact",
    change: visitors / prevVisitors - 1,
    comparison: "vs previous month",
    period: "Last 30 days",
  },
];

/** The headline AI insight surfaced on the dashboard. */
export const headlineInsight = {
  title: "3 growth opportunities identified",
  detail: "Reallocating $280 from Reels awareness to the consultation lead form and following up 38 waiting leads could add ≈ $5.9K this month.",
  value: 5900,
};
