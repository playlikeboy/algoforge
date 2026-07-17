import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";

export const revalidate = false;

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
