import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DndContext } from '@dnd-kit/core';
import DraggableNote from '@/components/DraggableNote';
import { UNTITLED_NOTE_TITLE } from '@/constants';
import { GlobalToastProvider } from '@/components/ToastProvider';
import { renderWithI18n } from '../../utils/renderWithI18n';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockToggleFavorite = vi.fn();
vi.mock('@/utils/notes/actions', () => ({
  toggleFavorite: (...args: unknown[]) => mockToggleFavorite(...args),
}));

describe('DraggableNote', () => {
  const mockNote = {
    id: 'note-1',
    title: 'Test Note',
    folder_id: 'folder-1',
    user_id: 'user-1',
    content: '',
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    is_favorite: false,
  };

  const renderWithDnd = (ui: React.ReactElement) => {
    return renderWithI18n(
      <GlobalToastProvider>
        <DndContext>{ui}</DndContext>
      </GlobalToastProvider>
    );
  };

  beforeEach(() => {
    mockToggleFavorite.mockReset();
  });

  it('should render the note title', () => {
    renderWithDnd(<DraggableNote note={mockNote} />);
    expect(screen.getByText('Test Note')).toBeInTheDocument();
  });

  it('should render untitled for notes without title', () => {
    renderWithDnd(<DraggableNote note={{ ...mockNote, title: '' }} />);
    expect(screen.getByText(UNTITLED_NOTE_TITLE)).toBeInTheDocument();
  });

  it('should have draggable data attributes', () => {
    renderWithDnd(<DraggableNote note={mockNote} />);
    const element = screen.getByTestId('draggable-note');
    expect(element).toBeInTheDocument();
  });

  it('should include note id in the link href', () => {
    renderWithDnd(<DraggableNote note={mockNote} />);
    const link = screen.getByRole('button', { name: 'Test Note' });
    expect(link).toHaveAttribute('href', '/?noteId=note-1');
  });

  describe('Favorite toggle', () => {
    it('should show star button on hover', async () => {
      renderWithDnd(<DraggableNote note={mockNote} />);
      const noteElement = screen.getByTestId('draggable-note');
      
      fireEvent.mouseEnter(noteElement);
      
      const starButton = screen.getByRole('button', { name: /favorite/i });
      expect(starButton).toBeInTheDocument();
    });

    it('should show empty star for non-favorite note', () => {
      renderWithDnd(<DraggableNote note={mockNote} />);
      const starButton = screen.getByLabelText(/add to favorites/i);
      expect(starButton).toBeInTheDocument();
    });

    it('should show filled star for favorite note', () => {
      renderWithDnd(<DraggableNote note={{ ...mockNote, is_favorite: true }} />);
      const starButton = screen.getByLabelText(/remove from favorites/i);
      expect(starButton).toBeInTheDocument();
    });

    it('should call toggleFavorite when star is clicked', async () => {
      const user = userEvent.setup();
      renderWithDnd(<DraggableNote note={mockNote} />);
      
      const starButton = screen.getByRole('button', { name: /favorite/i });
      await user.click(starButton);
      
      expect(mockToggleFavorite).toHaveBeenCalledWith('note-1', true);
    });

    it('should call toggleFavorite with false when unfavoriting', async () => {
      const user = userEvent.setup();
      renderWithDnd(<DraggableNote note={{ ...mockNote, is_favorite: true }} />);
      
      const starButton = screen.getByRole('button', { name: /favorite/i });
      await user.click(starButton);
      
      expect(mockToggleFavorite).toHaveBeenCalledWith('note-1', false);
    });
  });
});
