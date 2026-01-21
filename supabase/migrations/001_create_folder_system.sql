-- Migration: Create folder system tables
-- Date: 2026-01-21
-- Description: Creates collections and folders tables for note organization

-- Step 1: Create collections table
CREATE TABLE IF NOT EXISTS public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_collections_default ON public.collections(user_id) WHERE is_default = true;

-- Step 2: Create folders table
CREATE TABLE IF NOT EXISTS public.folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_folders_user_id ON public.folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_collection_id ON public.folders(collection_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_folders_default ON public.folders(user_id) WHERE is_default = true;

-- Step 3: Enable RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
CREATE POLICY "Users can CRUD own collections" ON public.collections
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own folders" ON public.folders
  FOR ALL USING (auth.uid() = user_id);
