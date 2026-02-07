-- Migration: Create note shares and public share lookup function
-- Date: 2026-02-07

CREATE TABLE IF NOT EXISTS public.note_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_note_shares_note_id ON public.note_shares(note_id);
CREATE INDEX IF NOT EXISTS idx_note_shares_owner_id ON public.note_shares(owner_id);

ALTER TABLE public.note_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own note shares" ON public.note_shares
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create own note shares" ON public.note_shares
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own note shares" ON public.note_shares
  FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE OR REPLACE FUNCTION public.get_shared_note_by_token(input_token text)
RETURNS TABLE (
  note_id uuid,
  title text,
  content text,
  target_language text,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    n.id AS note_id,
    n.title,
    COALESCE(n.content, '') AS content,
    up.target_language,
    n.updated_at
  FROM public.note_shares ns
  JOIN public.notes n ON n.id = ns.note_id
  LEFT JOIN public.user_profiles up ON up.id = ns.owner_id
  WHERE ns.token = input_token
    AND ns.is_active = true
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_shared_note_by_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_note_by_token(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_shared_note_by_token(text) TO authenticated;
