import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DndContext } from '@dnd-kit/core';
import FavoritesSection from '@/components/FavoritesSection';
import { GlobalToastProvider } from '@/components/ToastProvider';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/utils/notes/actions', () => ({
  toggleFavorite: vi.fn(),
}));

describe('FavoritesSection', () => {
  const mockNotes = [
    {
      id: 'note-1',
      title: 'Favorite Note 1',
      folder_id: 'folder-1',
      is_favorite: true,
      updated_at: '2026-01-01',
    },
    {
      id: 'note-2',
      title: 'Regular Note',
      folder_id: 'folder-1',
      is_favorite: false,
      updated_at: '2026-01-01',
    },
    {
      id: 'note-3',
      title: 'Favorite Note 2',
      folder_id: 'folder-2',
      is_favorite: true,
      updated_at: '2026-01-02',
    },
  ];

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <GlobalToastProvider>
        <DndContext>{ui}</DndContext>
      </GlobalToastProvider>
    );
  };

  it('should render favorites header with star icon', () => {
    renderWithProviders(<FavoritesSection notes={mockNotes} />);
    expect(screen.getByText('Favorites')).toBeInTheDocument();
  });

  it('should only show favorite notes', () => {
    renderWithProviders(<FavoritesSection notes={mockNotes} />);
    expect(screen.getByText('Favorite Note 1')).toBeInTheDocument();
    expect(screen.getByText('Favorite Note 2')).toBeInTheDocument();
    expect(screen.queryByText('Regular Note')).not.toBeInTheDocument();
  });

  it('should show favorite count', () => {
    renderWithProviders(<FavoritesSection notes={mockNotes} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should be collapsible', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FavoritesSection notes={mockNotes} />);
    
    expect(screen.getByText('Favorite Note 1')).toBeVisible();
    
    const section = screen.getByTestId('favorites-section');
    const toggleButton = section.querySelector('button[aria-expanded]') as HTMLButtonElement;
    await user.click(toggleButton);
    
    expect(screen.queryByText('Favorite Note 1')).not.toBeInTheDocument();
  });

  it('should not render when no favorites exist', () => {
    const noFavorites = mockNotes.filter(n => !n.is_favorite);
    renderWithProviders(<FavoritesSection notes={noFavorites} />);
    expect(screen.queryByTestId('favorites-section')).not.toBeInTheDocument();
  });
});
