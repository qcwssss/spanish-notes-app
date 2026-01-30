'use server';

import { createServerClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { Note } from '@/types/note';

export async function moveNote(noteId: string, targetFolderId: string): Promise<Note> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('notes')
    .update({ folder_id: targetFolderId })
    .eq('id', noteId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  return data as Note;
}

export async function toggleFavorite(noteId: string, isFavorite: boolean): Promise<Note> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('notes')
    .update({ is_favorite: isFavorite })
    .eq('id', noteId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/favorites');
  return data as Note;
}
