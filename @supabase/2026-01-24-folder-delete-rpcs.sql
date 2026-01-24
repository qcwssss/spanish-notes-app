CREATE OR REPLACE FUNCTION move_notes_and_delete_folder(
  input_folder_id uuid,
  input_default_folder_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_folder record;
  default_folder record;
BEGIN
  SELECT id, is_default, user_id
  INTO target_folder
  FROM folders
  WHERE id = input_folder_id AND user_id = auth.uid();

  IF target_folder IS NULL THEN
    RAISE EXCEPTION 'Folder not found';
  END IF;

  IF target_folder.is_default THEN
    RAISE EXCEPTION 'Cannot delete default folder';
  END IF;

  SELECT id, is_default, user_id
  INTO default_folder
  FROM folders
  WHERE id = input_default_folder_id AND user_id = auth.uid();

  IF default_folder IS NULL OR default_folder.is_default IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Default folder not found';
  END IF;

  UPDATE notes
  SET folder_id = default_folder.id
  WHERE user_id = auth.uid() AND folder_id = target_folder.id;

  DELETE FROM folders
  WHERE id = target_folder.id AND user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION delete_folder_and_notes(
  input_folder_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_folder record;
BEGIN
  SELECT id, is_default, user_id
  INTO target_folder
  FROM folders
  WHERE id = input_folder_id AND user_id = auth.uid();

  IF target_folder IS NULL THEN
    RAISE EXCEPTION 'Folder not found';
  END IF;

  IF target_folder.is_default THEN
    RAISE EXCEPTION 'Cannot delete default folder';
  END IF;

  DELETE FROM notes
  WHERE user_id = auth.uid() AND folder_id = target_folder.id;

  DELETE FROM folders
  WHERE id = target_folder.id AND user_id = auth.uid();
END;
$$;
