# Plan: FAQ First, Then Mocked Frontend Test Baseline

Date: 2026-02-11
Owner: @qcwssss
Status: planned

## Objective

Deliver work in this order:
1) Finish FAQ feature (remaining product item).
2) Establish DB-independent frontend test baseline (Issue #47 direction).

---

## Phase A: FAQ Feature (Priority 1)

### A1. Add FAQ page route
File:
- `src/app/faq/page.tsx`

Task:
- Build a public page with:
  - hero/title + short intro
  - 3-step "How to use"
  - FAQ list (6-8 Q&A)
  - bottom CTA links (`/home`, app entry)

### A2. Add FAQ i18n copy
File:
- `src/i18n/messages.ts`

Task:
- Add `faq` namespace in EN/ZH:
  - title/subtitle
  - steps
  - question/answer pairs
  - CTA labels

### A3. Add FAQ entry points
Files:
- `src/app/home/page.tsx`
- `src/app/share/[token]/page.tsx`

Task:
- Add visible links/buttons to `/faq` from both entry pages.

### A4. Validate FAQ integration
Commands:
- `npm run build`
- `npm test -- --run`

Manual checks:
- `/faq` accessible while logged out
- `/home` -> `/faq`
- `/share/[token]` -> `/faq`
- EN/ZH copy switches correctly

---

## Phase B: Mocked Frontend Test Baseline (Priority 2)

### B1. Create shared frontend test mocks
Files (new):
- `tests/helpers/mockSupabase.ts`
- `tests/helpers/mockRouter.ts`
- `tests/helpers/renderWithProviders.tsx` (if useful)

Task:
- Centralize common mocks for:
  - Supabase client/server boundaries
  - Next router/navigation helpers
  - repeated provider wrappers

### B2. Add/upgrade critical page tests (DB-independent)
Files (new/updated):
- `tests/app/home/page.light.test.tsx` (new)
- `tests/app/share/token.page.light.test.tsx` (new or equivalent)
- `tests/app/faq/page.light.test.tsx` (new)
- `tests/app/page.auth-gate.test.tsx` (update if needed)

Task:
- Verify key UX states without DB:
  - `/home` guest-facing CTA visibility
  - `/share/[token]` readonly/help/CTA visibility
  - `/faq` main sections render
  - root auth-gate behavior remains stable

### B3. Add/upgrade critical interaction component tests
Files (new/updated):
- `tests/components/ShareHelpHint.test.tsx` (new)
- `tests/components/SettingsSignOutButton.test.tsx` (new)

Task:
- `ShareHelpHint`: open/close, outside click, Escape, focus return
- `SettingsSignOutButton`: success/failure flow with mocked `signOut`

### B4. Standardize and document pattern
Files:
- `docs/progress.md`
- `memory-bank/progress.md`
- (optional) `docs/testing/frontend-mock-guidelines.md`

Task:
- Document the baseline pattern for DB-independent FE tests:
  - where to mock
  - what not to hit (real DB/network)
  - minimal assertions for route/UX regressions

### B5. Verify baseline gate
Commands:
- `npm test -- --run`
- `npm run build`

Acceptance:
- Frontend tests pass consistently without live DB
- Critical route/component coverage added

---

## Parallelization Plan

Safe parallel groups:
- A1 + A2 can be built in parallel (page structure + i18n content)
- After A2, do A3
- In Phase B, B2 and B3 can run in parallel after B1

Sequential dependencies:
- A3 depends on FAQ route existing
- B2/B3 should consume B1 shared mocks

---

## Definition of Done

1) FAQ shipped with links from `/home` and `/share/[token]`.
2) Mocked FE baseline shipped for critical routes/components.
3) `npm test -- --run` and `npm run build` both pass.
4) Progress docs updated.
