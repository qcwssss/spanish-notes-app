# Plan: Auth-Aware Routing Decision Matrix

Date: 2026-02-10
Owner: @qcwssss
Status: superseded

> Superseded on 2026-02-12 by `docs/plans/2026-02-12-public-root-app-workspace-routing-plan.md`.
> Reason: this matrix assumes `/` is the protected workspace entry, which conflicts with the restored two-route model (`/` public landing, `/app` protected workspace).

## Goal

Establish a single auth routing policy:

- Default entry `/` is the notes workspace.
- Unauthenticated access to protected routes redirects to `/home`.
- Authenticated access to `/home` redirects to workspace (or `returnTo`).
- After login, users return to their original intended route (prefer `returnTo`).

## Industry Practice Summary

This follows common industry best practice:

- Protected routes require authentication.
- Public landing/login routes remain accessible.
- Post-login redirect preserves user intent via `returnTo`.
- Server-side route protection is the source of truth.

## Routing Decision Matrix

- `/` (workspace)
  - logged-in -> allow
  - logged-out -> redirect to `/home?returnTo=/`

- `/settings`, `/favorites`
  - logged-in -> allow
  - logged-out -> redirect to `/home?returnTo=<original-path>`

- `/home` (landing + login)
  - logged-in -> redirect to valid `returnTo`, else `/`
  - logged-out -> allow

- `/auth/callback`
  - success -> redirect to valid `returnTo`, else `/`
  - failure -> redirect to `/home?auth=error`

- `/share/*`
  - public for both logged-in and logged-out users

- `/app` (legacy compatibility)
  - redirect to `/` for both states

## Security Rules

- `returnTo` must be an internal path only:
  - must start with `/`
  - must not start with `//`
  - must not be an absolute URL
- Use a public-path allow-list and protect all other routes by default.
- Avoid redirect loops by explicitly allowing `/home` and `/auth/*`.

## File-by-File Plan

1) `src/utils/supabase/middleware.ts`
- Keep auth check as server-side source of truth.
- Add/confirm public allow-list:
  - `/home`, `/auth/*`, `/share/*`, `/api/share/*`, static assets.
- For unauthenticated users on non-public routes:
  - redirect to `/home?returnTo=<pathname+search>`.
- Preserve anti-bounce handling for OAuth cookie edge case if needed.

2) `src/app/home/page.tsx`
- If logged-in:
  - read `searchParams.returnTo`
  - validate it
  - redirect to validated target or `/`.
- If logged-out:
  - render landing + one login CTA button only.

3) `src/components/GoogleSignInButton.tsx`
- Keep robust `try/catch/finally`.
- Include `returnTo` when initiating OAuth (via callback query or state).
- On failure: toast + reset loading state.

4) `src/app/auth/callback/route.ts`
- Exchange auth code for session.
- Parse and validate `returnTo`.
- Success: redirect to validated `returnTo` or `/`.
- Error: redirect to `/home?auth=error`.

5) `src/app/app/page.tsx`
- Keep backward-compatible redirect `/app` -> `/`.

6) `tests/app/auth/callback/route.test.ts`
- Cover:
  - success -> `/` default
  - success with valid `returnTo` -> custom path
  - invalid `returnTo` -> fallback `/`
  - error -> `/home?auth=error`

7) middleware tests (if present, else add)
- unauthenticated `/` -> `/home?returnTo=/`
- unauthenticated `/settings` -> `/home?returnTo=/settings`
- authenticated `/home` -> `/`
- `/share/*` always accessible

8) Docs updates
- `docs/progress.md`
- `memory-bank/progress.md`
- Add a short note that auth routing now uses `returnTo`-based post-login redirect.

## Acceptance Criteria

- Logged-in user opening `/` always sees workspace.
- Logged-out user opening protected routes always lands on `/home` with `returnTo` preserved.
- Login from `/home` returns to intended route.
- No redirect loop after OAuth callback.
- Build and tests pass.

## QA Checklist

- Guest -> `/` -> `/home?returnTo=/`
- Guest -> `/settings` -> `/home?returnTo=/settings`
- Login from `/home` -> `/`
- Login from `/home?returnTo=/settings` -> `/settings`
- Logged-in user opens `/home` -> `/`
- `/app` -> `/`
- `/share/<token>` works while logged out
- Sign out from settings -> `/home`
