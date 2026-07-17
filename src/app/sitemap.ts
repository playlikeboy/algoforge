import type { MetadataRoute } from "next";
import { getSitemapPaths } from "@/lib/data/problems";
import { siteConfig } from "@/lib/config";

export const revalidate = false;

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = getSitemapPaths();
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();

  // Cap extremely large sitemaps for initial deploy; Cloudflare/Google handle multi-sitemaps later
  const limited = paths.slice(0, 45000);

  return limited.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path.startsWith("/blog") ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/problems/") ? 0.8 : 0.6,
  }));
}
