# Auth Gate Modal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a non-dismissible Google OAuth modal on the homepage for unauthenticated users and update Sidebar tests to match the new profile prop requirements.

**Architecture:** Introduce a client-side `AuthGate` overlay that checks Supabase session with the browser client and triggers Google OAuth. Add a server route to handle `/auth/callback` and redirect to `/`. Wire `AuthGate` into `src/app/page.tsx` so the UI is blocked until login. Update Sidebar tests to pass a mock profile and mock `useRouter` to avoid Next.js app router errors.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Supabase SSR, Tailwind CSS, Vitest, React Testing Library

---

## Task 1: Create AuthGate Component

**Files:**
- Create: `src/components/AuthGate.tsx`
- Test: `src/components/AuthGate.test.tsx`

**Step 1: Write the failing test**

Create `src/components/AuthGate.test.tsx`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthGate from './AuthGate';

const signInWithOAuth = vi.fn();
const getSession = vi.fn();

vi.mock('@/utils/supabase/client', () => ({
  createBrowserClient: () => ({
    auth: {
      getSession,
      signInWithOAuth,
    },
  }),
}));

describe('AuthGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows modal when unauthenticated', async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: null });
    render(<AuthGate />);
    expect(await screen.findByText('请使用 Google 登录')).toBeInTheDocument();
  });

  it('calls Google OAuth on button click', async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: null });
    render(<AuthGate />);

    fireEvent.click(await screen.findByRole('button', { name: '使用 Google 登录' }));
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: expect.stringContaining('/auth/callback') },
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test src/components/AuthGate.test.tsx`
Expected: FAIL (AuthGate missing)

**Step 3: Write minimal implementation**

Create `src/components/AuthGate.tsx`:
```typescript
'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/utils/supabase/client';

export default function AuthGate() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient();

    supabase.auth
      .getSession()
      .then(({ data }) => {
        setIsAuthenticated(Boolean(data.session));
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  if (isAuthenticated !== false) {
    return null;
  }

  const handleLogin = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-xl">
        <h1 className="text-2xl font-bold">请使用 Google 登录</h1>
        <p className="mt-2 text-slate-400">登录后即可使用笔记功能</p>
        <button
          onClick={handleLogin}
          className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-500"
        >
          使用 Google 登录
        </button>
      </div>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test src/components/AuthGate.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/AuthGate.tsx src/components/AuthGate.test.tsx
git commit -m "feat: add auth gate modal"
```

---

## Task 2: Add OAuth Callback Route

**Files:**
- Create: `src/app/auth/callback/route.ts`

**Step 1: Write the failing test**

Create `src/app/auth/callback/route.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { GET } from './route';

vi.mock('@/utils/supabase/server', () => ({
  createServerClient: () => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: '1' } }, error: null })),
    },
  }),
}));

vi.mock('next/server', async () => {
  const actual = await vi.importActual<typeof import('next/server')>('next/server');
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      redirect: (url: URL) => ({ redirected: true, url: url.toString() }),
    },
  };
});

describe('auth callback route', () => {
  it('redirects to home', async () => {
    const response = await GET(new Request('http://localhost/auth/callback'));
    expect(response).toEqual({ redirected: true, url: 'http://localhost/' });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test src/app/auth/callback/route.test.ts`
Expected: FAIL (route missing)

**Step 3: Write minimal implementation**

Create `src/app/auth/callback/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { createServerClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const supabase = await createServerClient();
  await supabase.auth.getUser();
  return NextResponse.redirect(new URL('/', request.url));
}
```

**Step 4: Run test to verify it passes**

Run: `npm test src/app/auth/callback/route.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/auth/callback/route.ts src/app/auth/callback/route.test.ts
git commit -m "feat: add auth callback route"
```

---

## Task 3: Wire AuthGate Into Home Page

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Write failing test**

Create `src/app/page.auth-gate.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './page';

vi.mock('@/components/AuthGate', () => ({
  default: () => <div>AuthGate</div>,
}));

vi.mock('@/utils/supabase/server', () => ({
  createServerClient: vi.fn(() => ({
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: [] }),
      }),
    }),
  })),
}));

vi.mock('@/utils/profile/queries', () => ({
  getUserProfile: vi.fn(() => Promise.resolve(null)),
}));

describe('Home page auth gate', () => {
  it('renders AuthGate', async () => {
    const ui = await Home({ searchParams: Promise.resolve({}) });
    render(ui);
    expect(screen.getByText('AuthGate')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test src/app/page.auth-gate.test.tsx`
Expected: FAIL (AuthGate not rendered)

**Step 3: Implement AuthGate wiring**

Update `src/app/page.tsx`:
```typescript
import AuthGate from '@/components/AuthGate';

// inside return
<AuthGate />
```

**Step 4: Run test to verify it passes**

Run: `npm test src/app/page.auth-gate.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/page.tsx src/app/page.auth-gate.test.tsx
git commit -m "feat: add auth gate to home"
```

---

## Task 4: Update Sidebar Tests For Profile Prop

**Files:**
- Modify: `src/components/Sidebar.test.tsx`

**Step 1: Write failing test**

Modify `src/components/Sidebar.test.tsx` to add profile prop and mock `useRouter`:
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Sidebar from './Sidebar';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockProfile = {
  id: 'test-id',
  email: 'test@example.com',
  is_active: true,
  storage_used: 5000,
  plan_type: 'free' as const,
  target_language: 'es',
  created_at: '2026-01-15T00:00:00Z',
};
```

**Step 2: Run test to verify it fails**

Run: `npm test src/components/Sidebar.test.tsx`
Expected: FAIL before updates

**Step 3: Update renders to pass profile**

Ensure each `Sidebar` render includes `profile={mockProfile}`.

**Step 4: Run test to verify it passes**

Run: `npm test src/components/Sidebar.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/Sidebar.test.tsx
git commit -m "test: update sidebar tests for profile prop"
```
