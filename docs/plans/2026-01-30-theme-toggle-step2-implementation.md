# Theme Toggle Step 2 (Full Light Mode) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Polish light mode across all UI surfaces with a bright neutral palette while preserving dark mode via `dark:` overrides.

**Architecture:** Keep Tailwind utility classes inline; make light the default and add `dark:` overrides for backgrounds, borders, and text. Update each surface in place with minimal structural changes. Verify via small class-existence tests and full suite run.

**Tech Stack:** Next.js App Router, React, Tailwind v4, Vitest + React Testing Library.

---

### Task 1: Page containers (favorites + settings)

**Files:**
- Modify: `src/app/favorites/page.tsx`
- Modify: `src/app/settings/page.tsx`
- Test: `tests/app/favorites/page.light.test.tsx`
- Test: `tests/app/settings/page.light.test.tsx`

**Step 1: Write the failing tests**

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import FavoritesPage from '@/app/favorites/page';

describe('Favorites page light mode', () => {
  it('uses light default background and text', () => {
    const { container } = render(<FavoritesPage />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('bg-slate-50');
    expect(root.className).toContain('text-slate-900');
    expect(root.className).toContain('dark:bg-slate-950');
  });
});
```

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import SettingsPage from '@/app/settings/page';

describe('Settings page light mode', () => {
  it('uses light default background and text', () => {
    const { container } = render(<SettingsPage />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('bg-slate-50');
    expect(root.className).toContain('text-slate-900');
    expect(root.className).toContain('dark:bg-slate-950');
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- tests/app/favorites/page.light.test.tsx`
Expected: FAIL (missing classes)

Run: `npm test -- tests/app/settings/page.light.test.tsx`
Expected: FAIL (missing classes)

**Step 3: Write minimal implementation**

- Update `src/app/favorites/page.tsx` and `src/app/settings/page.tsx` to use light defaults:
  - `bg-slate-50 text-slate-900`
  - `dark:bg-slate-950 dark:text-slate-100`

**Step 4: Run tests to verify they pass**

Run: `npm test -- tests/app/favorites/page.light.test.tsx`
Expected: PASS

Run: `npm test -- tests/app/settings/page.light.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/favorites/page.tsx src/app/settings/page.tsx tests/app/favorites/page.light.test.tsx tests/app/settings/page.light.test.tsx
git commit -m "feat(theme): add light defaults to favorites/settings pages"
```

---

### Task 2: Settings form + cards

**Files:**
- Modify: `src/app/settings/SettingsForm.tsx`
- Test: `tests/app/settings/SettingsForm.light.test.tsx`

**Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import SettingsForm from '@/app/settings/SettingsForm';

describe('SettingsForm light mode', () => {
  it('uses light card and input defaults with dark overrides', () => {
    const { container } = render(<SettingsForm profile={null} />);
    const card = container.querySelector('[data-testid="settings-card"]') as HTMLElement;
    expect(card.className).toContain('bg-white');
    expect(card.className).toContain('border-slate-200');
    expect(card.className).toContain('dark:bg-slate-900');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/app/settings/SettingsForm.light.test.tsx`
Expected: FAIL (missing classes/testid)

**Step 3: Write minimal implementation**

- Add `data-testid="settings-card"` to the primary card wrapper.
- Update card and input classes to light defaults + `dark:` overrides.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/app/settings/SettingsForm.light.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/settings/SettingsForm.tsx tests/app/settings/SettingsForm.light.test.tsx
git commit -m "feat(theme): polish settings form light styles"
```

---

### Task 3: Editor + markdown + practice container

**Files:**
- Modify: `src/components/Editor.tsx`
- Modify: `src/components/MarkdownRenderer.tsx`
- Modify: `src/components/NotePlayer.tsx`
- Test: `tests/components/Editor.light.test.tsx`

**Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Editor from '@/components/Editor';

describe('Editor light mode', () => {
  it('uses light defaults for editor surface', () => {
    const { container } = render(
      <Editor
        note={{ id: '1', title: 'Test', content: '', created_at: '', updated_at: '', user_id: '' }}
        isActive={true}
        targetLanguage="es"
        initialEditMode={false}
      />
    );
    const surface = container.querySelector('[data-testid="editor-surface"]') as HTMLElement;
    expect(surface.className).toContain('bg-white');
    expect(surface.className).toContain('border-slate-200');
    expect(surface.className).toContain('dark:bg-slate-900');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/components/Editor.light.test.tsx`
Expected: FAIL (missing classes/testid)

**Step 3: Write minimal implementation**

- Add `data-testid="editor-surface"` on the editor container.
- Replace hardcoded dark text/background in Editor, NotePlayer, and MarkdownRenderer with light defaults + `dark:` overrides.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/components/Editor.light.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/Editor.tsx src/components/MarkdownRenderer.tsx src/components/NotePlayer.tsx tests/components/Editor.light.test.tsx
git commit -m "feat(theme): polish editor and markdown light styles"
```

---

### Task 4: Dialogs, toast, auth, favorites, user card

**Files:**
- Modify: `src/components/ActivationDialog.tsx`
- Modify: `src/components/CreateFolderDialog.tsx`
- Modify: `src/components/DraggableNote.tsx`
- Modify: `src/components/DroppableFolder.tsx`
- Modify: `src/components/Toast.tsx`
- Modify: `src/components/ToastProvider.tsx`
- Modify: `src/components/AuthGate.tsx`
- Modify: `src/components/UserInfoCard.tsx`
- Modify: `src/components/FavoritesView.tsx`
- Modify: `src/components/StorageIndicator.tsx`
- Test: `tests/components/AuthGate.light.test.tsx`

**Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import AuthGate from '@/components/AuthGate';

describe('AuthGate light mode', () => {
  it('uses light card defaults with dark overrides', () => {
    const { container } = render(<AuthGate />);
    const card = container.querySelector('[data-testid="auth-card"]') as HTMLElement;
    expect(card.className).toContain('bg-white');
    expect(card.className).toContain('border-slate-200');
    expect(card.className).toContain('dark:bg-slate-900');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/components/AuthGate.light.test.tsx`
Expected: FAIL (missing classes/testid)

**Step 3: Write minimal implementation**

- Add `data-testid="auth-card"` to AuthGate card wrapper.
- Update dialog content, toast, favorites list, and user card to light defaults + `dark:` overrides.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/components/AuthGate.light.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/ActivationDialog.tsx src/components/CreateFolderDialog.tsx src/components/DraggableNote.tsx src/components/DroppableFolder.tsx src/components/Toast.tsx src/components/AuthGate.tsx src/components/UserInfoCard.tsx src/components/FavoritesView.tsx tests/components/AuthGate.light.test.tsx
git commit -m "feat(theme): polish dialogs and cards for light mode"
```

---

### Task 5: Full verification

**Files:**
- Modify: none

**Step 1: Run full test suite**

Run: `npm test`
Expected: PASS (existing warnings acceptable if pre-existing).

**Step 2: Commit**

```bash
git commit -m "test: verify theme light mode suite"
```
