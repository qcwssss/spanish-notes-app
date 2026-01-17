import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const exchangeCodeForSession = vi.fn(() => Promise.resolve({ data: { session: {} }, error: null }));

vi.mock('@/utils/supabase/config', () => ({
  getSupabaseConfig: () => ({ supabaseUrl: 'https://supabase.test', supabaseAnonKey: 'anon' }),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: {
      exchangeCodeForSession,
    },
  }),
}));

vi.mock('next/server', async () => {
  const actual = await vi.importActual<typeof import('next/server')>('next/server');
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      redirect: (url: URL) => ({ redirected: true, url: url.toString() }),
    },
  };
});

describe('auth callback route', () => {
  it('exchanges code and redirects to home', async () => {
    const request = new NextRequest('http://localhost/auth/callback?code=abc');
    const response = await GET(request);

    expect(exchangeCodeForSession).toHaveBeenCalledWith('abc');
    expect(response).toEqual({ redirected: true, url: 'http://localhost/' });
  });
});
