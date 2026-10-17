import { buildActivity } from "@/data/activity";
import { buildRangeSeries, channelMix, deviceSplit, funnel, topPages, type RangeSeries } from "@/data/analytics";
import { campaigns, weeklyCampaignPerformance } from "@/data/campaigns";
import { headlineInsight, primaryKpis, secondaryKpis } from "@/data/dashboard";
import { buildLeads, pipelineSummary } from "@/data/leads";
import { projects } from "@/data/projects";
import { buildRecentReports, reportTemplates } from "@/data/reports";
import { aiEngines, geoKpis, geoScore, keywords, organicTrend, seoKpis, seoRecommendations, seoScore, trackedPrompts } from "@/data/seo";
import { services } from "@/data/services";
import { buildTickets, integrations, knowledgeBase, systemStatus } from "@/data/support";
import { buildTasks } from "@/data/tasks";
import type { Kpi, TimeRange } from "@/types";
import { request } from "./client";

/**
 * Resource layer. One function per backend endpoint; each returns a Promise of
 * a typed payload. Swap the resolver bodies for REST/Supabase/CRM calls.
 */
export const api = {
  dashboard: {
    overview: () =>
      request<{ primary: Kpi[]; secondary: Kpi[]; insight: typeof headlineInsight | null }>("/dashboard/overview", () => ({ primary: primaryKpis, secondary: secondaryKpis, insight: headlineInsight }), {
        empty: { primary: [], secondary: [], insight: null },
        latency: 700,
      }),
  },
  analytics: {
    series: (range: TimeRange) =>
      request<RangeSeries | null>(`/analytics/series?range=${range}`, () => buildRangeSeries(range), { empty: null, latency: 480 }),
    breakdown: () =>
      request("/analytics/breakdown", () => ({ channels: channelMix, pages: topPages, devices: deviceSplit, funnel }), {
        empty: { channels: [], pages: [], devices: [], funnel: [] },
      }),
  },
  leads: {
    list: () => request("/leads", () => buildLeads(), { empty: [], latency: 750 }),
    summary: () => request("/leads/summary", () => pipelineSummary, { empty: null }),
  },
  campaigns: {
    list: () => request("/campaigns", () => campaigns, { empty: [] }),
    weekly: () => request("/campaigns/weekly", () => weeklyCampaignPerformance, { empty: [] }),
  },
  seo: {
    overview: () =>
      request(
        "/seo/overview",
        () => ({ seoScore, geoScore, seoKpis, geoKpis, organicTrend, keywords, aiEngines, trackedPrompts, recommendations: seoRecommendations }),
        { empty: null, latency: 800 },
      ),
  },
  services: { list: () => request("/services", () => services, { empty: [], latency: 450 }) },
  projects: { list: () => request("/projects", () => projects, { empty: [], latency: 550 }) },
  tasks: { list: () => request("/tasks", () => buildTasks(), { empty: [], latency: 550 }) },
  activity: { list: () => request("/activity", () => buildActivity(), { empty: [], latency: 600 }) },
  reports: {
    templates: () => request("/reports/templates", () => reportTemplates, { empty: [], latency: 400 }),
    recent: () => request("/reports", () => buildRecentReports(), { empty: [], latency: 500 }),
  },
  support: {
    overview: () =>
      request("/support", () => ({ articles: knowledgeBase, tickets: buildTickets(), status: systemStatus }), {
        empty: { articles: [], tickets: [], status: systemStatus },
        latency: 450,
      }),
  },
  integrations: { list: () => request("/integrations", () => integrations, { empty: [], latency: 400 }) },
};

export type Api = typeof api;
