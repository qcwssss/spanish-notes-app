# Plan: Public Root + App Workspace Routing

Date: 2026-02-12
Owner: @qcwssss
Status: planned

## Goal

Restore a clear two-route model to eliminate recurring auth redirect regressions:

- `/` is always public landing page.
- `/app` is authenticated workspace entry.
- `/auth/callback` performs code exchange then lands on `/app` by default.

## Why This Change

Recent issues repeatedly showed unstable post-login behavior (login completes but user returns to landing). The root cause is route-role ambiguity when `/` is treated as both default app entry and public marketing/login surface in different flows.

This plan removes ambiguity by separating responsibilities:

- Public pages: `/`, `/faq`, `/share/*`, `/auth/*`, `/api/share/*`
- Protected pages: `/app`, `/settings`, `/favorites`

## Routing Policy

- Guest visiting protected route -> redirect to `/` (optionally with `next`).
- Logged-in user visiting `/` -> either stay on landing or optionally auto-redirect to `/app` based on product decision.
- OAuth callback success -> redirect to validated internal `next`, fallback `/app`.
- OAuth callback failure -> redirect to `/?auth=error`.

## Security Rules for `next`

- Must start with `/`.
- Must not start with `//`.
- Must be internal path only.
- Optional stricter allow-list: only `/app`, `/settings`, `/favorites`.

## File-by-File Execution Plan

1) `src/constants.ts`
- Set route constants to:
  - `home: '/'`
  - `app: '/app'`

2) `src/app/page.tsx`
- Serve landing page content currently living in `/home`.
- Remove workspace-specific auth gate logic from root.

3) `src/app/app/page.tsx`
- Serve workspace content currently on root route.
- Keep server-side auth check and redirect guest to `/`.

4) `src/app/home/page.tsx`
- Deprecate route: redirect `/home` -> `/` for backward compatibility.

5) `src/utils/supabase/middleware.ts`
- Public allow-list includes `/`, `/auth/*`, `/share/*`, `/faq`, `/api/share/*`.
- Protected routes redirect guests to `/` (preserving safe `next` when needed).

6) `src/app/auth/callback/route.ts`
- Keep safe `next` validation.
- Success fallback target becomes `/app`.
- Failure target becomes `/?auth=error`.

7) `src/components/GoogleSignInButton.tsx` and `src/components/AuthGate.tsx`
- Pass `next` consistently (`/app` or current protected path).

8) Tests
- Update routing tests for new defaults:
  - callback fallback target `/app`
  - unauthenticated `/app` redirected to `/`
  - `/home` compatibility redirect to `/`

9) Docs sync
- Update `docs/progress.md`, `memory-bank/progress.md`, README route references.

## Acceptance Criteria

- Guest opens `/` and sees landing page only.
- Logged-in user opens `/app` and sees workspace.
- Guest opening `/app`, `/settings`, `/favorites` is redirected to `/`.
- Login from landing reliably lands on `/app` (or valid protected `next`).
- `/home` old links still work via redirect to `/`.

## Verification Checklist

- Guest: `/` -> landing
- Guest: `/app` -> `/`
- Guest: `/settings` -> `/`
- Login from landing CTA -> `/app`
- Callback with invalid `next` -> `/app`
- Callback error -> `/?auth=error`
- Old bookmark `/home` -> `/`

Commands:
- `npm test -- --run`
- `npm run build`
