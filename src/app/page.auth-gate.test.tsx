import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './page';

vi.mock('@/components/AuthGate', () => ({
  default: () => <div>AuthGate</div>,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/utils/supabase/server', () => ({
  createServerClient: vi.fn(() => ({
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

describe('Home page auth gate', () => {
  it('renders AuthGate', async () => {
    const ui = await Home({ searchParams: Promise.resolve({}) });
    render(ui);
    expect(screen.getByText('AuthGate')).toBeInTheDocument();
  });
});
