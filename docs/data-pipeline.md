# Data Pipeline

## Commands

```bash
npm run fetch      # shallow clone kamyu104/LeetCode-Solutions
npm run parse      # parse markdown indexes only
npm run generate   # full pipeline (parse + content + entities + search)
npm run pipeline   # fetch + generate
```

## Steps

1. **fetch** — `data/raw/LeetCode-Solutions`
2. **parse-index** — topic sections + table rows → problem map
3. **load solutions** — read language files for code bodies
4. **generate-content** — original sections + FAQs + checklists
5. **relations** — related problems, prev/next
6. **entities** — topics, patterns, companies, collections, roadmaps, blog, landings
7. **search-index** + **sitemap-paths** + **site-manifest**

## Curated overlays

- `data/curated/topics.json`
- `data/curated/patterns.json`
- `data/curated/companies.json`
- `data/curated/company-tags.json`
- `data/curated/collections/*`

## AI queue

Placeholder sections write prompts to `data/content/ai-queue/` for offline AI fill without schema changes.
