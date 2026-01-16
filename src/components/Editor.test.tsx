import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Editor from './Editor';

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

const note = { id: '1', title: 'Test Note', content: 'Hola' };

describe('Editor activation guard', () => {
  it('opens activation dialog when inactive user saves', () => {
    render(<Editor note={note} isActive={false} />);

    fireEvent.click(screen.getByText('Edit'));
    fireEvent.click(screen.getByText('Save'));

    expect(screen.getByText('ActivationDialogOpen')).toBeInTheDocument();
  });
});
