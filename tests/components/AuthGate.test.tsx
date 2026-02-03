import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import AuthGate from '@/components/AuthGate';
import { renderWithI18n } from '../utils/renderWithI18n';

const signInWithOAuth = vi.fn();
const getSession = vi.fn();

vi.mock('@/utils/supabase/client', () => ({
  createBrowserClient: () => ({
    auth: {
      getSession,
      signInWithOAuth,
    },
  }),
}));

describe('AuthGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows modal when unauthenticated', async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: null });
    renderWithI18n(<AuthGate />);
    expect(await screen.findByRole('button', { name: 'Sign in with Google' })).toBeInTheDocument();
  });

  it('calls Google OAuth on button click', async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: null });
    renderWithI18n(<AuthGate />);

    fireEvent.click(await screen.findByRole('button', { name: 'Sign in with Google' }));
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: expect.stringContaining('/auth/callback') },
    });
  });
});
