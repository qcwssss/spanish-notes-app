import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDefaultFolder, getFolders } from '@/utils/folders/queries';
import type { Folder } from '@/types/folder';

vi.mock('@/utils/supabase/server', () => ({
  createServerClient: vi.fn(),
}));

describe('Folder Queries', () => {
  const mockUserId = 'user-123';
  const mockDefaultFolder: Folder = {
    id: 'folder-default',
    user_id: mockUserId,
    collection_id: 'collection-123',
    name: 'My Notes',
    is_default: true,
    created_at: '2026-01-21T00:00:00Z',
  };

  const mockFolders: Folder[] = [
    mockDefaultFolder,
    {
      id: 'folder-work',
      user_id: mockUserId,
      collection_id: 'collection-123',
      name: 'Work',
      is_default: false,
      created_at: '2026-01-21T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDefaultFolder', () => {
    it('should return the default folder for a user', async () => {
      const { createServerClient } = await import('@/utils/supabase/server');
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } } }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockDefaultFolder, error: null }),
              }),
            }),
          }),
        }),
      };
      vi.mocked(createServerClient).mockResolvedValue(mockSupabase as never);

      const folder = await getDefaultFolder();

      expect(folder).toBeDefined();
      expect(folder?.is_default).toBe(true);
      expect(folder?.name).toBe('My Notes');
    });

    it('should return null if user is not authenticated', async () => {
      const { createServerClient } = await import('@/utils/supabase/server');
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      };
      vi.mocked(createServerClient).mockResolvedValue(mockSupabase as never);

      const folder = await getDefaultFolder();

      expect(folder).toBeNull();
    });
  });

  describe('getFolders', () => {
    it('should return all folders for a user', async () => {
      const { createServerClient } = await import('@/utils/supabase/server');
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } } }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockFolders, error: null }),
            }),
          }),
        }),
      };
      vi.mocked(createServerClient).mockResolvedValue(mockSupabase as never);

      const folders = await getFolders();

      expect(folders).toHaveLength(2);
      expect(folders.some(f => f.is_default)).toBe(true);
    });

    it('should return empty array if user is not authenticated', async () => {
      const { createServerClient } = await import('@/utils/supabase/server');
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      };
      vi.mocked(createServerClient).mockResolvedValue(mockSupabase as never);

      const folders = await getFolders();

      expect(folders).toEqual([]);
    });
  });
});
