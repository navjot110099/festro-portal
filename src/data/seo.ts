import type { AiEngineVisibility, Kpi, Recommendation, ScoreBreakdown, SeoKeyword, TrackedPrompt } from "@/types";

export const seoScore = {
  score: 87,
  change: 4,
  breakdown: [
    { label: "Technical health", score: 94, description: "Core Web Vitals pass on 98% of URLs; no crawl blockers." },
    { label: "Content quality", score: 86, description: "Strong service pages; journal posts need fresher examples." },
    { label: "Authority", score: 79, description: "Referring domains up 14% — local press is the next lever." },
    { label: "On-page UX", score: 90, description: "Clear CTAs; two pages exceed 2.5s LCP on mobile." },
  ] satisfies ScoreBreakdown[],
};

export const geoScore = {
  score: 74,
  change: 9,
  breakdown: [
    { label: "Entity coverage", score: 71, description: "Brand is recognised; service categories are under-described." },
    { label: "AI citation rate", score: 64, description: "Cited in 24% of tracked prompts. Comparison pages drive most citations." },
    { label: "Brand mentions", score: 78, description: "Mentioned across reviews, directories and partner pages." },
    { label: "Structured data", score: 88, description: "LocalBusiness, Service and FAQ schema validated." },
  ] satisfies ScoreBreakdown[],
};

export const seoKpis: Kpi[] = [
  { id: "organic-traffic", label: "Organic traffic", value: 21480, format: "number", change: 0.168, comparison: "vs previous 30 days", period: "30 days", spark: [11.2, 12.1, 12.9, 13.6, 14.4, 15.1, 15.9, 16.8, 17.6, 18.4, 19.9, 21.5] },
  { id: "keywords", label: "Ranking keywords", value: 1286, format: "number", change: 0.094, comparison: "184 in the top 10", period: "Tracked", spark: [820, 860, 905, 940, 990, 1030, 1080, 1120, 1160, 1205, 1242, 1286] },
  { id: "indexed", label: "Indexed pages", value: 342, format: "number", change: 0.041, comparison: "of 356 submitted", period: "Search Console", spark: [288, 296, 301, 309, 314, 318, 322, 327, 331, 335, 339, 342] },
  { id: "authority", label: "Domain authority", value: 46, format: "number", change: 3, changeKind: "absolute", comparison: "+3 this quarter", period: "Authority score", spark: [36, 37, 38, 39, 40, 41, 42, 43, 43, 44, 45, 46] },
  { id: "backlinks", label: "Backlinks", value: 3918, format: "number", change: 0.057, comparison: "+212 new this month", period: "From 412 domains", spark: [2980, 3060, 3140, 3230, 3310, 3390, 3480, 3560, 3640, 3720, 3810, 3918] },
  { id: "organic-leads", label: "Organic leads", value: 386, format: "number", change: 0.212, comparison: "vs previous 30 days", period: "30 days", spark: [182, 196, 214, 229, 246, 262, 281, 298, 317, 334, 352, 386] },
];

export const geoKpis: Kpi[] = [
  { id: "ai-visibility", label: "AI search visibility", value: 0.74, format: "percent", change: 0.09, changeKind: "points", comparison: "share of tracked answers", period: "30 days" },
  { id: "brand-mentions", label: "Brand mentions", value: 1148, format: "number", change: 0.186, comparison: "vs previous 30 days", period: "30 days" },
  { id: "citation-rate", label: "AI citation rate", value: 0.236, format: "percent", change: 0.051, changeKind: "points", comparison: "prompts that cite your site", period: "30 days" },
  { id: "gen-presence", label: "Generative search presence", value: 5, format: "number", change: 1, changeKind: "absolute", comparison: "of 6 tracked engines", period: "Engines" },
];

export const organicTrend = [
  { label: "Nov", organic: 11240, ai: 180 },
  { label: "Dec", organic: 12080, ai: 220 },
  { label: "Jan", organic: 12920, ai: 290 },
  { label: "Feb", organic: 13610, ai: 360 },
  { label: "Mar", organic: 14420, ai: 440 },
  { label: "Apr", organic: 15130, ai: 520 },
  { label: "May", organic: 15940, ai: 640 },
  { label: "Jun", organic: 16820, ai: 780 },
  { label: "Jul", organic: 17630, ai: 910 },
  { label: "Aug", organic: 18410, ai: 1080 },
  { label: "Sep", organic: 19870, ai: 1290 },
  { label: "Oct", organic: 21480, ai: 1560 },
];

export const keywords: SeoKeyword[] = [
  { id: "kw1", keyword: "corporate headshots", position: 3, change: 2, volume: 9900, intent: "Commercial", url: "/corporate-headshots" },
  { id: "kw2", keyword: "team headshots on location", position: 1, change: 1, volume: 2400, intent: "Transactional", url: "/corporate-headshots" },
  { id: "kw3", keyword: "brand photography for businesses", position: 5, change: 4, volume: 3600, intent: "Commercial", url: "/brand-photography" },
  { id: "kw4", keyword: "conference photographer", position: 8, change: -1, volume: 5400, intent: "Transactional", url: "/event-coverage" },
  { id: "kw5", keyword: "how to prepare for a headshot", position: 2, change: 3, volume: 8100, intent: "Informational", url: "/journal/team-headshot-guide" },
  { id: "kw6", keyword: "linkedin profile photo tips", position: 6, change: 7, volume: 12100, intent: "Informational", url: "/journal/linkedin-photo-tips" },
  { id: "kw7", keyword: "headshot photographer pricing", position: 4, change: 0, volume: 2900, intent: "Commercial", url: "/pricing" },
  { id: "kw8", keyword: "executive portrait photography", position: 11, change: 5, volume: 1900, intent: "Commercial", url: "/executive-portraits" },
  { id: "kw9", keyword: "office culture photography", position: 14, change: -2, volume: 880, intent: "Commercial", url: "/brand-photography" },
  { id: "kw10", keyword: "meridian studio", position: 1, change: 0, volume: 720, intent: "Navigational", url: "/" },
];

export const aiEngines: AiEngineVisibility[] = [
  { id: "aio", engine: "Google AI Overviews", visibility: 0.81, change: 0.07, citations: 142 },
  { id: "chatgpt", engine: "ChatGPT Search", visibility: 0.72, change: 0.12, citations: 96 },
  { id: "perplexity", engine: "Perplexity", visibility: 0.68, change: 0.09, citations: 88 },
  { id: "gemini", engine: "Gemini", visibility: 0.61, change: 0.06, citations: 54 },
  { id: "copilot", engine: "Microsoft Copilot", visibility: 0.47, change: 0.04, citations: 31 },
  { id: "claude", engine: "Claude", visibility: 0.38, change: 0.11, citations: 19 },
];

export const trackedPrompts: TrackedPrompt[] = [
  { id: "p1", prompt: "Best corporate headshot photographers for remote teams", engine: "ChatGPT Search", result: "cited", position: 2 },
  { id: "p2", prompt: "How much do team headshots cost per person?", engine: "Google AI Overviews", result: "cited", position: 1 },
  { id: "p3", prompt: "Photographer for a 300-person tech conference", engine: "Perplexity", result: "mentioned" },
  { id: "p4", prompt: "On-location headshot day vs studio session", engine: "Gemini", result: "absent" },
  { id: "p5", prompt: "Brand photography packages for B2B companies", engine: "ChatGPT Search", result: "mentioned" },
  { id: "p6", prompt: "Who offers 72-hour headshot delivery?", engine: "Perplexity", result: "cited", position: 1 },
];

export const seoRecommendations: Recommendation[] = [
  {
    id: "r1",
    title: "Create comparison content around your highest-converting service",
    description: "An “On-location headshot day vs studio session” guide targets a prompt where you're currently absent and supports your best-converting package.",
    impact: "High",
    effort: "Medium",
    category: "Content",
    estimatedLift: "+12–18% AI citations",
  },
  {
    id: "r2",
    title: "Strengthen internal links to high-value service pages",
    description: "Seven journal posts mention headshots without linking to /corporate-headshots. Add contextual links with descriptive anchors.",
    impact: "High",
    effort: "Low",
    category: "Technical",
    estimatedLift: "+6% organic leads",
  },
  {
    id: "r3",
    title: "Improve entity coverage around your primary service category",
    description: "Describe services with consistent terminology (corporate photography, team headshots, brand imagery) across site, schema and directory profiles.",
    impact: "Medium",
    effort: "Medium",
    category: "Entity",
    estimatedLift: "+8 GEO visibility pts",
  },
  {
    id: "r4",
    title: "Publish transparent per-person pricing",
    description: "AI engines favour concrete answers. A clear pricing table helps you win “how much do headshots cost” prompts.",
    impact: "Medium",
    effort: "Low",
    category: "Conversion",
    estimatedLift: "+4% booking rate",
  },
  {
    id: "r5",
    title: "Earn two local press features",
    description: "Pitch the “workplace portraits” data story to regional business publications to lift authority and brand mentions.",
    impact: "Medium",
    effort: "High",
    category: "Authority",
    estimatedLift: "+3 domain authority",
  },
];
