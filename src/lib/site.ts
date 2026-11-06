/**
 * Canonical origin. An explicit NEXT_PUBLIC_SITE_URL (your custom domain) wins;
 * on Vercel it falls back to the project's production URL, which Vercel provides at build time.
 */
function resolveSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

/** Public site configuration — the single source for SEO, Open Graph and structured data. */
export const site = {
  name: "Festro",
  tagline: "Digital Growth. Built Smarter.",
  description:
    "Festro is a digital growth company combining web development, SEO and GEO, paid advertising, lead generation and AI automation into one measurable growth system for modern businesses.",
  shortDescription: "Growth, technology and digital systems engineered for modern businesses.",
  url: resolveSiteUrl(),
  locale: "en_US",
  /** Public contact address for structured data. Left out unless configured, so the site never advertises an inbox nobody reads. */
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || undefined,
  keywords: [
    "digital growth agency",
    "digital marketing",
    "web development",
    "SEO services",
    "generative engine optimization",
    "AI search optimization",
    "lead generation",
    "AI automation",
    "e-commerce development",
    "conversion rate optimization",
  ],
  services: [
    "Website Development",
    "E-commerce Development",
    "SEO",
    "GEO / AI Search Optimization",
    "Lead Generation",
    "Paid Advertising",
    "Social Media Marketing",
    "Conversion Optimization",
    "AI Automation",
    "Analytics & Reporting",
    "Branding",
    "Funnel Development",
  ],
} as const;
