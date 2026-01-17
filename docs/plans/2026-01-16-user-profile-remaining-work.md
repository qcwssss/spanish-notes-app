# User Profile Features Remaining Work Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Finish the remaining user profile integration (activation guard in Editor, profile wiring, settings page) and verify test coverage.

**Architecture:** Keep user profile data server-fetched in `src/app/page.tsx`, pass activation state into UI components, and add a settings page for language selection and storage visibility. Use component tests for client components (Editor, SettingsForm, Sidebar) and manual verification for server-rendered flows.

**Tech Stack:** Next.js 16, TypeScript, Supabase (PostgreSQL + RLS), Radix UI, Tailwind CSS, Vitest, React Testing Library

---

## Task 1: Finalize Editor Activation Guard + Tests

**Files:**
- Modify: `src/components/Editor.tsx`
- Create: `src/components/Editor.test.tsx`

**Step 1: Write the failing test**

Create `src/components/Editor.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Editor from './Editor';

vi.mock('@/utils/notes/queries', () => ({
  updateNote: vi.fn(() => Promise.resolve()),
  deleteNote: vi.fn(() => Promise.resolve()),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('./NotePlayer', () => ({
  default: () => <div>NotePlayer</div>,
}));

vi.mock('./ActivationDialog', () => ({
  default: ({ open }: { open: boolean }) => (open ? <div>ActivationDialogOpen</div> : null),
}));

const note = { id: '1', title: 'Test Note', content: 'Hola' };

describe('Editor activation guard', () => {
  it('opens activation dialog when inactive user saves', () => {
    render(<Editor note={note} isActive={false} />);

    fireEvent.click(screen.getByText('Edit'));
    fireEvent.click(screen.getByText('Save'));

    expect(screen.getByText('ActivationDialogOpen')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test src/components/Editor.test.tsx`
Expected: FAIL (until Editor uses `isActive` to open the dialog)

**Step 3: Write minimal implementation**

Update `src/components/Editor.tsx` to:
- Accept `isActive` prop
- Guard `handleSave` by showing `ActivationDialog`
- Render the dialog when inactive

**Step 4: Run test to verify it passes**

Run: `npm test src/components/Editor.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/Editor.tsx src/components/Editor.test.tsx
git commit -m "feat: guard editor saves for inactive users"
```

---

## Task 2: Wire User Profile Into Main Page

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Update server page to fetch profile and pass props**

Update `src/app/page.tsx`:
```typescript
import { createServerClient } from '@/utils/supabase/server';
import { getUserProfile } from '@/utils/profile/queries';
import Sidebar from '@/components/Sidebar';
import Editor from '@/components/Editor';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createServerClient();
  const profile = await getUserProfile();

  const { data: notes } = await supabase
    .from('notes')
    .select('id, title, updated_at')
    .order('updated_at', { ascending: false });

  const resolvedSearchParams = await searchParams;
  const selectedNoteId = resolvedSearchParams?.noteId as string;
  let activeNote = null;

  if (selectedNoteId) {
    const { data: note } = await supabase
      .from('notes')
      .select('*')
      .eq('id', selectedNoteId)
      .single();
    activeNote = note;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar notes={notes || []} profile={profile} />

      <main className="flex-1 p-8 overflow-y-auto h-screen">
        {activeNote ? (
          <Editor note={activeNote} isActive={profile?.is_active || false} />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p>Select a note to start practicing</p>
          </div>
        )}
      </main>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: pass user profile into home page"
```

---

## Task 3: Add Settings Page + SettingsForm Tests

**Files:**
- Create: `src/app/settings/page.tsx`
- Create: `src/app/settings/SettingsForm.tsx`
- Create: `src/app/settings/SettingsForm.test.tsx`

**Step 1: Write failing SettingsForm test**

Create `src/app/settings/SettingsForm.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsForm from './SettingsForm';

vi.mock('@/utils/profile/queries', () => ({
  updateTargetLanguage: vi.fn(() => Promise.resolve()),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('@/components/StorageIndicator', () => ({
  default: () => <div>StorageIndicator</div>,
}));

const profile = {
  id: 'test-id',
  email: 'test@example.com',
  is_active: true,
  storage_used: 5000,
  plan_type: 'free' as const,
  target_language: null,
  created_at: '2026-01-15T00:00:00Z',
};

describe('SettingsForm', () => {
  it('enables save after selecting a language', () => {
    render(<SettingsForm profile={profile} />);

    expect(screen.getByRole('button', { name: '保存设置' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('目标语言'), { target: { value: 'es' } });
    expect(screen.getByRole('button', { name: '保存设置' })).toBeEnabled();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test src/app/settings/SettingsForm.test.tsx`
Expected: FAIL (SettingsForm missing)

**Step 3: Implement Settings page and form**

Create `src/app/settings/page.tsx` and `src/app/settings/SettingsForm.tsx` using the existing design in `docs/plans/2026-01-15-user-profile-features.md` (Task 14).

**Step 4: Run test to verify it passes**

Run: `npm test src/app/settings/SettingsForm.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/settings
git commit -m "feat: add settings page and form"
```

---

## Task 4: Update Sidebar Tests For Profile Prop

**Files:**
- Modify: `src/components/Sidebar.test.tsx`

**Step 1: Update test to pass profile prop**

Update `src/components/Sidebar.test.tsx`:
```typescript
const mockProfile = {
  id: 'test-id',
  email: 'test@example.com',
  is_active: true,
  storage_used: 5000,
  plan_type: 'free' as const,
  target_language: 'es',
  created_at: '2026-01-15T00:00:00Z',
};

render(<Sidebar notes={[]} profile={mockProfile} />);
```

**Step 2: Run tests to verify they pass**

Run: `npm test src/components/Sidebar.test.tsx`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/Sidebar.test.tsx
git commit -m "test: update sidebar tests for profile prop"
```

---

## Task 5: Manual Verification + Cleanup

**Files:**
- Modify: `docs/verification/2026-01-16-profile-features.md` (new)

**Step 1: Check local env values**

Verify `.env.local` includes:
```
NEXT_PUBLIC_FREE_STORAGE_LIMIT=300000
NEXT_PUBLIC_PRO_STORAGE_LIMIT=10000000
NEXT_PUBLIC_FREE_LANGUAGE_LIMIT=1
```

**Step 2: Run manual flow**

Run: `npm run dev`
Then verify:
- Inactive users trigger activation dialog on save/create
- Settings page is blocked for inactive users
- Active users can save language + see storage

**Step 3: Remove unrelated artifacts**

If `text.txt` is not needed, delete it before committing:
```bash
rm text.txt
```

**Step 4: Add verification doc**

Create `docs/verification/2026-01-16-profile-features.md` summarizing manual checks performed.

**Step 5: Commit**

```bash
git add docs/verification/2026-01-16-profile-features.md
# (optionally) git add -u text.txt

git commit -m "docs: add profile features verification notes"
```

---

## Task 6: Full Test + Build Verification

**Step 1: Run full test suite**

Run: `npm test`
Expected: PASS

**Step 2: Run build**

Run: `npm run build`
Expected: PASS
