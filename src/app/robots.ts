import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: ["/", "/privacy", "/terms", "/support"], disallow: ["/dashboard", "/api", "/login", "/register", "/forgot-password", "/reset-password"] },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
