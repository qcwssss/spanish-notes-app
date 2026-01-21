import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createFolder, renameFolder, deleteFolder } from '@/utils/folders/actions';
import type { Folder } from '@/types/folder';

vi.mock('@/utils/supabase/server', () => ({
  createServerClient: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Folder Actions', () => {
  const mockUserId = 'user-123';
  const mockCollectionId = 'collection-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createFolder', () => {
    it('should create a new folder', async () => {
      const { createServerClient } = await import('@/utils/supabase/server');
      const newFolder: Folder = {
        id: 'new-folder-id',
        user_id: mockUserId,
        collection_id: mockCollectionId,
        name: 'Work',
        is_default: false,
        created_at: '2026-01-21T00:00:00Z',
      };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } } }),
        },
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'collections') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ 
                      data: { id: mockCollectionId }, 
                      error: null 
                    }),
                  }),
                }),
              }),
            };
          }
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: newFolder, error: null }),
              }),
            }),
          };
        }),
      };
      vi.mocked(createServerClient).mockResolvedValue(mockSupabase as never);

      const folder = await createFolder('Work');

      expect(folder.name).toBe('Work');
      expect(folder.is_default).toBe(false);
    });

    it('should throw error if user is not authenticated', async () => {
      const { createServerClient } = await import('@/utils/supabase/server');
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      };
      vi.mocked(createServerClient).mockResolvedValue(mockSupabase as never);

      await expect(createFolder('Work')).rejects.toThrow('User not authenticated');
    });
  });

  describe('renameFolder', () => {
    it('should rename a folder', async () => {
      const { createServerClient } = await import('@/utils/supabase/server');
      const updatedFolder: Folder = {
        id: 'folder-id',
        user_id: mockUserId,
        collection_id: mockCollectionId,
        name: 'New Name',
        is_default: false,
        created_at: '2026-01-21T00:00:00Z',
      };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } } }),
        },
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: updatedFolder, error: null }),
                }),
              }),
            }),
          }),
        }),
      };
      vi.mocked(createServerClient).mockResolvedValue(mockSupabase as never);

      const folder = await renameFolder('folder-id', 'New Name');

      expect(folder.name).toBe('New Name');
    });
  });

  describe('deleteFolder', () => {
    it('should delete an empty non-default folder', async () => {
      const { createServerClient } = await import('@/utils/supabase/server');
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } } }),
        },
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'folders') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ 
                      data: { id: 'folder-id', is_default: false }, 
                      error: null 
                    }),
                  }),
                }),
              }),
              delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({ error: null }),
                }),
              }),
            };
          }
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          };
        }),
      };
      vi.mocked(createServerClient).mockResolvedValue(mockSupabase as never);

      await expect(deleteFolder('folder-id')).resolves.not.toThrow();
    });

    it('should NOT delete the default folder', async () => {
      const { createServerClient } = await import('@/utils/supabase/server');
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } } }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ 
                  data: { id: 'default-folder', is_default: true }, 
                  error: null 
                }),
              }),
            }),
          }),
        }),
      };
      vi.mocked(createServerClient).mockResolvedValue(mockSupabase as never);

      await expect(deleteFolder('default-folder')).rejects.toThrow('Cannot delete default folder');
    });

    it('should NOT delete a folder with notes', async () => {
      const { createServerClient } = await import('@/utils/supabase/server');
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } } }),
        },
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'folders') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ 
                      data: { id: 'folder-id', is_default: false }, 
                      error: null 
                    }),
                  }),
                }),
              }),
            };
          }
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [{ id: 'note-1' }], error: null }),
            }),
          };
        }),
      };
      vi.mocked(createServerClient).mockResolvedValue(mockSupabase as never);

      await expect(deleteFolder('folder-id')).rejects.toThrow('Cannot delete folder with notes');
    });
  });
});
