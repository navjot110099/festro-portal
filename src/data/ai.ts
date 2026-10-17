import type { AiResponse } from "@/types";

export interface QuickAction {
  id: AiIntent;
  label: string;
  prompt: string;
  icon: string;
}

export type AiIntent =
  | "revenue"
  | "growth"
  | "leads"
  | "seo"
  | "report"
  | "campaigns"
  | "website"
  | "ideas"
  | "forecast"
  | "conversion"
  | "summary";

export const quickActions: QuickAction[] = [
  { id: "revenue", label: "Analyze Revenue", prompt: "Analyze my revenue performance this month and tell me what's driving it.", icon: "ChartLine" },
  { id: "growth", label: "Find Growth Opportunities", prompt: "Find the biggest growth opportunities I can act on this week.", icon: "Rocket" },
  { id: "leads", label: "Analyze Leads", prompt: "Analyze my lead pipeline — which sources and leads should we prioritise?", icon: "UsersRound" },
  { id: "seo", label: "Generate SEO Strategy", prompt: "Generate a 90-day SEO and GEO strategy for my business.", icon: "Radar" },
  { id: "report", label: "Create Client Report", prompt: "Create an executive summary for this month's client report.", icon: "FileChartColumn" },
  { id: "campaigns", label: "Optimize Campaigns", prompt: "Optimize my campaigns — where should budget move to improve ROAS?", icon: "Target" },
];

export const capabilities: { intent: AiIntent; title: string; prompt: string }[] = [
  { intent: "campaigns", title: "Analyze campaign performance", prompt: "How are my campaigns performing across Google, Meta and LinkedIn?" },
  { intent: "leads", title: "Find lead opportunities", prompt: "Which leads are most likely to convert this week?" },
  { intent: "ideas", title: "Generate marketing ideas", prompt: "Give me five marketing ideas for Q4." },
  { intent: "website", title: "Analyze website performance", prompt: "How is my website performing on speed and conversions?" },
  { intent: "conversion", title: "Identify conversion problems", prompt: "Where are we losing people in the funnel?" },
  { intent: "seo", title: "Generate SEO recommendations", prompt: "What are my top SEO recommendations right now?" },
  { intent: "report", title: "Create client reports", prompt: "Draft this month's performance report." },
  { intent: "summary", title: "Summarize analytics", prompt: "Summarize my analytics for the last 30 days." },
  { intent: "forecast", title: "Predict growth opportunities", prompt: "Forecast revenue for the next quarter." },
  { intent: "growth", title: "Recommend next actions", prompt: "What should we do next to grow fastest?" },
];

const rules: { intent: AiIntent; pattern: RegExp }[] = [
  { intent: "report", pattern: /\breport|executive summary|client summary|deck\b/i },
  { intent: "forecast", pattern: /forecast|predict|projection|next (quarter|month)|q1|outlook/i },
  { intent: "growth", pattern: /opportunit|grow(th)?\b|next (step|action)|what should (we|i) do|priorit(y|ies)/i },
  { intent: "campaigns", pattern: /campaign|roas|\bads?\b|budget|spend|meta|google ads|linkedin|ppc|paid/i },
  { intent: "seo", pattern: /\bseo\b|\bgeo\b|search|rank|keyword|backlink|organic|ai visibility|citation/i },
  { intent: "conversion", pattern: /conver|funnel|drop[- ]?off|checkout|bounce|losing/i },
  { intent: "website", pattern: /website|site speed|page speed|core web|lcp|load time|performance of (my|the) site/i },
  { intent: "leads", pattern: /lead|pipeline|prospect|crm|deal/i },
  { intent: "revenue", pattern: /revenue|sales|income|money|profit|earn/i },
  { intent: "ideas", pattern: /idea|content|post|social|creative|marketing/i },
  { intent: "summary", pattern: /summar|overview|analytics|how (are|is) (we|it|things)|performance/i },
];

export function detectIntent(prompt: string): AiIntent {
  return rules.find((r) => r.pattern.test(prompt))?.intent ?? "summary";
}

/**
 * Demo responses. Each is grounded in the same numbers the rest of the
 * portal shows. In production, `src/lib/ai/engine.ts` would send the prompt
 * plus a workspace context bundle to a model API and stream blocks back.
 */
export const responses: Record<AiIntent, AiResponse> = {
  revenue: {
    thinking: ["Reading 12 months of revenue from HubSpot and Stripe", "Comparing month-over-month and channel attribution", "Checking for anomalies and seasonality"],
    sources: ["HubSpot CRM", "Stripe", "Google Ads", "GA4"],
    blocks: [
      { type: "text", text: "Revenue is accelerating. This month is at **$18,430**, up **18.4%** on last month and the strongest month on record. The last six months total **$84,620**, 77.6% more than the six months before." },
      {
        type: "metrics",
        items: [
          { label: "This month", value: "$18,430", change: "+18.4%", positive: true },
          { label: "Last 6 months", value: "$84,620", change: "+77.6%", positive: true },
          { label: "Avg. deal value", value: "$431", change: "+6.2%", positive: true },
          { label: "Paid ROAS", value: "4.8x", change: "+0.6x", positive: true },
        ],
      },
      {
        type: "bars",
        title: "Attributed revenue by channel — this month",
        items: [
          { label: "Google Ads", value: 6870, display: "$6,870" },
          { label: "Organic SEO", value: 4120, display: "$4,120" },
          { label: "Meta Ads", value: 2960, display: "$2,960" },
          { label: "LinkedIn", value: 2240, display: "$2,240" },
          { label: "Email", value: 1540, display: "$1,540" },
          { label: "Referral", value: 700, display: "$700" },
        ],
      },
      { type: "heading", text: "What's driving it" },
      {
        type: "bullets",
        items: [
          "**Search · Corporate headshots** delivers 32% of paid revenue at a 5.3x ROAS.",
          "Organic revenue grew 21% after the team headshot guide reached position 2.",
          "Average deal value rose to $431 as more companies booked on-site team sessions.",
        ],
      },
      { type: "callout", tone: "warning", title: "Watch this", text: "Reels · Behind the lens has slipped from 2.4x to 1.7x ROAS over 14 days. It's the only paid campaign below break-even on margin." },
      { type: "actions", items: [{ label: "Open revenue analytics", href: "/analytics" }, { label: "Optimize campaigns", intent: "campaigns" }, { label: "Create client report", intent: "report" }] },
    ],
  },
  growth: {
    thinking: ["Scanning leads, campaigns and search data for gaps", "Estimating revenue impact of each opportunity", "Ranking by impact and effort"],
    sources: ["HubSpot CRM", "Meta Ads", "Search Console", "AI visibility tracker"],
    blocks: [
      { type: "text", text: "I found **three opportunities worth about $5.9K** in additional revenue this month. All three can start this week." },
      {
        type: "table",
        columns: ["Opportunity", "Impact", "Effort", "Est. value"],
        rows: [
          ["Move $280/week from Reels awareness to the consultation lead form", "High", "Low", "+$2.6K"],
          ["Contact 38 qualified leads who've waited more than 24 hours", "High", "Low", "+$2.1K"],
          ["Publish an “on-location vs studio” comparison page", "Medium", "Medium", "+$1.2K"],
        ],
      },
      { type: "callout", tone: "insight", title: "Speed to lead is your biggest lever", text: "Leads contacted within one hour convert at 14.2%. After 24 hours that drops to 5.1%, and 38 qualified leads are past that point now." },
      { type: "heading", text: "Recommended next actions" },
      {
        type: "bullets",
        items: [
          "Today: assign the 38 waiting leads and send the 72-hour delivery case study.",
          "This week: shift the Meta budget and refresh Reels creative before relaunching.",
          "Next sprint: brief the comparison page. You're currently absent from that prompt in Gemini.",
        ],
      },
      { type: "actions", items: [{ label: "Review waiting leads", href: "/leads" }, { label: "Open task board", href: "/tasks" }, { label: "Optimize campaigns", intent: "campaigns" }] },
    ],
  },
  leads: {
    thinking: ["Scoring 3,412 leads from the last 90 days", "Comparing source quality and stage velocity", "Finding stalled proposals"],
    sources: ["HubSpot CRM", "Lead scoring model", "GA4"],
    blocks: [
      { type: "text", text: "Your pipeline is healthy and getting better. **1,284 leads are qualified** (+12.6%), and conversions are up 21.4% on the previous 90 days. The quality gap between sources is wide, though." },
      {
        type: "metrics",
        items: [
          { label: "Qualified leads", value: "1,284", change: "+12.6%", positive: true },
          { label: "Conversion rate", value: "8.7%", change: "+0.8 pts", positive: true },
          { label: "Median first response", value: "3h 12m", change: "−41%", positive: true },
          { label: "Open proposals", value: "236", change: "+19.3%", positive: true },
        ],
      },
      {
        type: "bars",
        title: "Qualification rate by source",
        items: [
          { label: "Referral", value: 58, display: "58%" },
          { label: "LinkedIn", value: 49, display: "49%" },
          { label: "Organic SEO", value: 44, display: "44%" },
          { label: "Google", value: 41, display: "41%" },
          { label: "Meta Ads", value: 27, display: "27%" },
          { label: "Instagram", value: 22, display: "22%" },
        ],
      },
      {
        type: "bullets",
        items: [
          "Referral and LinkedIn leads qualify at about twice the rate of Meta and Instagram.",
          "**12 proposals** have been open for more than 7 days, worth $19.4K combined.",
          "**Harper Lyons** (Lumen Dental Group, score 86) viewed pricing 4 times this week. Call today.",
        ],
      },
      { type: "actions", items: [{ label: "View hot leads", href: "/leads" }, { label: "Find growth opportunities", intent: "growth" }] },
    ],
  },
  seo: {
    thinking: ["Reviewing rankings, technical health and backlinks", "Checking presence across 6 AI answer engines", "Mapping content gaps to commercial intent"],
    sources: ["Search Console", "Rank tracker", "AI visibility tracker", "Site crawl"],
    blocks: [
      { type: "text", text: "Your **SEO score is 87/100** and **GEO visibility is 74/100**. Technical foundations are strong, so the next gains come from comparison content, entity coverage and authority." },
      { type: "heading", text: "90-day plan" },
      {
        type: "table",
        columns: ["Phase", "Focus", "Key deliverables"],
        rows: [
          ["Days 1–30", "Capture comparison demand", "On-location vs studio guide · per-person pricing table · 7 internal links"],
          ["Days 31–60", "Expand entity coverage", "Service + FAQ schema · consistent directory profiles · 3 FAQ hubs"],
          ["Days 61–90", "Build authority", "2 regional press features · partner pages · original data study"],
        ],
      },
      {
        type: "bullets",
        items: [
          "Quick win: link 7 journal posts to /corporate-headshots with descriptive anchors.",
          "Fix mobile LCP on /event-coverage and /executive-portraits (both above 2.5s).",
          "Answer “how much do headshots cost” directly. AI engines reward concrete numbers.",
        ],
      },
      { type: "callout", tone: "insight", title: "GEO opportunity", text: "You're cited in Google AI Overviews and Perplexity but absent in Gemini for “on-location headshot day vs studio session”. A comparison page is the clearest fix." },
      { type: "actions", items: [{ label: "Open SEO & GEO", href: "/seo" }, { label: "Create content tasks", href: "/tasks" }] },
    ],
  },
  report: {
    thinking: ["Collecting this month's KPIs across all sources", "Writing the executive summary", "Formatting for client delivery"],
    sources: ["All connected sources"],
    blocks: [
      { type: "text", text: "I've drafted this month's executive summary. The full report, with charts, is ready in the Report Center." },
      { type: "heading", text: "Executive summary" },
      { type: "text", text: "Meridian Studio had its strongest month on record: **$18,430 in revenue (+18.4%)**, driven by high-intent search and a growing organic channel. Qualified leads reached 1,284 over 90 days, and paid media returned **4.8x** on ad spend. AI search visibility rose 9 points to 74/100." },
      {
        type: "metrics",
        items: [
          { label: "Revenue", value: "$18,430", change: "+18.4%", positive: true },
          { label: "Qualified leads", value: "1,284", change: "+12.6%", positive: true },
          { label: "ROAS", value: "4.8x", change: "+0.6x", positive: true },
          { label: "GEO visibility", value: "74", change: "+9 pts", positive: true },
        ],
      },
      { type: "bullets", items: ["**Win:** “corporate headshots” now ranks #3 (+2).", "**Win:** CAC fell 9.3% to $46.20.", "**Next month:** scale the consultation lead form, launch the comparison page, start the AI qualification agent."] },
      { type: "actions", items: [{ label: "Open report preview", href: "/reports" }, { label: "Analyze revenue", intent: "revenue" }] },
    ],
  },
  campaigns: {
    thinking: ["Pulling spend and conversions from Google Ads, Meta and LinkedIn", "Calculating marginal ROAS per campaign", "Simulating budget reallocation"],
    sources: ["Google Ads", "Meta Ads", "LinkedIn Ads", "HubSpot CRM"],
    blocks: [
      { type: "text", text: "Paid media is returning **4.8x** blended. Two campaigns deserve more budget and one should be cut back. Total spend can stay the same." },
      {
        type: "table",
        columns: ["Campaign", "ROAS", "Recommendation"],
        rows: [
          ["Search · Corporate headshots", "5.3x", "Raise budget 20%. Impression share is capped at 61%"],
          ["Lead form · Free consultation", "3.7x", "Scale by $280/week from Reels"],
          ["Decision makers · Case study", "4.6x", "Add a lookalike audience of converters"],
          ["Reels · Behind the lens", "1.7x", "Cut budget 70% and refresh creative"],
          ["HR leaders · Headshot day", "2.9x", "Hold while it's still in learning (day 10)"],
        ],
      },
      { type: "callout", tone: "success", title: "Projected impact", text: "Blended ROAS rises from 4.8x to about 5.3x at the same total spend, worth roughly $2.6K in extra attributed revenue this month." },
      { type: "actions", items: [{ label: "Open campaigns", href: "/campaigns" }, { label: "Find growth opportunities", intent: "growth" }] },
    ],
  },
  website: {
    thinking: ["Reading Core Web Vitals from field data", "Comparing page speed with conversion rate", "Checking the top landing pages"],
    sources: ["Chrome UX Report", "GA4", "Site crawl"],
    blocks: [
      { type: "text", text: "The site is fast and converting well. **98%** of URLs pass Core Web Vitals, and booking-page conversion is **16.4%**. Two service pages are slowing mobile visitors down." },
      {
        type: "metrics",
        items: [
          { label: "LCP (p75)", value: "1.9s", change: "−0.4s", positive: true },
          { label: "INP (p75)", value: "142ms", change: "−18ms", positive: true },
          { label: "CLS", value: "0.03", change: "±0", positive: true },
          { label: "Site conversion", value: "3.4%", change: "+0.5 pts", positive: true },
        ],
      },
      { type: "bullets", items: ["/event-coverage and /executive-portraits hero images load in 2.8s on mobile. Serve AVIF and preload them.", "Visitors who view 3+ portfolio images are 2.3x more likely to book. Surface the gallery earlier.", "The booking form's phone field causes 11% abandonment. Make it optional."] },
      { type: "actions", items: [{ label: "Open analytics", href: "/analytics" }, { label: "Identify conversion problems", intent: "conversion" }] },
    ],
  },
  ideas: {
    thinking: ["Reviewing top-performing content and seasonal demand", "Checking competitor gaps", "Generating campaign concepts"],
    sources: ["GA4", "Search Console", "Meta Ads"],
    blocks: [
      { type: "text", text: "Here are five Q4 ideas, matched to what's already working for you:" },
      {
        type: "bullets",
        items: [
          "**“New year, new headshots”** January team-day offer. Pre-sell it to HR leaders in December on LinkedIn.",
          "**Before/after LinkedIn profile series.** Short Reels with real (consented) client transformations.",
          "**The 2026 Workplace Portrait Report.** An original data study to earn press and AI citations.",
          "**Coworking partner days.** Monthly pop-up headshot sessions with revenue share.",
          "**Holiday party coverage bundle** for companies already booked for headshots.",
        ],
      },
      { type: "callout", tone: "insight", title: "Best bet", text: "The Workplace Portrait Report supports SEO, GEO, PR and sales at once. It's the highest-leverage piece on this list." },
      { type: "actions", items: [{ label: "Generate SEO strategy", intent: "seo" }, { label: "Open task board", href: "/tasks" }] },
    ],
  },
  forecast: {
    thinking: ["Fitting a trend model to 12 months of revenue", "Adjusting for Q4 seasonality and pipeline", "Simulating three scenarios"],
    sources: ["HubSpot CRM", "Stripe", "Pipeline"],
    blocks: [
      { type: "text", text: "Based on current pipeline and Q4 seasonality, next quarter's revenue should land between **$58K and $71K**. The base case is **$64.2K**." },
      {
        type: "table",
        columns: ["Scenario", "Next quarter", "Assumption"],
        rows: [
          ["Conservative", "$58.1K", "Growth slows to 6% per month"],
          ["Base", "$64.2K", "Current trend continues, Q4 seasonality applied"],
          ["Accelerated", "$71.4K", "Budget reallocation + 1-hour lead response"],
        ],
      },
      { type: "callout", tone: "success", title: "What moves you to the accelerated case", text: "Faster lead response and the Meta budget shift account for about 70% of the upside between the base and accelerated cases." },
      { type: "actions", items: [{ label: "Find growth opportunities", intent: "growth" }, { label: "Open analytics", href: "/analytics" }] },
    ],
  },
  conversion: {
    thinking: ["Mapping visitor → lead → client funnel", "Finding the largest stage drop-offs", "Comparing segments by device and source"],
    sources: ["GA4", "HubSpot CRM", "Session recordings"],
    blocks: [
      { type: "text", text: "The biggest leak is between **qualified and proposal**: only 19% of qualified leads receive a proposal within a week." },
      {
        type: "bars",
        title: "Stage conversion — last 30 days",
        items: [
          { label: "Visitor → lead", value: 2.6, display: "2.6%" },
          { label: "Lead → qualified", value: 39.2, display: "39.2%" },
          { label: "Qualified → proposal", value: 19.2, display: "19.2%" },
          { label: "Proposal → won", value: 44.8, display: "44.8%" },
        ],
      },
      { type: "bullets", items: ["Mobile visitors convert to leads at 1.9% vs 3.8% on desktop. The booking form is long on small screens.", "Leads without a reply in 24 hours rarely reach proposal.", "A proposal template with two date options improved acceptance by 12% in September."] },
      { type: "callout", tone: "warning", title: "Fix first", text: "Automate the first reply and offer a booking link instantly. The AI qualification agent (in onboarding) covers this." },
      { type: "actions", items: [{ label: "Review leads", href: "/leads" }, { label: "View services", href: "/services" }] },
    ],
  },
  summary: {
    thinking: ["Summarising the last 30 days across all sources", "Highlighting what changed", "Choosing what needs your attention"],
    sources: ["GA4", "HubSpot CRM", "Google Ads", "Meta Ads", "Search Console"],
    blocks: [
      { type: "text", text: "Here's the last 30 days at a glance. Growth is broad-based, with revenue, leads and visibility all up." },
      {
        type: "metrics",
        items: [
          { label: "Revenue", value: "$18,430", change: "+18.4%", positive: true },
          { label: "Website visitors", value: "48.2K", change: "+22.1%", positive: true },
          { label: "Conversion rate", value: "8.7%", change: "+0.8 pts", positive: true },
          { label: "CAC", value: "$46.20", change: "−9.3%", positive: true },
        ],
      },
      { type: "bullets", items: ["Organic search is your largest traffic source (34%) and still growing 16.8%.", "AI assistants now send 5% of traffic, up 61% in a month.", "Needs attention: 38 qualified leads waiting more than 24 hours."] },
      { type: "actions", items: [{ label: "Analyze revenue", intent: "revenue" }, { label: "Find growth opportunities", intent: "growth" }] },
    ],
  },
};
