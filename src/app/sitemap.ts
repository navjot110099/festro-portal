import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/** Public routes only — the authenticated portal is excluded and noindexed. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: site.url, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
