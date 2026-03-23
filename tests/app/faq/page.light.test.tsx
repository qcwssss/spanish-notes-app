import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FaqPage from '@/app/faq/page';
import { messages } from '@/i18n/messages';

vi.mock('next/headers', () => ({
  cookies: () => Promise.resolve({ get: () => undefined }),
}));

describe('FAQ page', () => {
  it('renders key sections with the redesigned dark shell', async () => {
    const ui = await FaqPage();
    const { container } = render(ui);
    const root = container.firstChild as HTMLElement;

    expect(root.className).toContain('bg-[#0A0A0B]');
    expect(root.className).toContain('text-slate-300');
    expect(screen.getByText(messages.en.faq.title)).toBeInTheDocument();
    expect(screen.getByText(messages.en.faq.howTitle)).toBeInTheDocument();
    expect(screen.getByText(messages.en.faq.sectionTitle)).toBeInTheDocument();
  });
});
