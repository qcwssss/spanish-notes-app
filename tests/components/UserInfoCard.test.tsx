import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import UserInfoCard from '@/components/UserInfoCard';
import { renderWithI18n } from '../utils/renderWithI18n';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const profile = {
  id: 'user-1',
  email: 'test@example.com',
  is_active: true,
  storage_used: 5000,
  plan_type: 'free' as const,
  target_language: 'es',
  created_at: '2026-01-15T00:00:00Z',
};

describe('UserInfoCard', () => {
  it('renders shared links management entry on language row', () => {
    renderWithI18n(<UserInfoCard profile={profile} theme="dark" onToggleTheme={vi.fn()} />);

    const manageLink = screen.getByRole('link', { name: 'Manage shared links' });
    expect(manageLink).toBeInTheDocument();
    expect(manageLink.getAttribute('href')).toBe('/shares');
  });
});
