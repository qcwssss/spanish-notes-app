import type { AnchorHTMLAttributes } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/components/I18nProvider';
import LandingAuthDialog from '@/components/LandingAuthDialog';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/GoogleSignInButton', () => ({
  default: ({ label }: { label: string }) => <button type="button">{label}</button>,
}));

describe('LandingAuthDialog', () => {
  it('opens a modal with google and email sign-in options', async () => {
    const user = userEvent.setup();

    render(
      <I18nProvider initialLocale="en">
        <LandingAuthDialog triggerLabel="Start Writing" />
      </I18nProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Start Writing' }));

    expect(screen.getByText('Choose a sign-in method')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Continue with email/i })).toHaveAttribute(
      'href',
      '/auth/sign-in?next=%2Fapp'
    );
  });
});
