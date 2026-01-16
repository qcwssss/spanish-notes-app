import { describe, it, expect, vi } from 'vitest';
import { GET } from './route';

vi.mock('@/utils/supabase/server', () => ({
  createServerClient: () => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: '1' } }, error: null })),
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
  it('redirects to home', async () => {
    const response = await GET(new Request('http://localhost/auth/callback'));
    expect(response).toEqual({ redirected: true, url: 'http://localhost/' });
  });
});
