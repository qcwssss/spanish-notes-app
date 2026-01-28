# Spanish Notes App - Project Checkpoint
**Date:** Jan 18, 2026
**Status:** Phase 4 In Progress (Next.js Migration + Auth Gate + Profiles + Activation)

## Current State
We now have a Next.js App Router app with the following features implemented:
1. Auth gate (Google OAuth) with `/auth/callback` exchange flow
2. User profiles with activation status and storage tracking
3. Activation dialog and server action to redeem activation codes (verified working)
4. Notes list + editor + create + update + delete flows
5. Settings page with target language selection and storage view (storage trigger applied)
6. Audio parsing and TTS hooks migrated to React
7. Vitest coverage for key components and routes

## Tech Stack
- Frontend: Next.js 16 (App Router), React 19, Tailwind CSS
- Backend/DB: Supabase (PostgreSQL + RLS)
- Auth: Google OAuth via Supabase SSR
- Hosting: Cloudflare Pages (Next-on-Pages)
- Testing: Vitest + React Testing Library

## Key Configuration
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Redirect URL: `https://<pages-domain>/auth/callback`

## Project Structure
```
/spanish-notes-app
├── src/app/                  # App Router pages (/ , /settings, /auth/callback)
├── src/components/           # AuthGate, Sidebar, Editor, UserInfoCard, ActivationDialog
├── src/hooks/                # useAudioParser, useTTS
├── src/utils/                # Supabase SSR helpers, profile/notes/activation logic
├── docs/plans/               # Implementation plans
└── v1_legacy/                # Old vanilla JS app (reference)
```

## Next Steps
1. Confirm Supabase/Google OAuth Redirect URLs are updated for `https://note-lingo-app.pages.dev`.
2. Add hierarchy (Collection/Folder/Note).
3. Decide activation policy (manual vs auto-activate on OAuth).
4. Revisit search only if it becomes necessary.

---
*Updated by assistant*
