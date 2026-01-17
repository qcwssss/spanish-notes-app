import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Editor from './Editor';
import { updateNote } from '@/utils/notes/queries';

vi.mock('@/utils/notes/queries', () => ({
  updateNote: vi.fn(() => Promise.resolve()),
  deleteNote: vi.fn(() => Promise.resolve()),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('./NotePlayer', () => ({
  default: () => <div>NotePlayer</div>,
}));

vi.mock('./ActivationDialog', () => ({
  default: ({ open }: { open: boolean }) => (open ? <div>ActivationDialogOpen</div> : null),
}));

const note = { id: '1', title: 'Test Note', content: 'Hola', updated_at: '2026-01-15T00:00:00Z' };

describe('Editor activation guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens activation dialog when inactive user saves', async () => {
    render(<Editor note={note} isActive={false} />);

    await act(async () => {
      fireEvent.click(screen.getByText('Edit'));
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Save'));
    });

    expect(screen.getByText('ActivationDialogOpen')).toBeInTheDocument();
    expect(updateNote).not.toHaveBeenCalled();
  });

  it('saves when user is active', async () => {
    render(<Editor note={note} isActive />);

    await act(async () => {
      fireEvent.click(screen.getByText('Edit'));
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Save'));
    });

    expect(updateNote).toHaveBeenCalledWith(note.id, {
      title: note.title,
      content: note.content,
    });
  });
});
