import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: ["/", "/privacy", "/terms", "/support"], disallow: ["/dashboard", "/api", "/login", "/register"] },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
