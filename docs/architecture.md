# AlgoForge Architecture

## Overview

AlgoForge is a static-first Next.js App Router site optimized for SEO and edge delivery on Cloudflare Pages.

```
GitHub source (kamyu104) → scripts/pipeline → data/generated/*.json → Next.js SSG → Cloudflare
```

## Layers

1. **Data pipeline** (`scripts/`) — fetch, parse, content generation, search index, sitemaps
2. **Generated graph** (`data/generated/`) — problems, topics, patterns, companies, landings
3. **App** (`src/`) — RSC pages, SEO helpers, local user store
4. **Edge** (`wrangler.toml`, future Workers) — sync, newsletter, rate limits

## Content policy

- No LeetCode problem statement republication
- Original teaching sections via templates (+ AI queue for placeholders)
- MIT solution code with attribution

## User state

`LocalStorageUserStore` implements `UserStore`. Future `CloudUserStore` keeps the same interface for bookmarks, progress, and streaks.

## Search

MiniSearch over `search-index.json` (client). Swap to Meilisearch by replacing `SearchClient` data source only.

## Scaling notes

- Per-problem JSON files avoid one giant bundle
- `generateStaticParams` drives SSG for catalog routes
- Sitemap capped at 45k URLs initially; split sitemaps when exceeding limits
