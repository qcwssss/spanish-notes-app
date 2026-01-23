import { describe, it, expect } from 'vitest';
import { shouldShowHierarchy } from '@/utils/folders/display';
import type { Folder } from '@/types/folder';

describe('shouldShowHierarchy', () => {
  const mockDefaultFolder: Folder = {
    id: 'default-folder',
    user_id: 'user-123',
    collection_id: 'collection-123',
    name: 'My Notes',
    is_default: true,
    created_at: '2026-01-21T00:00:00Z',
  };

  const mockRealFolder: Folder = {
    id: 'work-folder',
    user_id: 'user-123',
    collection_id: 'collection-123',
    name: 'Work',
    is_default: false,
    created_at: '2026-01-21T00:00:00Z',
  };

  it('should return false when only default folder exists', () => {
    const folders = [mockDefaultFolder];

    expect(shouldShowHierarchy(folders)).toBe(false);
  });

  it('should return false when folders array is empty', () => {
    expect(shouldShowHierarchy([])).toBe(false);
  });

  it('should return true when real folders exist', () => {
    const folders = [mockDefaultFolder, mockRealFolder];

    expect(shouldShowHierarchy(folders)).toBe(true);
  });

  it('should return true when only non-default folders exist', () => {
    const folders = [mockRealFolder];

    expect(shouldShowHierarchy(folders)).toBe(true);
  });
});
