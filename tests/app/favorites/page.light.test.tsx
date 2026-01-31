import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import FavoritesPage from '@/app/favorites/page';

vi.mock('@/components/AuthGate', () => ({
  default: () => null,
}));

vi.mock('@/components/Sidebar', () => ({
  default: () => null,
}));

vi.mock('@/components/FavoritesView', () => ({
  default: () => null,
}));

vi.mock('@/utils/profile/queries', () => ({
  getUserProfile: vi.fn(() => Promise.resolve(null)),
}));

vi.mock('@/utils/folders/queries', () => ({
  getFolders: vi.fn(() => Promise.resolve([])),
}));

vi.mock('@/utils/supabase/server', () => ({
  createServerClient: vi.fn(() =>
    Promise.resolve({
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({ data: [] }),
          }),
        }),
      }),
    })
  ),
}));

describe('Favorites page light mode', () => {
  it('uses light default background and text', async () => {
    const ui = await FavoritesPage();
    const { container } = render(ui);
    const root = container.firstChild as HTMLElement;

    expect(root.className).toContain('bg-slate-50');
    expect(root.className).toContain('text-slate-900');
    expect(root.className).toContain('dark:bg-slate-950');
    expect(root.className).toContain('dark:text-slate-100');
  });
});
