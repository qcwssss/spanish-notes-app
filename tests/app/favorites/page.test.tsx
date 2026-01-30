import { describe, it, expect, vi } from 'vitest';
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
  createServerClient: vi.fn(),
}));

describe('Favorites page', () => {
  it('filters favorites in the notes query', async () => {
    const { createServerClient } = await import('@/utils/supabase/server');
    const eqMock = vi.fn().mockReturnThis();
    const orderMock = vi.fn().mockResolvedValue({ data: [] });

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: eqMock,
          order: orderMock,
        }),
      }),
    };

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as never);

    await FavoritesPage();

    expect(eqMock).toHaveBeenCalledWith('is_favorite', true);
  });
});
