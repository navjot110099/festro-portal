import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} Digital Growth Portal`,
    short_name: site.name,
    description: site.shortDescription,
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0e0a0c",
    theme_color: "#541827",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
