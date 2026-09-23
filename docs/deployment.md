# Deployment

## Local

```bash
npm run pipeline
npm run lint
npm run typecheck
npm run build
```

## GitHub Pages

The primary deployment is the project site:

```text
https://stack-shade.github.io/algoforge/
```

The workflow is `.github/workflows/deploy.yml`.

It installs dependencies, regenerates the content graph, runs lint and TypeScript checks, builds Next.js with:

```text
DEPLOY_TARGET=github-pages
NEXT_PUBLIC_SITE_URL=https://stack-shade.github.io/algoforge
NEXT_PUBLIC_BASE_PATH=/algoforge
```

and deploys `out/` with the official GitHub Pages actions.

## Optional Cloudflare/OpenNext

The repository keeps `open-next.config.ts` and Wrangler configuration for an optional custom-domain deployment.

For a root custom domain:

```text
NEXT_PUBLIC_SITE_URL=https://algoforge.dev
NEXT_PUBLIC_BASE_PATH=
DEPLOY_TARGET=
```

Use `npm run deploy:cloudflare` only for that target.

## URL rules

Do not hard-code the production host in page components. Canonical URLs are built through `siteConfig.url`, while the project-site prefix used by client-side requests is `siteConfig.basePath`.

## Headers

For a custom-domain/Cloudflare deployment, configure CSP, HSTS, and cache policies at the edge. GitHub Pages does not provide the same edge configuration surface.
