'use server';

import { createServerClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface RedeemResult {
  success: boolean;
  status: 'success' | 'already_activated' | 'invalid_code' | 'code_fully_used' | 'db_error' | 'unknown_error';
  message?: string;
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
        status: 'db_error',
        message: error.message
      };
    }

    const result = data as string;

    if (result === 'Success') {
      revalidatePath('/');
      return {
        success: true,
        status: 'success'
      };
    } else if (result === 'Already activated') {
      return {
        success: false,
        status: 'already_activated'
      };
    } else if (result === 'Invalid code') {
      return {
        success: false,
        status: 'invalid_code'
      };
    } else if (result === 'Code fully used') {
      return {
        success: false,
        status: 'code_fully_used'
      };
    } else {
      return {
        success: false,
        status: 'unknown_error',
        message: result
      };
    }
  } catch (err) {
    return {
      success: false,
      status: 'unknown_error'
    };
  }
}
