import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import AppPage from '@/app/app/page';
import { renderWithI18n } from '../utils/renderWithI18n';

vi.mock('@/components/AuthGate', () => ({
  default: () => <div>AuthGate</div>,
}));

vi.mock('@/components/ToastProvider', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
  redirect: vi.fn(),
}));

vi.mock('@/utils/supabase/server', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: 'user-1' } } }),
    },
    from: () => ({
      select: () => ({
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
  it('renders AuthGate', async () => {
    const ui = await AppPage({ searchParams: Promise.resolve({}) });
    renderWithI18n(ui);
    expect(screen.getByText('AuthGate')).toBeInTheDocument();
  });
});
