# Todo: middleware->proxy, Sign Out, First-Run Onboarding

## Scope
Create a tracked todo document for the next product iteration covering:

1. Migrate Next.js `middleware` convention to `proxy`
2. Add user `Sign Out` option
3. Show first-run onboarding prompt that points users to `/home`

## Todo Items

### 1) Migrate middleware to proxy

- Replace `src/middleware.ts` with Next.js `proxy` file convention.
- Preserve current request matcher behavior and Supabase session refresh behavior.
- Keep auth/session behavior unchanged for all existing routes.

Definition of done:

- No deprecation warning for middleware convention during build.
- Auth/session behavior remains the same on `/`, `/favorites`, `/settings`, `/share/[token]`.

---

### 2) Add Sign Out option

- Add a visible `Sign Out` action in the logged-in user UI (recommended: user card/menu area).
- Implement logout flow via Supabase sign-out API.
- After sign-out, redirect to `/home` (landing page).

Definition of done:

- Logged-in users can sign out in one click.
- Session/cookies are cleared and protected pages require login again.
- UX supports both desktop and mobile layouts.

---

### 3) First-run onboarding prompt

- Detect first-time users (newly registered / first successful login).
- Show a dismissible onboarding card or modal.
- Prompt content explains there is a usage intro page at `/home` and provides quick link.
- Ensure prompt does not repeatedly show after completion/dismissal.

Definition of done:

- Prompt appears only for first-run users.
- Existing users do not see repeated onboarding.
- Link to `/home` works and copy is localized (EN/ZH).

## Suggested Implementation Order

1. `middleware` -> `proxy` migration (safe infrastructure change first)
2. Sign Out capability (core account action)
3. First-run onboarding UX and persistence logic

## Verification Checklist

- `npm run build` passes with no middleware convention deprecation warning.
- Manual flow check:
  - Login -> app opens
  - Sign out -> redirected to `/home`
  - Login as first-run user -> onboarding shown once
  - Existing user -> onboarding not shown repeatedly
- `npm test -- --run` passes (or add tests for sign-out/onboarding behavior).
