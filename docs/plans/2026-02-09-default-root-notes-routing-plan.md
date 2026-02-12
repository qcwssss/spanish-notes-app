# Plan: Default Root URL as Notes, Redirect Guests to Home

Date: 2026-02-09
Owner: @qcwssss
Status: superseded

> Superseded on 2026-02-12 by `docs/plans/2026-02-12-public-root-app-workspace-routing-plan.md`.
> Reason: repeated login return-path instability and ambiguous responsibility when `/` acts as workspace while `/home` acts as landing.

## Goal

Use `/` as the default notes workspace URL, while redirecting unauthenticated users to `/home` (product intro page).

Desired behavior:
- Logged-in user visits `/` -> sees notes workspace directly.
- Guest visits `/` -> redirected to `/home`.
- Guest logs in from `/home` flow -> returns to `/`.
- User closes browser and reopens (still logged in) -> `/` still opens notes workspace.

## Routing Strategy

- `ROUTES.app = '/'`
- `ROUTES.home = '/home'`
- Keep `/home` as landing/intro page.
- Keep `/` as authenticated app page.
- Enforce auth gate at middleware level for `/` and other protected routes.

## File-by-File Change Plan

1) `src/constants.ts`
- Revert route constants:
  - `home: '/home'`
  - `app: '/'`

2) `src/app/page.tsx`
- Make root page the notes workspace (move current app page content back here).
- Keep `AuthGate` present as client-side fallback UX.

3) `src/app/home/page.tsx`
- Ensure this file exists as landing/intro page (move current landing content here).
- All CTA buttons should link to `ROUTES.app` (which will be `/`).

4) `src/app/app/page.tsx`
- Keep a backward-compatible redirect from `/app` to `/` for old bookmarks/links.

5) `src/app/auth/callback/route.ts`
- On success redirect to `/`.
- On failure redirect to `/home?auth=error` (or keep current error convention if preferred).

6) `src/components/UserInfoCard.tsx`
- Keep sign-out redirect target as `ROUTES.home`.
- With routes reverted, this will send users to `/home` after sign-out.

7) `src/middleware.ts`
- Add/confirm protected-route redirects:
  - Guests trying to access `/`, `/favorites`, `/settings` -> redirect to `/home`.
  - Public routes remain accessible: `/home`, `/auth/*`, `/share/*`, static assets.
- Preserve Supabase session refresh behavior.

8) `public/manifest.webmanifest`
- Set `start_url` to `/` because root is the workspace again.

9) `docs/progress.md` and `memory-bank/progress.md`
- Add a short entry describing the finalized routing decision.

## Acceptance Criteria

- Visiting `/` as logged-in user opens notes workspace.
- Visiting `/` as guest redirects to `/home`.
- Visiting `/home` always shows intro page.
- OAuth login completes and lands on `/`.
- Sign-out sends user to `/home`.
- `npm run build` passes.
- `npm run pages:build` passes (Cloudflare OpenNext compatibility).

## Verification Checklist

Manual flows:
- Guest -> `/` -> redirected to `/home`.
- `/home` -> click CTA -> login -> callback -> `/` workspace.
- Logged-in user refreshes `/` and reopens browser -> remains in workspace.
- Sign out from workspace -> `/home`.
- Guest cannot open `/settings` or `/favorites` directly.

Commands:
- `npm run build`
- `npm run pages:build`

## Risks and Notes

- Next.js middleware deprecation warning still exists in this repo due to current Cloudflare/OpenNext limitation; keep `src/middleware.ts` for deploy compatibility.
- Ensure middleware matcher/public-route conditions do not accidentally redirect `/auth/callback`.
- If we keep `AuthGate` and middleware redirect together, middleware should be source of truth for route protection, with `AuthGate` as UI fallback.
