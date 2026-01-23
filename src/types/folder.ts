// Collection - V1: hidden in UI, kept for future expansion
export interface Collection {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
}

// Folder - belongs to a Collection
export interface Folder {
  id: string;
  user_id: string;
  collection_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
}

// SYNC WARNING: These values are also defined in SQL migrations:
// - supabase/migrations/002_migrate_notes_to_folders.sql
// - supabase/migrations/003_create_new_user_trigger.sql
// Keep them in sync if you change these values.
export const DEFAULT_COLLECTION_NAME = 'My Collection';
export const DEFAULT_FOLDER_NAME = 'My Notes';
