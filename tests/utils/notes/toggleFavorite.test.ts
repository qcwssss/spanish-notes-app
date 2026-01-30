import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toggleFavorite } from '@/utils/notes/actions';

vi.mock('@/utils/supabase/server', () => ({
  createServerClient: vi.fn(),
}));

const mockRevalidatePath = vi.fn();
vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

describe('toggleFavorite', () => {
  const mockUserId = 'user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('revalidates favorites page after toggling', async () => {
    const { createServerClient } = await import('@/utils/supabase/server');
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } } }),
      },
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'note-1', is_favorite: true },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      }),
    };
    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as never);

    await toggleFavorite('note-1', true);

    expect(mockRevalidatePath).toHaveBeenCalledWith('/favorites');
  });
});
