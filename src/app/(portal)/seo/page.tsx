import type { Metadata } from "next";
import { SeoView } from "@/views/seo-view";

export const metadata: Metadata = { title: "SEO & GEO" };

export default function Page() {
  return <SeoView />;
}
