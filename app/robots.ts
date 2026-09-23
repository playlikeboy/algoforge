import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";

export const revalidate = false;

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.basePath || "";
  const scoped = (path: string) => base + path;

  return {
    rules: {
      userAgent: "*",
      allow: scoped("/"),
      disallow: [scoped("/dashboard"), scoped("/api/")],
    },
    sitemap: siteConfig.url + "/sitemap.xml",
  };
}
