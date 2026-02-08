import { describe, it, expect, vi } from 'vitest';
import { createOrGetNoteShare } from '@/utils/shares/queries';

vi.mock('@/utils/supabase/server', () => ({
  createServerClient: vi.fn(),
}));

describe('share queries', () => {
  it('updates latest share timestamp when reactivating revoked share', async () => {
    const { createServerClient } = await import('@/utils/supabase/server');

    let updatePayload: Record<string, unknown> | null = null;
    let latestSharedAt: string | undefined;

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
      },
      from: vi.fn((table: string) => {
        if (table === 'notes') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'note-1' }, error: null }),
                })),
              })),
            })),
          };
        }

        if (table === 'note_shares') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: 'share-1', token: 'token-old', is_active: false },
                  error: null,
                }),
              })),
            })),
            update: vi.fn((payload: Record<string, unknown>) => {
              updatePayload = payload;
              latestSharedAt = payload.created_at as string | undefined;
              return {
                eq: vi.fn(() => ({
                  select: vi.fn(() => ({
                    single: vi.fn().mockResolvedValue({ data: { token: 'token-old' }, error: null }),
                  })),
                })),
              };
            }),
          };
        }

        return {};
      }),
    };

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as never);

    const result = await createOrGetNoteShare('note-1');

    expect(result.token).toBe('token-old');
    expect(updatePayload).toBeTruthy();
    expect(updatePayload).toMatchObject({ is_active: true });
    expect(typeof latestSharedAt).toBe('string');
    expect(Number.isNaN(Date.parse(latestSharedAt as string))).toBe(false);
  });
});
