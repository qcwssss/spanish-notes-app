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

  it('lets unauthenticated /app requests through — AppPage handles auth redirect', async () => {
    const request = new NextRequest('http://localhost/app?noteId=note-1');

    const response = await updateSession(request);

    // middleware 不拦截 workspace 路径，避免与 landing page 产生 / ↔ /app 循环
    expect(response.headers.get('location')).toBeNull();
  });

  it('still redirects unauthenticated requests to truly private paths', async () => {
    const request = new NextRequest('http://localhost/some-private-api');

    const response = await updateSession(request);

    expect(response.headers.get('location')).toBe('http://localhost/');
  });

  it('rejects forged Supabase cookies — does not bypass auth', async () => {
    // 伪造 sb-* Cookie，模拟旧 bypass 攻击路径（针对私有路由）
    const request = new NextRequest('http://localhost/some-private-api', {
      headers: {
        cookie: 'sb-access-token=fake; sb-refresh-token=fake',
      },
    });

    const response = await updateSession(request);

    // 即使携带伪造 Cookie，未鉴权用户依然应被重定向
    expect(response.headers.get('location')).toBe('http://localhost/');
  });
});
