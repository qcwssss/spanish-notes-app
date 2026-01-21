'use server';

import { createServerClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { Folder } from '@/types/folder';

export async function createFolder(name: string): Promise<Folder> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: collection } = await supabase
    .from('collections')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_default', true)
    .single();

  if (!collection) {
    throw new Error('Default collection not found');
  }

  const { data, error } = await supabase
    .from('folders')
    .insert([{
      user_id: user.id,
      collection_id: collection.id,
      name,
      is_default: false,
    }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  return data as Folder;
}

export async function renameFolder(id: string, name: string): Promise<Folder> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('folders')
    .update({ name })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  return data as Folder;
}

export async function deleteFolder(id: string): Promise<void> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: folder } = await supabase
    .from('folders')
    .select('id, is_default')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!folder) {
    throw new Error('Folder not found');
  }

  if (folder.is_default) {
    throw new Error('Cannot delete default folder');
  }

  const { data: notes } = await supabase
    .from('notes')
    .select('id')
    .eq('folder_id', id);

  if (notes && notes.length > 0) {
    throw new Error('Cannot delete folder with notes');
  }

  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
}
