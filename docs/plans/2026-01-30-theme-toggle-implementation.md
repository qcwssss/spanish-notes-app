# Theme Toggle Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a manual dark/light toggle (no system preference) with persistence and a sidebar toggle button, and make sidebar + main content readable in light mode.

**Architecture:** A small theme utility module manages persistence and root class toggling. Root layout injects an inline script to apply the stored theme before hydration. Sidebar renders a toggle button that updates the stored theme and DOM class.

**Tech Stack:** Next.js App Router, React, Tailwind v4, Vitest + React Testing Library.

---

### Task 1: Create theme utilities (TDD)

**Files:**
- Create: `src/utils/theme.ts`
- Test: `tests/utils/theme.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it, beforeEach } from 'vitest';
import { getStoredTheme, setStoredTheme, applyTheme, getThemeInitScript } from '@/utils/theme';

describe('theme utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('reads stored theme when present', () => {
    localStorage.setItem('app-theme', 'dark');
    expect(getStoredTheme()).toBe('dark');
  });

  it('returns null for invalid stored theme', () => {
    localStorage.setItem('app-theme', 'system');
    expect(getStoredTheme()).toBeNull();
  });

  it('applies dark theme by setting the html class', () => {
    applyTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes dark class for light theme', () => {
    document.documentElement.classList.add('dark');
    applyTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('builds an init script that reads app-theme', () => {
    const script = getThemeInitScript();
    expect(script).toContain('app-theme');
    expect(script).toContain('classList');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/utils/theme.test.ts`
Expected: FAIL (module not found / functions missing).

**Step 3: Write minimal implementation**

```ts
export type ThemePreference = 'dark' | 'light';

const THEME_KEY = 'app-theme';

export const getStoredTheme = (): ThemePreference | null => {
  if (typeof window === 'undefined') return null;
  const value = localStorage.getItem(THEME_KEY);
  return value === 'dark' || value === 'light' ? value : null;
};

export const setStoredTheme = (theme: ThemePreference) => {
  localStorage.setItem(THEME_KEY, theme);
};

export const applyTheme = (theme: ThemePreference) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

export const getThemeInitScript = () => `
(() => {
  try {
    var theme = localStorage.getItem('${THEME_KEY}');
    if (theme !== 'dark' && theme !== 'light') theme = 'dark';
    document.documentElement.classList.toggle('dark', theme === 'dark');
  } catch (_) {}
})();
`;
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/utils/theme.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add tests/utils/theme.test.ts src/utils/theme.ts
git commit -m "feat(theme): add theme utilities"
```

---

### Task 2: Initialize theme at app start (TDD)

**Files:**
- Modify: `src/app/layout.tsx`
- Test: `tests/app/layout.theme.test.tsx`

**Step 1: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import RootLayout from '@/app/layout';

describe('RootLayout theme init', () => {
  it('injects theme init script into html', () => {
    const html = renderToString(
      <RootLayout>
        <div />
      </RootLayout>
    );
    expect(html).toContain('app-theme');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/app/layout.theme.test.tsx`
Expected: FAIL (script not present).

**Step 3: Write minimal implementation**

```tsx
import { getThemeInitScript } from '@/utils/theme';
// inside RootLayout
<html lang="en" className={...} suppressHydrationWarning>
  <head>
    <script dangerouslySetInnerHTML={{ __html: getThemeInitScript() }} />
  </head>
  ...
</html>
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/app/layout.theme.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add tests/app/layout.theme.test.tsx src/app/layout.tsx
git commit -m "feat(theme): initialize theme before hydration"
```

---

### Task 3: Add sidebar toggle (TDD)

**Files:**
- Modify: `src/components/Sidebar.tsx`
- Test: `tests/components/Sidebar.test.tsx`

**Step 1: Write the failing test**

```tsx
import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '@/components/Sidebar';

describe('Sidebar theme toggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('toggles theme when clicking the theme button', () => {
    render(
      <Sidebar notes={[]} folders={[]} profile={null} selectedNoteId={null} />
    );
    const toggle = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(toggle);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    fireEvent.click(toggle);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/components/Sidebar.test.tsx`
Expected: FAIL (no toggle button).

**Step 3: Write minimal implementation**

- Add theme state in `Sidebar` using `getStoredTheme`, `setStoredTheme`, `applyTheme`
- Add a small toggle button near the bottom area (above `UserInfoCard`)
- Use `aria-label="Toggle theme"`

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/components/Sidebar.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add tests/components/Sidebar.test.tsx src/components/Sidebar.tsx
git commit -m "feat(theme): add sidebar toggle"
```

---

### Task 4: Minimum light mode styling

**Files:**
- Modify: `src/components/Sidebar.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

**Step 1: Write a focused test (optional)**

If a test is needed, add a simple test verifying light mode removes `dark` class on the root using `applyTheme('light')` (covered in Task 1).

**Step 2: Update styles**

- Replace hardcoded dark classes with light defaults + `dark:` overrides.
- Add Tailwind v4 class variant support in `globals.css` if needed:

```css
@custom-variant dark (&:is(.dark *));
```

**Step 3: Run tests**

Run: `npm test`
Expected: PASS (note existing warnings are acceptable if pre-existing).

**Step 4: Commit**

```bash
git add src/components/Sidebar.tsx src/app/page.tsx src/app/globals.css
git commit -m "feat(theme): add light mode styles for core layout"
```
