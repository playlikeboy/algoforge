import type { MetadataRoute } from "next";
import { getSitemapPaths } from "@/lib/data/problems";
import { absoluteUrl } from "@/lib/seo/metadata";

export const revalidate = false;

export default function sitemap(): MetadataRoute.Sitemap {
  return getSitemapPaths().map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: path.startsWith("/blog") ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/problems/") ? 0.8 : 0.6,
  }));
}
