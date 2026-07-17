# Deployment

## Local

```bash
npm run pipeline
npm run dev
# production
npm run build && npm start
```

## Cloudflare Pages

1. Connect GitHub repo
2. Build command: `npm run pipeline && npm run build` (or use `prebuild`)
3. Output: Next.js OpenNext adapter recommended (`@opennextjs/cloudflare`)
4. Env: `NEXT_PUBLIC_SITE_URL=https://your-domain`

## GitHub Actions

- `.github/workflows/deploy.yml` — CI build
- `.github/workflows/pipeline.yml` — weekly data refresh

## Headers

Configure Cloudflare Transform Rules or `_headers` for CSP, HSTS, and cache on static assets.
