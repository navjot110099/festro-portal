import type { ActivityItem } from "@/types";

const min = 60_000;
const hour = 60 * min;

/** Workspace activity feed — timestamps relative to "now". */
export function buildActivity(now = Date.now()): ActivityItem[] {
  const at = (ms: number) => new Date(now - ms).toISOString();
  return [
    { id: "ev1", kind: "lead", title: "New qualified lead received", detail: "Harper Lyons · Lumen Dental Group — team headshots for 42 staff", at: at(4 * min), unread: true, href: "/leads" },
    { id: "ev2", kind: "ai", title: "AI identified 3 growth opportunities", detail: "Budget shift on Meta, a missing comparison page and 38 slow follow-ups", at: at(26 * min), unread: true, href: "/ai" },
    { id: "ev3", kind: "campaign", title: "Campaign ROAS crossed 4.0x", detail: "Decision makers · Case study (LinkedIn) is now at 4.6x", at: at(2 * hour), unread: true, href: "/campaigns" },
    { id: "ev4", kind: "seo", title: "SEO visibility increased 12%", detail: "“corporate headshots” moved to position 3 (+2)", at: at(5 * hour), href: "/seo" },
    { id: "ev5", kind: "report", title: "New client report generated", detail: "September performance report is ready to share", at: at(9 * hour), href: "/reports" },
    { id: "ev6", kind: "task", title: "Task moved to review", detail: "Prepare monthly client report — Aanya Kapoor", at: at(20 * hour), href: "/tasks" },
    { id: "ev7", kind: "lead", title: "Proposal accepted", detail: "Nova Solar Systems booked a brand photography day ($2,840)", at: at(27 * hour), href: "/leads" },
    { id: "ev8", kind: "system", title: "Google Ads offline conversions synced", detail: "112 conversions imported from your CRM", at: at(31 * hour) },
    { id: "ev9", kind: "seo", title: "Cited in Google AI Overviews", detail: "“How much do team headshots cost per person?”", at: at(46 * hour), href: "/seo" },
  ];
}
