import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseConfig } from '@/utils/supabase/config';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const response = NextResponse.redirect(new URL('/', origin));

  if (!code) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL('/?auth=error', origin));
  }

  return response;
}
