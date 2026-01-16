'use server';

import { createServerClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface RedeemResult {
  success: boolean;
  message: string;
}

export async function redeemActivationCode(code: string): Promise<RedeemResult> {
  const supabase = await createServerClient();

  try {
    const { data, error } = await supabase.rpc('redeem_activation_code', {
      input_code: code
    });

    if (error) {
      return {
        success: false,
        message: `数据库错误: ${error.message}`
      };
    }

    const result = data as string;

    if (result === 'Success') {
      revalidatePath('/');
      return {
        success: true,
        message: '激活成功！'
      };
    } else if (result === 'Already activated') {
      return {
        success: false,
        message: '你的账户已经激活过了'
      };
    } else if (result === 'Invalid code') {
      return {
        success: false,
        message: '激活码无效'
      };
    } else if (result === 'Code fully used') {
      return {
        success: false,
        message: '激活码已用完'
      };
    } else {
      return {
        success: false,
        message: result
      };
    }
  } catch (err) {
    return {
      success: false,
      message: '激活失败，请稍后重试'
    };
  }
}
