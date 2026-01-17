import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthGate from './AuthGate';

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
    render(<AuthGate />);
    expect(await screen.findByText('请使用 Google 登录')).toBeInTheDocument();
  });

  it('calls Google OAuth on button click', async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: null });
    render(<AuthGate />);

    fireEvent.click(await screen.findByRole('button', { name: '使用 Google 登录' }));
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: expect.stringContaining('/auth/callback') },
    });
  });
});
