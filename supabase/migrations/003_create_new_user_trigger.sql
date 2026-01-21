-- Migration: Create trigger for new user default structure
-- Date: 2026-01-21
-- Eager Create: auto-create default Collection and Folder when user registers

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_collection_id uuid;
BEGIN
  INSERT INTO public.collections (user_id, name, is_default)
  VALUES (NEW.id, 'My Collection', true)
  RETURNING id INTO new_collection_id;
  
  INSERT INTO public.folders (user_id, collection_id, name, is_default)
  VALUES (NEW.id, new_collection_id, 'My Notes', true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
