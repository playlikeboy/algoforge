# AlgoForge

**Master coding interviews with patterns, roadmaps, and original explanations.**

AlgoForge is a production-oriented coding interview learning platform built with Next.js 16, TypeScript, Tailwind, and a generated content pipeline.

## What is in the repo

- Static-first **Next.js App Router** application
- Generated problem/topic/pattern/company/roadmap/blog data
- Multi-language solution views and client-side search
- SEO metadata, JSON-LD, sitemap and RSS generation
- Local study state for bookmarks, confidence, streaks, and revision
- Optional Cloudflare/OpenNext configuration

The content pipeline consumes the MIT-licensed [kamyu104/LeetCode-Solutions](https://github.com/kamyu104/LeetCode-Solutions) repository. AlgoForge adds its own taxonomy, explanations, study workflow, and presentation.

## Local development

```bash
npm install
npm run pipeline
npm run dev
```

For a production-style local build:

```bash
npm run pipeline
npm run lint
npm run typecheck
npm run build
```

Open `http://localhost:3000`.

## Commands

| Command | Description |
| --- | --- |
| `npm run fetch` | Clone/update the upstream solution repository |
| `npm run generate` | Generate all derived content and indexes |
| `npm run pipeline` | Fetch upstream content, then generate derived data |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm run build` | Build the Next.js application |
| `npm run deploy:cloudflare` | Optional OpenNext/Cloudflare deployment |

## GitHub Pages deployment

The production site is:

```text
https://stack-shade.github.io/algoforge/
```

The active workflow is `.github/workflows/deploy.yml`. It:

1. Installs dependencies with `npm ci`.
2. Fetches and generates the content graph.
3. Runs ESLint and TypeScript checks.
4. Builds a Next.js static export for the `/algoforge` project path.
5. Deploys the generated `out/` directory with the official GitHub Pages actions.

Build-time URL settings are:

```text
DEPLOY_TARGET=github-pages
NEXT_PUBLIC_SITE_URL=https://stack-shade.github.io/algoforge
NEXT_PUBLIC_BASE_PATH=/algoforge
```

These values keep internal URLs, client fetches, canonical URLs, sitemap, RSS, robots rules, and static assets aligned with the project-site prefix.

## Architecture

```text
Upstream solutions
      ↓
fetch / parse / generate
      ↓
data/generated
      ↓
Next.js App Router
      ↓
GitHub Pages static export
```

See [Architecture](./docs/architecture.md), [Data pipeline](./docs/data-pipeline.md), [SEO](./docs/seo.md), and [Deployment](./docs/deployment.md).

## Attribution

Reference solution code is MIT-licensed from kamyu104/LeetCode-Solutions. Explanations and product UX are original AlgoForge content. See `/about/attribution`.

## License

Application code: MIT (or as designated by maintainers). Upstream solutions retain their MIT copyright.
