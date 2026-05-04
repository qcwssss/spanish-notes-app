'use server';

import { createServerClient } from '@/utils/supabase/server';
import { Note, NoteListItem } from '@/types/note';

export async function fetchNote(id: string): Promise<Note | null> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
    
    if (error) return null;
    return data as Note;
}

export async function getNotes(): Promise<NoteListItem[]> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from('notes')
        .select('id, title, updated_at, folder_id, is_favorite')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
    
    if (error) return [];
    return data as NoteListItem[];
}
