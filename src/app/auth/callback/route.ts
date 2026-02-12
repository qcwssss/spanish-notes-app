import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseConfig } from '@/utils/supabase/config';
import { ROUTES } from '@/constants';

function resolveSafeNext(next: string | null) {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return ROUTES.app;
  }

  const parsed = new URL(next, 'http://localhost');
  const safePath = `${parsed.pathname}${parsed.search}${parsed.hash}`;
  const allowedPaths = [ROUTES.app, ROUTES.settings, '/favorites'];
  const isAllowed = allowedPaths.some((path) => parsed.pathname === path || parsed.pathname.startsWith(`${path}/`));

  if (!isAllowed) {
    return ROUTES.app;
  }

  return safePath;
}

export async function GET(request: NextRequest) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = resolveSafeNext(searchParams.get('next'));
  const response = NextResponse.redirect(new URL(next, origin));

  if (!code) {
    return NextResponse.redirect(new URL('/?auth=error', origin));
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
