import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserProfile, updateTargetLanguage, calculateStorageUsed } from './queries';

// Mock Supabase
vi.mock('@/utils/supabase/server', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null
      }))
    },
    from: vi.fn((table: string) => {
      if (table === 'user_profiles') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({
                data: {
                  id: 'test-user-id',
                  email: 'test@example.com',
                  is_active: true,
                  storage_used: 5000,
                  plan_type: 'free',
                  target_language: 'es',
                  created_at: '2026-01-15T00:00:00Z'
                },
                error: null
              }))
            }))
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({
              error: null
            }))
          }))
        };
      }
      if (table === 'notes') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({
              data: [
                { content: 'Hello world' },
                { content: 'Test note' }
              ],
              error: null
            }))
          }))
        };
      }
      return {};
    })
  }))
}));

describe('getUserProfile', () => {
  it('should fetch user profile successfully', async () => {
    const profile = await getUserProfile();
    expect(profile).toBeDefined();
    expect(profile?.email).toBe('test@example.com');
    expect(profile?.is_active).toBe(true);
    expect(profile?.plan_type).toBe('free');
    expect(profile?.target_language).toBe('es');
    expect(profile?.storage_used).toBe(40);
  });

  it('should return null when user not authenticated', async () => {
    const { createServerClient } = await import('@/utils/supabase/server');
    vi.mocked(createServerClient).mockReturnValueOnce({
      auth: {
        getUser: vi.fn(() => Promise.resolve({
          data: { user: null },
          error: null
        }))
      }
    } as any);

    const profile = await getUserProfile();
    expect(profile).toBeNull();
  });
});

describe('updateTargetLanguage', () => {
  it('should update target language successfully', async () => {
    await expect(updateTargetLanguage('fr')).resolves.not.toThrow();
  });

  it('should throw error when user not authenticated', async () => {
    const { createServerClient } = await import('@/utils/supabase/server');
    vi.mocked(createServerClient).mockReturnValueOnce({
      auth: {
        getUser: vi.fn(() => Promise.resolve({
          data: { user: null },
          error: null
        }))
      }
    } as any);

    await expect(updateTargetLanguage('fr')).rejects.toThrow('Not authenticated');
  });
});

describe('calculateStorageUsed', () => {
  it('should calculate storage from notes content', async () => {
    const storage = await calculateStorageUsed('test-user-id');
    // 'Hello world' (11 chars) + 'Test note' (9 chars) = 20 chars * 2 = 40 bytes
    expect(storage).toBe(40);
  });

  it('should return 0 when no notes found', async () => {
    const { createServerClient } = await import('@/utils/supabase/server');
    vi.mocked(createServerClient).mockReturnValueOnce({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            data: [],
            error: null
          }))
        }))
      }))
    } as any);

    const storage = await calculateStorageUsed('test-user-id');
    expect(storage).toBe(0);
  });
});
