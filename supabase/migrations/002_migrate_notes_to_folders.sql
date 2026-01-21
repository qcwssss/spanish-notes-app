-- Migration: Add folder_id to notes and migrate existing data
-- Date: 2026-01-21
-- Run AFTER 001_create_folder_system.sql

-- Step 1: Create default collections for existing users with notes
INSERT INTO public.collections (user_id, name, is_default)
SELECT DISTINCT user_id, 'My Collection', true
FROM public.notes
WHERE user_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Step 2: Create default folders for each collection
INSERT INTO public.folders (user_id, collection_id, name, is_default)
SELECT c.user_id, c.id, 'My Notes', true
FROM public.collections c
WHERE c.is_default = true
ON CONFLICT DO NOTHING;

-- Step 3: Add folder_id column (nullable first)
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS folder_id uuid;

-- Step 4: Link existing notes to their user's default folder
UPDATE public.notes n
SET folder_id = f.id
FROM public.folders f
WHERE f.user_id = n.user_id AND f.is_default = true AND n.folder_id IS NULL;

-- Step 5: Add is_favorite column
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false;

-- Step 6: Make folder_id NOT NULL (only after data is migrated)
-- WARNING: Only run this after verifying all notes have folder_id
-- ALTER TABLE public.notes ALTER COLUMN folder_id SET NOT NULL;

-- Step 7: Add foreign key constraint
-- ALTER TABLE public.notes ADD CONSTRAINT fk_folder 
--   FOREIGN KEY (folder_id) REFERENCES public.folders(id) ON DELETE RESTRICT;
