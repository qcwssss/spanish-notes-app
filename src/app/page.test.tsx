import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './page';

const { mockGetUserProfile, mockCreateServerClient, mockEditor } = vi.hoisted(() => {
  const mockProfile = {
    id: 'user-1',
    email: 'test@example.com',
    is_active: true,
    storage_used: 0,
    plan_type: 'free',
    target_language: 'es',
    created_at: '2026-01-15T00:00:00Z',
  };

  const mockGetUserProfile = vi.fn(() => Promise.resolve(mockProfile));
  const mockEditor = vi.fn(({ isActive }: { isActive: boolean }) => (
    <div>Editor active: {String(isActive)}</div>
  ));

  const mockCreateServerClient = vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table !== 'notes') return {};

      return {
        select: vi.fn((columns: string) => {
          if (columns === 'id, title, updated_at') {
            return {
              order: vi.fn(() =>
                Promise.resolve({
                  data: [{ id: '1', title: 'Hola', updated_at: '2026-01-15T00:00:00Z' }],
                  error: null,
                })
              ),
            };
          }

          if (columns === '*') {
            return {
              eq: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({
                    data: {
                      id: '1',
                      title: 'Hola',
                      content: 'Hola mundo',
                      updated_at: '2026-01-15T00:00:00Z',
                    },
                    error: null,
                  })
                ),
              })),
            };
          }

          return {};
        }),
      };
    }),
  }));

  return { mockGetUserProfile, mockCreateServerClient, mockEditor };
});

vi.mock('@/utils/profile/queries', () => ({
  getUserProfile: mockGetUserProfile,
}));

vi.mock('@/utils/supabase/server', () => ({
  createServerClient: mockCreateServerClient,
}));

vi.mock('@/components/Sidebar', () => ({
  default: () => <div>Sidebar</div>,
}));

vi.mock('@/components/Editor', () => ({
  default: (props: { isActive: boolean }) => mockEditor(props),
}));

describe('Home page', () => {
  it('passes profile activation to Editor', async () => {
    const ui = await Home({
      searchParams: Promise.resolve({ noteId: '1' }),
    });

    render(ui);

    expect(screen.getByText('Editor active: true')).toBeInTheDocument();
  });
});
