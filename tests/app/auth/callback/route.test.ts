import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/auth/callback/route';

const exchangeCodeForSession = vi.fn();
exchangeCodeForSession.mockResolvedValue({ data: { session: {} }, error: null });

vi.mock('@/utils/supabase/config', () => ({
  getSupabaseConfig: () => ({ supabaseUrl: 'https://supabase.test', supabaseAnonKey: 'anon' }),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: {
      exchangeCodeForSession,
      getUser: () => Promise.resolve({ data: { user: { id: 'u1' } } }),
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
  it('exchanges code and redirects to root', async () => {
    const request = new NextRequest('http://localhost/auth/callback?code=abc');
    const response = await GET(request);

    expect(exchangeCodeForSession).toHaveBeenCalledWith('abc');
    expect(response).toEqual({ redirected: true, url: 'http://localhost/' });
  });

  it('respects safe next parameter', async () => {
    const request = new NextRequest('http://localhost/auth/callback?code=abc&next=%2Fsettings');
    const response = await GET(request);

    expect(response).toEqual({ redirected: true, url: 'http://localhost/settings' });
  });

  it('redirects with error when exchange fails', async () => {
    exchangeCodeForSession.mockResolvedValueOnce({ data: { session: null }, error: new Error('bad') });

    const request = new NextRequest('http://localhost/auth/callback?code=bad');
    const response = await GET(request);

    expect(response).toEqual({ redirected: true, url: 'http://localhost/home?auth=error' });
  });
});
