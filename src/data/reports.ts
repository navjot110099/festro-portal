import type { GeneratedReport, ReportTemplate } from "@/types";

export const reportTemplates: ReportTemplate[] = [
  {
    id: "monthly",
    name: "Monthly Performance Report",
    description: "Executive summary of revenue, leads, campaigns and search — the report owners actually read.",
    sections: ["Executive summary", "Revenue & conversions", "Lead pipeline", "Campaigns", "SEO & GEO", "Next month's plan"],
    pages: 8,
  },
  {
    id: "seo",
    name: "SEO & GEO Report",
    description: "Rankings, organic traffic, AI visibility, citations and the content roadmap.",
    sections: ["Search visibility", "Keyword movement", "AI engine presence", "Technical health", "Recommendations"],
    pages: 6,
  },
  {
    id: "campaign",
    name: "Campaign Report",
    description: "Spend, ROAS and creative performance by platform with budget recommendations.",
    sections: ["Spend & ROAS", "Platform breakdown", "Creative insights", "Budget plan"],
    pages: 5,
  },
  {
    id: "lead",
    name: "Lead Report",
    description: "Pipeline health, source quality, response times and conversion by stage.",
    sections: ["Pipeline overview", "Source quality", "Speed to lead", "Stage conversion"],
    pages: 4,
  },
  {
    id: "roi",
    name: "ROI Report",
    description: "Investment vs attributed return across every Festro service on your plan.",
    sections: ["Investment summary", "Attributed revenue", "Payback period", "Forecast"],
    pages: 4,
  },
];

const day = 86_400_000;

export function buildRecentReports(now = Date.now()): GeneratedReport[] {
  const d = (n: number) => new Date(now - n * day).toISOString();
  const month = (offset: number) =>
    new Date(new Date(now).getFullYear(), new Date(now).getMonth() - offset, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  return [
    { id: "rp1", type: "monthly", name: "Monthly Performance Report", period: month(1), createdAt: d(0.4), status: "ready", size: "2.4 MB" },
    { id: "rp2", type: "seo", name: "SEO & GEO Report", period: month(1), createdAt: d(2), status: "ready", size: "1.8 MB" },
    { id: "rp3", type: "campaign", name: "Campaign Report", period: "Last 30 days", createdAt: d(6), status: "ready", size: "1.2 MB" },
    { id: "rp4", type: "roi", name: "ROI Report", period: "Q3", createdAt: d(15), status: "ready", size: "0.9 MB" },
    { id: "rp5", type: "monthly", name: "Monthly Performance Report", period: month(0), createdAt: new Date(now + 15 * day).toISOString(), status: "scheduled", size: "—" },
  ];
}
