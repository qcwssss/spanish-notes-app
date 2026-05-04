import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import Editor from '@/components/Editor';
import { updateNote } from '@/utils/notes/actions';
import { renderWithI18n } from '../utils/renderWithI18n';

vi.mock('@/utils/notes/actions', () => ({
  updateNote: vi.fn(() => Promise.resolve()),
  deleteNote: vi.fn(() => Promise.resolve()),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/components/NotePlayer', () => ({
  default: () => <div>NotePlayer</div>,
}));

vi.mock('@/components/ActivationDialog', () => ({
  default: ({ open }: { open: boolean }) => (open ? <div>ActivationDialogOpen</div> : null),
}));

vi.mock('@/components/ShareActions', () => ({
  default: ({ onRequestEdit }: { onRequestEdit: () => void }) => (
    <button onClick={onRequestEdit}>Edit</button>
  ),
}));

vi.mock('@/components/ToastProvider', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const note = {
  id: '1',
  title: 'Test Note',
  content: 'Hola',
  updated_at: '2026-01-15T00:00:00Z',
  folder_id: 'folder-1',
  is_favorite: false,
};

describe('Editor activation guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens activation dialog when inactive user saves', async () => {
    renderWithI18n(<Editor note={note} isActive={false} targetLanguage="es" />);

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
    renderWithI18n(<Editor note={note} isActive targetLanguage="es" />);

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
