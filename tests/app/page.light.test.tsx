import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import LandingPage from '@/app/page';
import { messages } from '@/i18n/messages';

const { redirect, getUser } = vi.hoisted(() => ({
  redirect: vi.fn(),
  getUser: vi.fn(async () => ({ data: { user: null } })),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('@/components/LandingAuthDialog', () => ({
  default: ({ triggerLabel }: { triggerLabel: string }) => <button>{triggerLabel}</button>,
}));

vi.mock('next/navigation', () => ({
  redirect,
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ get: () => undefined })),
}));

vi.mock('@/utils/supabase/server', () => ({
  createServerClient: vi.fn(async () => ({
    auth: {
      getUser,
    },
  })),
}));

describe('Landing page light redesign regression', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the unauthenticated landing page with a light shell', async () => {
    const ui = await LandingPage();
    const { container } = render(ui);
    const root = container.firstChild as HTMLElement;

    expect(root.className).toContain('bg-slate-50');
    expect(root.className).toContain('text-slate-900');
    expect(root.className).not.toContain('bg-[#060608]');
    expect(root.className).not.toContain('text-slate-300');
  });

  it('keeps translated landing copy visible without the old hardcoded shell labels', async () => {
    const ui = await LandingPage();
    render(ui);

    expect(screen.getByText(messages.en.landing.heroTitle)).toBeInTheDocument();
    expect(screen.getByText(messages.en.landing.heroSubtitle)).toBeInTheDocument();
    expect(screen.getByText(messages.en.landing.heroEyebrow)).toBeInTheDocument();
    expect(screen.getByText(messages.en.landing.heroSupport)).toBeInTheDocument();
    expect(screen.getByText(messages.en.landing.previewLabel)).toBeInTheDocument();
    expect(screen.getByText(messages.en.landing.previewTitle)).toBeInTheDocument();
    expect(screen.getByText(messages.en.landing.previewBody)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.en.landing.startWriting })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: messages.en.landing.secondaryCta })).toBeInTheDocument();
  });
});
