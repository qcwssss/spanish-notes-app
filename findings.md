# Findings

## Repository Search
- Workflow files found: `.github/workflows/production-deploy.yml`, `.github/workflows/pr-preview-deploy.yml`, `.github/workflows/opennext-verify.yml`, `.github/workflows/auto-review.yml`.
- Script/config candidates found: `package.json`, `.opencode/package.json`, `vitest.config.ts`, `vitest.setup.ts`.
- No standalone Jest/Playwright/Cypress config files found via filename search.
- `opennext-verify.yml` runs `npm ci`, `npm run build`, `npm test -- --run`, `npm run pages:build`, and a Wrangler dry-run deploy.
- `pr-preview-deploy.yml` runs `npm ci`, `npm run pages:build`, `npx wrangler --version`, and `npx wrangler deploy --env preview --config wrangler.jsonc`.
- `production-deploy.yml` runs secret validation shell checks, `npm ci`, `npm run pages:build`, and `npx wrangler deploy --config wrangler.jsonc`.
- `auto-review.yml` does not run tests/build; it only comments on PRs with `gh pr comment`.
- Root `package.json` defines CI-used scripts: `build=next build`, `test=vitest`, `pages:build=opennextjs-cloudflare build`.
- `vitest.config.ts` defines Vitest behavior (`jsdom`, globals, `vitest.setup.ts`, includes `src/**/*.test.{ts,tsx}` and `tests/**/*.test.{ts,tsx}`).
- `vitest.setup.ts` sets up `@testing-library/jest-dom`, `localStorage`, and `matchMedia` mocks.
- Recently touched likely-related files from git status/log include `src/app/page.tsx`, `src/i18n/messages.ts`, `src/components/LandingAuthDialog.tsx`, `src/components/LandingAuthDialog.test.tsx`, `src/components/AuthGate.tsx`, `tests/components/AuthGate*.test.tsx`, `src/components/EmailPasswordSignInForm.tsx`, `tests/components/EmailPasswordSignInForm.test.tsx`, `src/components/InviteEmailSignupForm.tsx`, `tests/components/InviteEmailSignupForm.test.tsx`, and `package.json`.

## Current Direction
- The likely failing CI job is `.github/workflows/opennext-verify.yml` because it is the workflow that runs both `npm run build` and `npm test -- --run`.
- Primary local reproduction targets are `npm test -- --run`, `npm run build`, and `npm run pages:build`.
- Current debugging focus is to get the actual failing error output before proposing any code changes.

## Reproduction Evidence
- Local `npm test -- --run` reliably reproduces a single failing test: `tests/app/faq/page.light.test.tsx`.
- Failure message: expected root FAQ page classes to contain `bg-slate-50`, but actual classes contain dark-theme styling beginning with `min-h-screen bg-[#0A0A0B] text-slate-300 ...`.
- Current evidence points to a mismatch between the FAQ page implementation and the light-mode snapshot/assertion, not a broad test runner failure.

## Root-Cause Hypothesis
- Hypothesis: the failure is caused by a stale test, not a product regression.
- Evidence: PR #52 (`feat: refresh VivaNote landing and FAQ experience`) explicitly says the FAQ was restyled with a modern dark visual system / dark immersive theme.
- Supporting detail: the redesign commit touched `src/app/faq/page.tsx` but the failing test still expects the old light-shell class `bg-slate-50`.

## Final Verification
- `npm test -- --run tests/app/faq/page.light.test.tsx` passed after updating the test assertion.
- `npm test -- --run` passed: 41 test files, 158 tests passed.
- `npm run build` passed.
- `npm run pages:build` passed and produced `.open-next/worker.js`.
- Independent review agreed the smallest correct fix is updating the stale FAQ test, not changing production code.
- Non-blocking warning remains during build: Next.js reports the deprecated `middleware` file convention and recommends `proxy`.
