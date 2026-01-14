# Next.js Migration Setup Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Initialize the Next.js 14 project structure and prepare the environment for migration.

**Architecture:** 
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (using @supabase/ssr)

**Tech Stack:** Next.js, React, Tailwind, Supabase.

### Task 1: Archive Legacy Code

**Files:**
- Move: `index.html`, `script.js`, `style.css` -> `v1_legacy/`
- Keep: `docs/`, `.git/`, `README.md` (if exists) in root.

**Step 1: Sync Repo**
Run: `git pull origin master` (Ensure we are up to date)

**Step 2: Create Archive Folder**
Run: `mkdir -p v1_legacy`

**Step 3: Move Files**
Run: `mv index.html script.js style.css v1_legacy/` (Ignore errors if files don't exist, check with ls first)

**Step 4: Commit Archive**
Run: `git add . && git commit -m "chore: archive v1 legacy code"`

### Task 2: Initialize Next.js Project

**Files:**
- Create: Next.js project in root (`.`)

**Step 1: Create App**
Run: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-git-init`
*Note: Use `--no-git-init` because we are already in a repo.*

**Step 2: Clean Boilerplate**
- Modify: `src/app/page.tsx` (Replace with simple "Hello World" or "Spanish Notes Loading...")
- Modify: `src/app/globals.css` (Keep Tailwind directives, remove default Next.js styles)

**Step 3: Commit Init**
Run: `git add . && git commit -m "chore: initialize next.js project"`

### Task 3: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install Core Libs**
Run: `npm install @supabase/supabase-js @supabase/ssr lucide-react clsx tailwind-merge`

**Step 2: Install UI Libs (Radix)**
Run: `npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-label @radix-ui/react-toast`

**Step 3: Commit Deps**
Run: `git add . && git commit -m "chore: install core dependencies"`

### Task 4: Setup Supabase Utils

**Files:**
- Create: `src/utils/supabase/client.ts`
- Create: `src/utils/supabase/server.ts`
- Create: `src/utils/supabase/middleware.ts`
- Create: `.env.local`

**Step 1: Create Client Util**
Write `src/utils/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Step 2: Create Env File**
Write `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

**Step 3: Commit Utils**
Run: `git add . && git commit -m "feat: setup supabase utils"`
