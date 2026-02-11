import { describe, it, expect, vi } from 'vitest';
import { renderWithI18n } from '../../utils/renderWithI18n';
import SettingsPage from '@/app/settings/page';

const profile = {
  id: 'test-id',
  email: 'test@example.com',
  is_active: true,
  storage_used: 5000,
  plan_type: 'free' as const,
  target_language: null,
  created_at: '2026-01-15T00:00:00Z',
};

vi.mock('@/app/settings/SettingsForm', () => ({
  default: () => null,
}));

vi.mock('@/utils/profile/queries', () => ({
  getUserProfile: vi.fn(() => Promise.resolve(profile)),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}));

vi.mock('next/headers', () => ({
  cookies: () => Promise.resolve({ get: () => undefined }),
}));

vi.mock('@/utils/supabase/server', () => ({
  createServerClient: vi.fn(() =>
    Promise.resolve({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        })),
      })),
    })
  ),
}));

vi.mock('@/components/ToastProvider', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

describe('Settings page light mode', () => {
  it('uses light default background and text', async () => {
    const ui = await SettingsPage();
    const { container } = renderWithI18n(ui);
    const root = container.firstChild as HTMLElement;

    expect(root.className).toContain('bg-slate-50');
    expect(root.className).toContain('text-slate-900');
    expect(root.className).toContain('dark:bg-slate-950');
    expect(root.className).toContain('dark:text-slate-100');
  });
});
