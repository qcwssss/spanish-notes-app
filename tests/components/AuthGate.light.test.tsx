import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AuthGate from '@/components/AuthGate';

vi.mock('@/utils/supabase/client', () => ({
  createBrowserClient: () => ({
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      signInWithOAuth: vi.fn(),
    },
  }),
}));

describe('AuthGate light mode', () => {
  it('uses light card defaults with dark overrides', async () => {
    render(<AuthGate />);
    const card = await screen.findByTestId('auth-card');
    expect(card.className).toContain('bg-white');
    expect(card.className).toContain('border-slate-200');
    expect(card.className).toContain('dark:bg-slate-900');
  });
});
