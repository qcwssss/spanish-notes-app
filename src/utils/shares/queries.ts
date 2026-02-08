'use server';

import { createServerClient } from '@/utils/supabase/server';

export interface SharedNoteView {
  id: string;
  title: string;
  content: string;
  targetLanguage: string | null;
  updatedAt: string;
}

const generateShareToken = () => {
  return `${crypto.randomUUID().replace(/-/g, '')}${crypto.randomUUID().replace(/-/g, '')}`;
};

async function requireOwnerNote(noteId: string) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: note, error } = await supabase
    .from('notes')
    .select('id')
    .eq('id', noteId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!note) {
    throw new Error('Note not found');
  }

  return { supabase, userId: user.id };
}

export async function getActiveShareToken(noteId: string): Promise<string | null> {
  const { supabase } = await requireOwnerNote(noteId);

  const { data, error } = await supabase
    .from('note_shares')
    .select('token, is_active')
    .eq('note_id', noteId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || !data.is_active) {
    return null;
  }

  return data.token as string;
}

export async function createOrGetNoteShare(noteId: string): Promise<{ token: string }> {
  const { supabase, userId } = await requireOwnerNote(noteId);

  const { data: existing, error: existingError } = await supabase
    .from('note_shares')
    .select('id, token, is_active')
    .eq('note_id', noteId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing?.is_active) {
    return { token: existing.token as string };
  }

  if (existing && !existing.is_active) {
    const { data: updated, error: updateError } = await supabase
      .from('note_shares')
      .update({ is_active: true })
      .eq('id', existing.id)
      .select('token')
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    return { token: updated.token as string };
  }

  const token = generateShareToken();
  const { data: created, error: createError } = await supabase
    .from('note_shares')
    .insert({
      note_id: noteId,
      owner_id: userId,
      token,
      is_active: true,
    })
    .select('token')
    .single();

  if (createError) {
    const duplicateKey = (createError as { code?: string }).code === '23505';
    if (duplicateKey) {
      const { data: concurrent, error: concurrentError } = await supabase
        .from('note_shares')
        .select('token')
        .eq('note_id', noteId)
        .maybeSingle();

      if (!concurrentError && concurrent?.token) {
        return { token: concurrent.token as string };
      }
    }
    throw new Error(createError.message);
  }

  return { token: (created.token as string) || token };
}

export async function revokeNoteShare(noteId: string): Promise<void> {
  const { supabase } = await requireOwnerNote(noteId);

  const { error } = await supabase
    .from('note_shares')
    .update({ is_active: false })
    .eq('note_id', noteId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getSharedNoteByToken(token: string): Promise<SharedNoteView | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc('get_shared_note_by_token', {
    input_token: token,
  });

  if (error) {
    throw new Error(error.message);
  }

  const row = Array.isArray(data) ? data[0] : null;
  if (!row) {
    return null;
  }

  return {
    id: row.note_id as string,
    title: row.title as string,
    content: row.content as string,
    targetLanguage: row.target_language as string | null,
    updatedAt: row.updated_at as string,
  };
}
