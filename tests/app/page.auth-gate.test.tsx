import { beforeEach, describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import AppPage from '@/app/app/page';
import { renderWithI18n } from '../utils/renderWithI18n';

const { getUser, redirect } = vi.hoisted(() => ({
  getUser: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('@/components/AuthGate', () => ({
  default: () => <div>AuthGate</div>,
}));

vi.mock('@/components/ToastProvider', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
  redirect,
}));

vi.mock('@/utils/supabase/server', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser,
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [] }),
        }),
        order: () => Promise.resolve({ data: [] }),
      }),
    }),
  })),
}));

vi.mock('@/utils/profile/queries', () => ({
  getUserProfile: vi.fn(() => Promise.resolve(null)),
}));

vi.mock('@/utils/folders/queries', () => ({
  getFolders: vi.fn(() => Promise.resolve([])),
}));

vi.mock('next/headers', () => ({
  cookies: () => Promise.resolve({ get: () => undefined }),
}));

describe('App workspace auth gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
  });

  it('renders AuthGate for authenticated workspace requests', async () => {
    const ui = await AppPage({ searchParams: Promise.resolve({}) });
    renderWithI18n(ui);
    expect(screen.getByText('AuthGate')).toBeInTheDocument();
  });

  it('renders AuthGate shell instead of redirecting unauthenticated workspace requests', async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const ui = await AppPage({ searchParams: Promise.resolve({}) });

    expect(redirect).not.toHaveBeenCalled();
    renderWithI18n(ui);
    expect(screen.getByText('AuthGate')).toBeInTheDocument();
  });
});
