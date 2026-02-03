import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DndContext } from '@dnd-kit/core';
import FavoritesView from '@/components/FavoritesView';
import { GlobalToastProvider } from '@/components/ToastProvider';
import { renderWithI18n } from '../utils/renderWithI18n';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('FavoritesView', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  const notes = [
    {
      id: 'note-1',
      title: 'Favorite A',
      folder_id: 'folder-1',
      is_favorite: true,
      updated_at: '2026-01-02T10:00:00Z',
    },
    {
      id: 'note-2',
      title: 'Regular Note',
      folder_id: 'folder-1',
      is_favorite: false,
      updated_at: '2026-01-03T10:00:00Z',
    },
    {
      id: 'note-3',
      title: 'Favorite B',
      folder_id: 'folder-2',
      is_favorite: true,
      updated_at: '2026-01-01T10:00:00Z',
    },
  ];

  const renderWithProviders = (ui: React.ReactElement) => {
    return renderWithI18n(
      <GlobalToastProvider>
        <DndContext>{ui}</DndContext>
      </GlobalToastProvider>
    );
  };

  it('renders favorites only and defaults to newest first', () => {
    renderWithProviders(<FavoritesView notes={notes} />);

    expect(screen.queryByText('Regular Note')).not.toBeInTheDocument();

    const items = screen.getAllByTestId('favorite-note');
    expect(items[0]).toHaveTextContent('Favorite A');
    expect(items[1]).toHaveTextContent('Favorite B');
  });

  it('toggles sort order when the sort button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FavoritesView notes={notes} />);

    const sortButton = screen.getByRole('button', { name: /newest/i });
    await user.click(sortButton);

    const items = screen.getAllByTestId('favorite-note');
    expect(items[0]).toHaveTextContent('Favorite B');
    expect(items[1]).toHaveTextContent('Favorite A');
    expect(sortButton).toHaveTextContent('Oldest');
  });

  it('shows an empty state when no favorites exist', () => {
    renderWithProviders(
      <FavoritesView
        notes={notes.map(note => ({ ...note, is_favorite: false }))}
      />
    );

    expect(screen.getByText('No favorites yet')).toBeInTheDocument();
  });

  it('persists sort order in localStorage', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FavoritesView notes={notes} />);

    const sortButton = screen.getByRole('button', { name: /newest/i });
    await user.click(sortButton);

    expect(window.localStorage.getItem('favorites-sort-ascending')).toBe('true');
  });
});
