import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  return ["", "/privacy", "/terms", "/support"].map((path, index) => ({
    url: `${base}${path}`,
    changeFrequency: index === 0 ? "weekly" : "yearly",
    priority: index === 0 ? 1 : 0.3,
  }));
}
