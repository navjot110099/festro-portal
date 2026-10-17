import type { Integration, KnowledgeArticle, SupportTicket } from "@/types";

export const knowledgeBase: KnowledgeArticle[] = [
  { id: "kb1", title: "How attribution works in your dashboard", category: "Analytics", readTime: 4, excerpt: "Understand data-driven attribution, lookback windows and why platform numbers differ." },
  { id: "kb2", title: "Connecting Google Analytics 4 and Search Console", category: "Integrations", readTime: 3, excerpt: "Grant read access in two steps and see organic data within the hour." },
  { id: "kb3", title: "What is GEO (Generative Engine Optimization)?", category: "SEO & GEO", readTime: 6, excerpt: "How AI answers choose sources, and how entity coverage and citations improve visibility." },
  { id: "kb4", title: "Reading your lead score", category: "Leads", readTime: 3, excerpt: "Scores combine fit, intent and engagement. Here's what moves a lead from 60 to 90." },
  { id: "kb5", title: "Approving tasks and deliverables", category: "Workflow", readTime: 2, excerpt: "Review items in the Tasks board and leave feedback your team sees instantly." },
  { id: "kb6", title: "Scheduling and sharing client reports", category: "Reports", readTime: 3, excerpt: "Automate monthly reports and share secure links with stakeholders." },
  { id: "kb7", title: "Asking FadHype AI better questions", category: "AI", readTime: 4, excerpt: "Prompts that produce sharper analysis — with examples for revenue, leads and SEO." },
  { id: "kb8", title: "Understanding ROAS vs ROI", category: "Campaigns", readTime: 3, excerpt: "Why a 4.8x ROAS and your true ROI are different numbers, and when each matters." },
];

export const kbCategories = ["Analytics", "Leads", "Campaigns", "SEO & GEO", "AI", "Reports", "Integrations", "Workflow"];

const hour = 3_600_000;

export function buildTickets(now = Date.now()): SupportTicket[] {
  const at = (h: number) => new Date(now - h * hour).toISOString();
  return [
    { id: "FH-2148", subject: "Add a second location to local SEO tracking", category: "SEO & GEO", priority: "normal", status: "in-progress", updatedAt: at(3), messages: 4 },
    { id: "FH-2131", subject: "LinkedIn conversions not showing in campaign report", category: "Campaigns", priority: "high", status: "resolved", updatedAt: at(30), messages: 6 },
    { id: "FH-2102", subject: "Invite our sales lead to the workspace", category: "Account", priority: "low", status: "resolved", updatedAt: at(120), messages: 2 },
  ];
}

export const systemStatus = [
  { id: "portal", label: "Portal & dashboards", status: "operational" as const },
  { id: "sync", label: "Data sync (ads, analytics, CRM)", status: "operational" as const },
  { id: "ai", label: "FadHype AI", status: "operational" as const },
  { id: "reports", label: "Report generation", status: "operational" as const },
];

export const integrations: Integration[] = [
  { id: "ga4", name: "Google Analytics 4", category: "Analytics", description: "Sessions, conversions and audiences", connected: true, lastSync: "4 min ago" },
  { id: "gsc", name: "Google Search Console", category: "Analytics", description: "Queries, rankings and indexing", connected: true, lastSync: "1 hr ago" },
  { id: "gads", name: "Google Ads", category: "Advertising", description: "Campaigns, spend and conversions", connected: true, lastSync: "12 min ago" },
  { id: "meta", name: "Meta Ads", category: "Advertising", description: "Facebook and Instagram campaigns", connected: true, lastSync: "12 min ago" },
  { id: "linkedin", name: "LinkedIn Ads", category: "Advertising", description: "B2B campaigns and lead forms", connected: true, lastSync: "30 min ago" },
  { id: "hubspot", name: "HubSpot CRM", category: "CRM", description: "Contacts, deals and lifecycle stages", connected: true, lastSync: "2 min ago" },
  { id: "supabase", name: "Supabase / PostgreSQL", category: "Data", description: "Warehouse for custom reporting", connected: true, lastSync: "1 hr ago" },
  { id: "slack", name: "Slack", category: "Communication", description: "Alerts for leads and anomalies", connected: false },
  { id: "stripe", name: "Stripe", category: "Data", description: "Revenue and payments", connected: false },
  { id: "openai", name: "AI model provider", category: "AI", description: "Bring your own model key for FadHype AI", connected: false },
];
