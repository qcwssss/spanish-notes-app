import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import AuthGate from '@/components/AuthGate';
import { renderWithI18n } from '../utils/renderWithI18n';

vi.mock('@/utils/supabase/client', () => ({
  createBrowserClient: () => ({
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      signInWithOAuth: vi.fn(),
    },
  }),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

describe('AuthGate light mode', () => {
  it('uses light card defaults with dark overrides', async () => {
    renderWithI18n(<AuthGate />);
    const card = await screen.findByTestId('auth-card');
    expect(card.className).toContain('bg-white');
    expect(card.className).toContain('border-slate-200');
    expect(card.className).toContain('dark:bg-slate-900');
  });
});
