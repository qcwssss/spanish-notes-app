CREATE OR REPLACE FUNCTION public.refresh_storage_used()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
BEGIN
  target_user_id := COALESCE(NEW.user_id, OLD.user_id);

  UPDATE user_profiles
  SET storage_used = COALESCE((
    SELECT SUM(octet_length(content))
    FROM notes
    WHERE user_id = target_user_id
  ), 0)
  WHERE id = target_user_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS notes_refresh_storage_used ON notes;
CREATE TRIGGER notes_refresh_storage_used
  AFTER INSERT OR UPDATE OR DELETE ON notes
  FOR EACH ROW EXECUTE PROCEDURE public.refresh_storage_used();
