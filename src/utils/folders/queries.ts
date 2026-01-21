'use server';

import { createServerClient } from '@/utils/supabase/server';
import { Folder } from '@/types/folder';

export async function getDefaultFolder(): Promise<Folder | null> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_default', true)
    .single();

  if (error) {
    return null;
  }

  return data as Folder;
}

export async function getFolders(): Promise<Folder[]> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    return [];
  }

  return data as Folder[];
}
