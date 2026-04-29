'use server';

import { createServerClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { Note } from '@/types/note';
import { UNTITLED_NOTE_TITLE } from '@/constants';
import { getDefaultFolder } from '@/utils/folders/queries';

// ─── 创建 ───────────────────────────────────────────────────────────────────

export async function createNote(
  title: string = UNTITLED_NOTE_TITLE,
  content: string = '',
  folderId?: string
): Promise<Note> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  let targetFolderId = folderId;
  if (!targetFolderId) {
    const defaultFolder = await getDefaultFolder();
    if (!defaultFolder) {
      throw new Error('Default folder not found');
    }
    targetFolderId = defaultFolder.id;
  }

  const { data, error } = await supabase
    .from('notes')
    .insert([
      {
        user_id: user.id,
        title,
        content,
        folder_id: targetFolderId,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  return data as Note;
}

// ─── 更新 ───────────────────────────────────────────────────────────────────

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  // 过滤掉不允许手动更新的字段
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, user_id: _uid, created_at: _cat, ...safeUpdates } = updates;

  const { data, error } = await supabase
    .from('notes')
    .update({
      ...safeUpdates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/');
  return data as Note;
}

// ─── 删除 ───────────────────────────────────────────────────────────────────

export async function deleteNote(id: string): Promise<void> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);

  revalidatePath('/');
}

// ─── 移动 / 收藏 ────────────────────────────────────────────────────────────

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
