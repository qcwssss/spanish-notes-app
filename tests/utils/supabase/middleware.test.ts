import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

const { getUser } = vi.hoisted(() => ({
  getUser: vi.fn(async () => ({ data: { user: null } })),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser,
    },
  })),
}));

vi.mock('@/utils/supabase/config', () => ({
  getSupabaseConfig: () => ({
    supabaseUrl: 'https://example.supabase.co',
    supabaseAnonKey: 'anon-key',
  }),
}));

describe('updateSession app routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUser.mockResolvedValue({ data: { user: null } });
  });

  it('redirects unauthenticated /app requests to home', async () => {
    const request = new NextRequest('http://localhost/app?noteId=note-1');

    const response = await updateSession(request);

    expect(response.headers.get('location')).toBe('http://localhost/');
  });
});
