const defaultSiteUrl = "https://stack-shade.github.io/algoforge";
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const siteConfig = {
  name: "AlgoForge",
  tagline: "Master coding interviews with patterns, roadmaps, and solutions",
  description:
    "AlgoForge is a free, SEO-first coding interview platform with pattern-based learning paths, curated collections (Blind 75, Grind 169), multi-language solutions, and original explanations.",
  url: (configuredSiteUrl || defaultSiteUrl).replace(/\/+$/, ""),
  basePath: (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, ""),
  ogImage: "/og-default.png",
  links: {
    github: "https://github.com/SH20RAJ/algoforge",
    twitter: "https://x.com/algoforge",
  },
  creator: "AlgoForge",
  keywords: [
    "leetcode",
    "coding interview",
    "blind 75",
    "grind 169",
    "dynamic programming",
    "data structures",
    "algorithms",
    "interview preparation",
  ],
} as const;

export const FEATURE_FLAGS = {
  ads: false,
  premium: false,
  cloudSync: false,
  turnstile: false,
} as const;
