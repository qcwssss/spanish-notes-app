# Cloudflare Deployment Migration: Pages (next-on-pages) -> Workers (OpenNext)

## Decision
Move deployment from Cloudflare Pages + `@cloudflare/next-on-pages` to Cloudflare Workers + `@opennextjs/cloudflare`.

Reason: current app size/runtime shape frequently exceeds or conflicts with Pages edge runtime constraints.

## What is already done in code

- Added OpenNext adapter and scripts in `package.json`
- Added `wrangler.jsonc` and `open-next.config.ts`
- Added static asset headers `public/_headers`
- Added `.dev.vars.example`
- Removed explicit `export const runtime = 'edge'` lines from routes
- Added CI verification workflow: `.github/workflows/opennext-verify.yml`

## Required platform changes (manual)

These cannot be completed from repository code alone and must be done in Cloudflare dashboard:

1. Stop relying on Cloudflare Pages check for this PR/repo branch.
   - The existing Pages integration still runs `npx @cloudflare/next-on-pages@1` and will fail by design.

2. Create or connect a Cloudflare Workers deployment flow for this repo.
   - Deploy command should use OpenNext output (`opennextjs-cloudflare build` + worker deploy).

3. Configure required secrets for CI/CD deployment (if auto-deploy is desired):
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

4. Optional: Keep Pages only for static marketing sites, not this Next.js SSR app.

## Validation criteria

- `npm run build` passes
- `npm test -- --run` passes
- `npm run pages:build` (OpenNext build) passes
- `wrangler deploy --dry-run` reports compressed worker size under plan limit

## Current measured result (spike)

- `Total Upload: 8804.82 KiB / gzip: 2094.10 KiB` (dry-run)
- Compressed size is under Cloudflare Free Worker 3 MiB limit.

## Rollout recommendation

1. Merge OpenNext migration branch.
2. Update Cloudflare project integration from Pages to Workers.
3. Confirm new CI checks are green.
4. Remove/ignore legacy Pages status check on PRs.
