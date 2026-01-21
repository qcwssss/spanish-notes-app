import { describe, it, expect, vi, beforeEach } from 'vitest';
import { moveNote } from '@/utils/notes/actions';

vi.mock('@/utils/supabase/server', () => ({
  createServerClient: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('moveNote', () => {
  const mockUserId = 'user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should move a note to another folder', async () => {
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
                  data: { id: 'note-1', folder_id: 'target-folder' },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      }),
    };
    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as never);

    const result = await moveNote('note-1', 'target-folder');

    expect(result.folder_id).toBe('target-folder');
  });

  it('should throw error if user is not authenticated', async () => {
    const { createServerClient } = await import('@/utils/supabase/server');
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    };
    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as never);

    await expect(moveNote('note-1', 'target-folder')).rejects.toThrow('User not authenticated');
  });
});
