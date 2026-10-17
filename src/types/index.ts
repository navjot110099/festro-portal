/**
 * Domain model for the FadHype portal.
 *
 * These types are the contract between the UI and the data layer
 * (`src/lib/api`). Mock data in `src/data` satisfies them today; a REST API,
 * Supabase/PostgreSQL tables, a CRM or ad-platform connector can satisfy
 * them later without touching components.
 */

export type ID = string;

export type TimeRange = "7d" | "30d" | "90d" | "12m";

export type Trend = "up" | "down" | "flat";

/* ------------------------------------------------------------------ team */

export interface TeamMember {
  id: ID;
  name: string;
  role: string;
  initials: string;
  /** Hue used for the avatar tint (0–360). */
  hue: number;
  email: string;
}

export interface CurrentUser {
  id: ID;
  firstName: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  workspace: string;
  plan: string;
}

/* ---------------------------------------------------------------- metrics */

export type MetricFormat = "currency" | "currencyPrecise" | "number" | "compact" | "percent" | "multiplier";

export interface Kpi {
  id: string;
  label: string;
  value: number;
  format: MetricFormat;
  /** Relative change vs previous period, as a fraction (0.184 = +18.4%). */
  change: number;
  /** How to express the change: relative percent, or absolute points / units. */
  changeKind?: "percent" | "points" | "absolute" | "multiplier";
  comparison: string;
  /** For metrics like CAC a decrease is good. */
  inverse?: boolean;
  period: string;
  spark?: number[];
  hint?: string;
}

export interface SeriesPoint {
  /** ISO date (day or month start) */
  date: string;
  label: string;
  revenue: number;
  previousRevenue: number;
  leads: number;
  qualified: number;
  conversionRate: number;
  visitors: number;
}

export interface ChannelShare {
  id: string;
  label: string;
  value: number;
  change: number;
}

/* ------------------------------------------------------------------ leads */

export type LeadStatus = "new" | "qualified" | "contacted" | "proposal" | "converted" | "lost";

export type LeadSource = "Google" | "Instagram" | "Meta Ads" | "Organic SEO" | "Referral" | "LinkedIn";

export interface LeadActivity {
  id: ID;
  type: "created" | "email" | "call" | "meeting" | "note" | "status" | "visit" | "form";
  title: string;
  detail?: string;
  at: string;
  by?: string;
}

export interface Lead {
  id: ID;
  name: string;
  initials: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  source: LeadSource;
  campaign: string;
  status: LeadStatus;
  score: number;
  value: number;
  assignedTo: ID;
  lastActivity: string;
  createdAt: string;
  interest: string;
  insight: string;
  activity: LeadActivity[];
}

/* -------------------------------------------------------------- campaigns */

export type CampaignPlatform = "Google Ads" | "Meta Ads" | "LinkedIn" | "Organic" | "Email";
export type CampaignStatus = "active" | "paused" | "learning" | "completed";

export interface Campaign {
  id: ID;
  name: string;
  platform: CampaignPlatform;
  objective: string;
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  conversions: number;
  revenue: number;
  status: CampaignStatus;
  startDate: string;
  /** 14-day ROAS trend */
  trend: number[];
}

/* ------------------------------------------------------------ SEO and GEO */

export interface ScoreBreakdown {
  label: string;
  score: number;
  description: string;
}

export interface SeoKeyword {
  id: ID;
  keyword: string;
  position: number;
  change: number;
  volume: number;
  intent: "Commercial" | "Transactional" | "Informational" | "Navigational";
  url: string;
}

export interface AiEngineVisibility {
  id: string;
  engine: string;
  visibility: number;
  change: number;
  citations: number;
}

export interface TrackedPrompt {
  id: ID;
  prompt: string;
  engine: string;
  result: "cited" | "mentioned" | "absent";
  position?: number;
}

export interface Recommendation {
  id: ID;
  title: string;
  description: string;
  impact: "High" | "Medium" | "Low";
  effort: "Low" | "Medium" | "High";
  category: "Content" | "Technical" | "Authority" | "Entity" | "Conversion";
  estimatedLift: string;
}

/* --------------------------------------------------------------- services */

export type ServiceStatus = "active" | "onboarding" | "recommended" | "available";
export type ServiceCategory = "Build" | "Grow" | "Optimize" | "Automate";

export interface Service {
  id: ID;
  name: string;
  icon: string;
  category: ServiceCategory;
  description: string;
  status: ServiceStatus;
  metric: { label: string; value: string };
  deliverables: string[];
  startingAt?: string;
}

/* --------------------------------------------------------------- projects */

export type ProjectStatus = "live" | "in-progress" | "completed";

export interface Project {
  id: ID;
  name: string;
  industry: string;
  services: string[];
  status: ProjectStatus;
  summary: string;
  headline: string;
  metrics: { label: string; value: string }[];
  challenge: string;
  approach: string[];
  duration: string;
  year: number;
  /** Visual identity for the generated thumbnail */
  visual: { hue: number; accentHue: number; layout: "store" | "dashboard" | "editorial" | "app" | "landing" };
}

/* ------------------------------------------------------------------ tasks */

export type TaskStatus = "todo" | "in-progress" | "review" | "done";
export type TaskPriority = "urgent" | "high" | "medium" | "low";

export interface Task {
  id: ID;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  tag: "SEO" | "Paid Media" | "Content" | "Reporting" | "Web" | "CRM" | "Automation";
  assignees: ID[];
  due: string;
  progress: number;
  subtasks: { done: number; total: number };
  comments: number;
}

/* --------------------------------------------------------------- activity */

export type ActivityKind = "lead" | "seo" | "campaign" | "report" | "ai" | "task" | "system";

export interface ActivityItem {
  id: ID;
  kind: ActivityKind;
  title: string;
  detail: string;
  at: string;
  unread?: boolean;
  href?: string;
}

/* ---------------------------------------------------------------- reports */

export type ReportType = "monthly" | "seo" | "campaign" | "lead" | "roi";

export interface ReportTemplate {
  id: ReportType;
  name: string;
  description: string;
  sections: string[];
  pages: number;
}

export interface GeneratedReport {
  id: ID;
  type: ReportType;
  name: string;
  period: string;
  createdAt: string;
  status: "ready" | "scheduled" | "generating";
  size: string;
}

/* ---------------------------------------------------------------- support */

export interface KnowledgeArticle {
  id: ID;
  title: string;
  category: string;
  readTime: number;
  excerpt: string;
}

export interface SupportTicket {
  id: ID;
  subject: string;
  category: string;
  priority: "low" | "normal" | "high";
  status: "open" | "in-progress" | "resolved";
  updatedAt: string;
  messages: number;
}

/* ----------------------------------------------------------- integrations */

export interface Integration {
  id: ID;
  name: string;
  category: "Analytics" | "Advertising" | "CRM" | "Data" | "Communication" | "AI";
  description: string;
  connected: boolean;
  lastSync?: string;
}

/* --------------------------------------------------------------------- AI */

export type AiBlock =
  | { type: "text"; text: string }
  | { type: "heading"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "metrics"; items: { label: string; value: string; change?: string; positive?: boolean }[] }
  | { type: "table"; columns: string[]; rows: string[][] }
  | { type: "bars"; title: string; items: { label: string; value: number; display: string }[] }
  | { type: "callout"; tone: "insight" | "warning" | "success"; title: string; text: string }
  | { type: "actions"; items: { label: string; href?: string; intent?: string }[] };

export interface AiResponse {
  thinking: string[];
  blocks: AiBlock[];
  sources: string[];
}

export interface ChatMessage {
  id: ID;
  role: "user" | "assistant";
  content: string;
  response?: AiResponse;
  createdAt: number;
}
