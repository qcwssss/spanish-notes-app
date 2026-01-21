import { describe, it, expect } from 'vitest';
import type { Collection, Folder } from '@/types/folder';
import type { Note } from '@/types/note';

describe('Folder System Types', () => {
  describe('Collection', () => {
    it('should have required fields', () => {
      const collection: Collection = {
        id: 'uuid-123',
        user_id: 'user-uuid',
        name: 'My Collection',
        is_default: true,
        created_at: '2026-01-21T00:00:00Z',
      };

      expect(collection.id).toBe('uuid-123');
      expect(collection.user_id).toBe('user-uuid');
      expect(collection.name).toBe('My Collection');
      expect(collection.is_default).toBe(true);
      expect(collection.created_at).toBeDefined();
    });

    it('should default is_default to false for non-default collections', () => {
      const collection: Collection = {
        id: 'uuid-456',
        user_id: 'user-uuid',
        name: 'Work',
        is_default: false,
        created_at: '2026-01-21T00:00:00Z',
      };

      expect(collection.is_default).toBe(false);
    });
  });

  describe('Folder', () => {
    it('should have required fields including collection_id', () => {
      const folder: Folder = {
        id: 'folder-uuid',
        user_id: 'user-uuid',
        collection_id: 'collection-uuid',
        name: 'My Notes',
        is_default: true,
        created_at: '2026-01-21T00:00:00Z',
      };

      expect(folder.id).toBe('folder-uuid');
      expect(folder.user_id).toBe('user-uuid');
      expect(folder.collection_id).toBe('collection-uuid');
      expect(folder.name).toBe('My Notes');
      expect(folder.is_default).toBe(true);
      expect(folder.created_at).toBeDefined();
    });

    it('should support non-default folders', () => {
      const folder: Folder = {
        id: 'folder-uuid-2',
        user_id: 'user-uuid',
        collection_id: 'collection-uuid',
        name: 'Work Projects',
        is_default: false,
        created_at: '2026-01-21T00:00:00Z',
      };

      expect(folder.is_default).toBe(false);
      expect(folder.name).toBe('Work Projects');
    });
  });

  describe('Note with folder fields', () => {
    it('should have folder_id field', () => {
      const note: Note = {
        id: 'note-uuid',
        user_id: 'user-uuid',
        title: 'Test Note',
        content: 'Content',
        folder_id: 'folder-uuid',
        is_favorite: false,
        created_at: '2026-01-21T00:00:00Z',
        updated_at: '2026-01-21T00:00:00Z',
      };

      expect(note.folder_id).toBe('folder-uuid');
      expect(note.is_favorite).toBe(false);
    });

    it('should support favorite notes', () => {
      const note: Note = {
        id: 'note-uuid',
        user_id: 'user-uuid',
        title: 'Favorite Note',
        folder_id: 'folder-uuid',
        is_favorite: true,
        updated_at: '2026-01-21T00:00:00Z',
      };

      expect(note.is_favorite).toBe(true);
    });
  });
});
