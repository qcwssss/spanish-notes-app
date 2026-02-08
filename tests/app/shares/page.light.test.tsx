import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import SharesPage from '@/app/shares/page';
import { renderWithI18n } from '../../utils/renderWithI18n';

vi.mock('@/i18n/server', () => ({
  getServerLocale: vi.fn(() => Promise.resolve('en')),
}));

vi.mock('@/utils/shares/queries', () => ({
  revokeNoteShare: vi.fn(() => Promise.resolve()),
}));

vi.mock('@/components/RevokeShareButton', () => ({
  default: () => <button>Revoke share</button>,
}));

vi.mock('@/utils/supabase/server', () => ({
  createServerClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'user-1' } } })),
      },
      from: vi.fn((table: string) => {
        if (table === 'note_shares') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() =>
                  Promise.resolve({
                    data: [
                      {
                        note_id: 'note-1',
                        note: { id: 'note-1', title: 'Shared test note' },
                        token: 'token-1',
                        is_active: true,
                        created_at: '2026-02-08T10:00:00.000Z',
                      },
                    ],
                    error: null,
                  })
                ),
              })),
            })),
          };
        }

        return {};
      }),
    })
  ),
}));

describe('Shares page', () => {
  it('shows latest shared timestamp and management actions', async () => {
    const ui = await SharesPage();
    renderWithI18n(ui);

    expect(screen.getByText('Shared Links')).toBeInTheDocument();
    expect(screen.getByText('Shared test note')).toBeInTheDocument();
    expect(screen.getByText(/Latest shared:/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open share' })).toBeInTheDocument();
  });
});
