-- Migration: Add lightweight shared note version lookup by token
-- Date: 2026-02-08

CREATE OR REPLACE FUNCTION public.get_shared_note_version_by_token(input_token text)
RETURNS TABLE (
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    n.updated_at
  FROM public.note_shares ns
  JOIN public.notes n ON n.id = ns.note_id
  WHERE ns.token = input_token
    AND ns.is_active = true
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_shared_note_version_by_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_note_version_by_token(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_shared_note_version_by_token(text) TO authenticated;
