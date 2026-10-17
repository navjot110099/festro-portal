import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const PRIVATE = ["/dashboard", "/analytics", "/leads", "/ai", "/seo", "/campaigns", "/services", "/projects", "/tasks", "/reports", "/support", "/settings"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: PRIVATE }],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
