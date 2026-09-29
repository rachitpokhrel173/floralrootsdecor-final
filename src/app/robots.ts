import type { MetadataRoute } from "next";

const SITE_URL = "https://www.floralrootsdecor.com.np";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private areas: the CRM, sign-in, API routes and per-client quotation links
      disallow: ["/admin", "/login", "/api/", "/q/", "/booking-success"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
