import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createNote } from '@/utils/notes/actions';

vi.mock('@/utils/supabase/server', () => ({
  createServerClient: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/utils/folders/queries', () => ({
  getDefaultFolder: vi.fn(),
}));

describe('createNote', () => {
  const mockUserId = 'user-123';
  const mockDefaultFolder = { id: 'default-folder-id', name: 'My Notes', is_default: true };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create note with folder_id set to default folder', async () => {
    const { createServerClient } = await import('@/utils/supabase/server');
    const { getDefaultFolder } = await import('@/utils/folders/queries');

    const mockNote = {
      id: 'new-note-id',
      title: 'Test Note',
      content: '',
      folder_id: mockDefaultFolder.id,
      user_id: mockUserId,
    };

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } } }),
      },
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockNote, error: null }),
          }),
        }),
      }),
    };

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as never);
    vi.mocked(getDefaultFolder).mockResolvedValue(mockDefaultFolder as never);

    const result = await createNote('Test Note', '');

    expect(getDefaultFolder).toHaveBeenCalled();
    expect(result.folder_id).toBe(mockDefaultFolder.id);
    expect(mockSupabase.from).toHaveBeenCalledWith('notes');
  });

  it('should create note using provided folder id', async () => {
    const { createServerClient } = await import('@/utils/supabase/server');
    const { getDefaultFolder } = await import('@/utils/folders/queries');

    const mockNote = {
      id: 'new-note-id',
      title: 'Test Note',
      content: '',
      folder_id: 'custom-folder-id',
      user_id: mockUserId,
    };

    const insertMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: mockNote, error: null }),
      }),
    });

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } } }),
      },
      from: vi.fn().mockReturnValue({ insert: insertMock }),
    };

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as never);

    await createNote('Test Note', '', 'custom-folder-id');

    expect(getDefaultFolder).not.toHaveBeenCalled();
    expect(insertMock).toHaveBeenCalledWith([
      expect.objectContaining({
        folder_id: 'custom-folder-id',
        user_id: mockUserId,
      }),
    ]);
  });

  it('should throw error if user is not authenticated', async () => {
    const { createServerClient } = await import('@/utils/supabase/server');

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    };

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as never);

    await expect(createNote('Test', '')).rejects.toThrow('User not authenticated');
  });

  it('should throw error if default folder not found', async () => {
    const { createServerClient } = await import('@/utils/supabase/server');
    const { getDefaultFolder } = await import('@/utils/folders/queries');

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } } }),
      },
    };

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as never);
    vi.mocked(getDefaultFolder).mockResolvedValue(null);

    await expect(createNote('Test', '')).rejects.toThrow('Default folder not found');
  });

  it('should use default title when not provided', async () => {
    const { createServerClient } = await import('@/utils/supabase/server');
    const { getDefaultFolder } = await import('@/utils/folders/queries');

    const mockNote = {
      id: 'new-note-id',
      title: 'Untitled',
      content: '',
      folder_id: mockDefaultFolder.id,
      user_id: mockUserId,
    };

    const insertMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: mockNote, error: null }),
      }),
    });

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } } }),
      },
      from: vi.fn().mockReturnValue({ insert: insertMock }),
    };

    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as never);
    vi.mocked(getDefaultFolder).mockResolvedValue(mockDefaultFolder as never);

    await createNote();

    expect(insertMock).toHaveBeenCalledWith([
      expect.objectContaining({
        folder_id: mockDefaultFolder.id,
        user_id: mockUserId,
      }),
    ]);
  });
});
