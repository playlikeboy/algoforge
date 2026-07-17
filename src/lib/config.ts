export const siteConfig = {
  name: "AlgoForge",
  tagline: "Master coding interviews with patterns, roadmaps, and solutions",
  description:
    "AlgoForge is a free, SEO-first coding interview platform with pattern-based learning paths, curated collections (Blind 75, Grind 169), multi-language solutions, and original explanations.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://algoforge.dev",
  ogImage: "/og-default.png",
  links: {
    github: "https://github.com/kamyu104/LeetCode-Solutions",
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
