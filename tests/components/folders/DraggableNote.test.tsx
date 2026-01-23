import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DndContext } from '@dnd-kit/core';
import DraggableNote from '@/components/DraggableNote';
import { UNTITLED_NOTE_TITLE } from '@/constants';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
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
    return render(<DndContext>{ui}</DndContext>);
  };

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
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/?noteId=note-1');
  });
});
