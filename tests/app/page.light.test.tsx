import { describe, it, expect, vi, beforeEach } from 'vitest';
import RootPage from '@/app/page';
import { ROUTES } from '@/constants';

const { redirect, getUser } = vi.hoisted(() => ({
  redirect: vi.fn(),
  getUser: vi.fn(async () => ({ data: { user: null } })),
}));

vi.mock('next/navigation', () => ({
  redirect,
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ get: () => undefined })),
}));

vi.mock('@/utils/supabase/server', () => ({
  createServerClient: vi.fn(async () => ({
    auth: {
      getUser,
    },
  })),
}));

describe('Root app entry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUser.mockResolvedValue({ data: { user: null } });
  });

  it('sends unauthenticated visitors to the workspace entry', async () => {
    await RootPage();

    expect(redirect).toHaveBeenCalledWith(ROUTES.app);
  });

  it('sends authenticated visitors to the workspace', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });

    await RootPage();

    expect(redirect).toHaveBeenCalledWith(ROUTES.app);
  });
});
