import type { MetadataRoute } from "next";

const SITE_URL = "https://www.floralrootsdecor.com.np";

// Public marketing pages only — admin, login and client quotation links stay out.
const PAGES: { path: string; priority: number; changeFrequency: "weekly" | "monthly" }[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/services", priority: 0.9, changeFrequency: "monthly" },
  { path: "/packages", priority: 0.9, changeFrequency: "monthly" },
  { path: "/designs", priority: 0.8, changeFrequency: "weekly" },
  { path: "/book", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PAGES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
