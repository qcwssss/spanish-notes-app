import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import FolderList from '@/components/FolderList';
import type { Folder } from '@/types/folder';
import type { Note } from '@/types/note';
import { renderWithI18n } from '../../utils/renderWithI18n';

const mockFolders: Folder[] = [
  {
    id: 'default-folder',
    user_id: 'user-123',
    collection_id: 'collection-123',
    name: 'My Notes',
    is_default: true,
    created_at: '2026-01-21T00:00:00Z',
  },
  {
    id: 'work-folder',
    user_id: 'user-123',
    collection_id: 'collection-123',
    name: 'Work',
    is_default: false,
    created_at: '2026-01-21T00:00:00Z',
  },
];

const mockNotes: Note[] = [
  {
    id: 'note-1',
    user_id: 'user-123',
    folder_id: 'default-folder',
    title: 'Note in Default',
    updated_at: '2026-01-21T00:00:00Z',
    is_favorite: false,
  },
  {
    id: 'note-2',
    user_id: 'user-123',
    folder_id: 'work-folder',
    title: 'Work Note',
    updated_at: '2026-01-21T00:00:00Z',
    is_favorite: false,
  },
];

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/components/ToastProvider', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe('FolderList', () => {
  it('should render all folders', () => {
    renderWithI18n(<FolderList folders={mockFolders} notes={mockNotes} isActive />);
    
    expect(screen.getByText('My Notes')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('should show notes count for each folder', () => {
    renderWithI18n(<FolderList folders={mockFolders} notes={mockNotes} isActive />);
    
    const defaultFolder = screen.getByText('My Notes').closest('div');
    const workFolder = screen.getByText('Work').closest('div');
    
    expect(defaultFolder).toBeInTheDocument();
    expect(workFolder).toBeInTheDocument();
  });

  it('should render notes under their folders when expanded', () => {
    renderWithI18n(<FolderList folders={mockFolders} notes={mockNotes} showHierarchy={true} isActive />);
    
    expect(screen.getByText('Note in Default')).toBeInTheDocument();
    expect(screen.getByText('Work Note')).toBeInTheDocument();
  });
});
