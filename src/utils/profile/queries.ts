'use server';

import { createServerClient } from '@/utils/supabase/server';
import { UserProfile } from '@/types/profile';
import { revalidatePath } from 'next/cache';

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

  if (error || !data) {
    // Profile 不存在（可能 handle_new_user trigger 未包含 profile 创建逻辑）
    // 调用兜底 RPC 创建 profile
    console.warn('用户 profile 未找到，尝试兜底创建:', user.id);
    const { error: rpcError } = await supabase.rpc('ensure_user_profile');
    if (rpcError) {
      console.error('兜底创建 profile 失败:', rpcError);
      return null;
    }

    // 重新查询
    const { data: retryData, error: retryError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (retryError || !retryData) {
      console.error('兜底创建后仍无法获取 profile:', retryError);
      return null;
    }

    return retryData as UserProfile;
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

  // 清除缓存，确保设置页面显示最新数据
  revalidatePath('/settings');
  revalidatePath('/');
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
