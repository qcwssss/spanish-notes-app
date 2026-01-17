# Auth Gate Modal Design

**Goal:** Require Google OAuth login via a non-dismissible modal on the homepage. Unauthenticated users see the existing UI but cannot interact until they log in.

**Architecture:** Add a client-side `AuthGate` overlay that checks Supabase session on load and triggers Google OAuth. Add a server route at `/auth/callback` to handle OAuth callback and redirect back to `/`. Keep the existing `Sidebar`/`Editor` layout untouched and simply block interaction with a full-screen overlay.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Supabase SSR, Tailwind CSS

---

## UX Flow

1. User opens `/`.
2. `AuthGate` checks session via Supabase browser client.
3. If unauthenticated, show full-screen overlay + modal (non-dismissible).
4. User clicks “Sign in with Google”, OAuth flow redirects to `/auth/callback`.
5. Callback route confirms session and redirects to `/`.
6. `AuthGate` detects session and removes overlay.

---

## Components

### `AuthGate` (client component)
- Location: `src/components/AuthGate.tsx`
- Responsibilities:
  - Create Supabase browser client.
  - Call `supabase.auth.getSession()` in `useEffect`.
  - Render overlay if no session.
  - Trigger `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })` on button click.
- UI:
  - `fixed inset-0` overlay with backdrop blur, high z-index.
  - Centered modal with Google login CTA.
  - No close button.

### `Home` page integration
- Location: `src/app/page.tsx`
- Add `<AuthGate />` at top of page layout to cover UI when unauthenticated.

---

## Routes

### `/auth/callback`
- Location: `src/app/auth/callback/route.ts`
- Responsibilities:
  - Use Supabase SSR client to read auth session from cookies.
  - Redirect to `/` after session exchange.

---

## Error Handling

- If session fetch fails, treat as unauthenticated and show modal.
- If OAuth fails, surface a simple inline error in the modal (optional enhancement).

---

## Testing

- Manual test:
  - Open `/` while logged out → modal blocks interaction.
  - Click Google login → complete OAuth → return to `/` and modal disappears.
- Optional unit test:
  - Mock Supabase client to return `null` session → modal renders.
  - Mock Supabase client to return session → modal not rendered.
