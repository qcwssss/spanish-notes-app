# 🇪🇸 Spanish Notes App - Project Checkpoint
**Date:** Jan 17, 2026
**Status:** Phase 4 In Progress (Next.js Migration + Auth Gate + Profiles)

## 📌 Current State (目前进度)
We now have a **Next.js App Router** app with authentication gating and user profile features:
1. **Auth Gate:** Non-dismissible Google OAuth modal (`AuthGate`) on `/`, with `/auth/callback` route exchanging OAuth code and persisting session cookies.
2. **User Profiles:** `user_profiles` table integration with `UserInfoCard`, `StorageIndicator`, and activation status.
3. **Activation Guard:** Inactive users are blocked from saving/creating notes and see an activation dialog.
4. **Settings Page:** `/settings` for target language selection + storage usage (blocked for inactive users).
5. **TTS Improvements:** Voice selection now persists across sessions (localStorage).
6. **Tests:** Vitest + React Testing Library added with coverage for key components and server routes.

## 🛠️ Tech Stack (技术栈)
* **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS
* **Backend/DB:** Supabase (PostgreSQL + RLS)
* **Auth:** Google OAuth 2.0 via Supabase SSR
* **Hosting:** Cloudflare Pages (Next-on-Pages)

## 🔑 Key Configuration (关键配置)
* **Supabase URL:** `NEXT_PUBLIC_SUPABASE_URL`
* **Supabase Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
* **Redirect URLs (Supabase):**
  * `https://<pages-domain>/auth/callback`

## 📂 Project Structure (文件结构)
```
/spanish-notes-app
├── src/app/                  # App Router pages (/ , /settings, /auth/callback)
├── src/components/           # AuthGate, Sidebar, Editor, UserInfoCard
├── src/utils/                # Supabase SSR helpers, profile queries
├── docs/plans/               # Implementation plans
└── v1_legacy/                # Old vanilla JS app (reference)
```

## ✅ Recent Work (已完成)
- **AuthGate** modal + OAuth callback route with error handling.
- **Profile UI**: UserInfoCard + StorageIndicator + ActivationDialog.
- **Editor/Create** guards for inactive users.
- **Settings page** with language selection and storage view.
- **TTS voice** selection persistence (remembers last choice).
- **CI workflow** updated to comment using PAT (`GEMINI_REVIEW_TOKEN`).

## 🧪 Tests & Build (验证)
- `npm test src/components/AuthGate.test.tsx`
- `npm test src/app/auth/callback/route.test.ts`
- `npm test src/app/page.auth-gate.test.tsx`
- `npm test src/components/Sidebar.test.tsx`
- `npm test src/hooks/useTTS.test.ts`
- `npm run build` (Cloudflare compatible)

## 📋 Open Questions (未决问题)
1. **Activation policy:** Should Google login auto-activate users or still require activation code?
2. **UX polish (optional):** Replace `alert()` with toast system; switch `<a>` to `Link`.

## 🧭 Next Steps (下一步计划)
1. Decide activation policy (manual activation vs auto-activate on OAuth).
2. Validate OAuth redirect URL in Supabase for the Pages domain.
3. Merge PR `https://github.com/qcwssss/spanish-notes-app/pull/5` when ready.
4. Optional UX refinements after merge.

---
*Updated by assistant*