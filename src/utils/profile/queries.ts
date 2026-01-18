'use server';

import { createServerClient } from '@/utils/supabase/server';
import { UserProfile } from '@/types/profile';

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data as UserProfile;
}

export async function updateTargetLanguage(language: string): Promise<void> {
  const supabase = await createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('user_profiles')
    .update({ target_language: language })
    .eq('id', user.id);

  if (error) {
    throw new Error(`Failed to update language: ${error.message}`);
  }
}

export async function calculateStorageUsed(userId: string): Promise<number> {
  const supabase = await createServerClient();
  
  const { data: notes, error } = await supabase
    .from('notes')
    .select('content')
    .eq('user_id', userId);

  if (error) {
    console.error('Error calculating storage:', error);
    return 0;
  }

  // Calculate total character count
  const totalChars = notes?.reduce((sum, note) => {
    return sum + (note.content?.length || 0);
  }, 0) || 0;

  // Convert to approximate bytes (1 char ≈ 2 bytes)
  return totalChars * 2;
}
