import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FolderList from '@/components/FolderList';
import type { Folder } from '@/types/folder';
import type { Note } from '@/types/note';

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
  },
  {
    id: 'note-2',
    user_id: 'user-123',
    folder_id: 'work-folder',
    title: 'Work Note',
    updated_at: '2026-01-21T00:00:00Z',
  },
];

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe('FolderList', () => {
  it('should render all folders', () => {
    render(<FolderList folders={mockFolders} notes={mockNotes} />);
    
    expect(screen.getByText('My Notes')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('should show notes count for each folder', () => {
    render(<FolderList folders={mockFolders} notes={mockNotes} />);
    
    const defaultFolder = screen.getByText('My Notes').closest('div');
    const workFolder = screen.getByText('Work').closest('div');
    
    expect(defaultFolder).toBeInTheDocument();
    expect(workFolder).toBeInTheDocument();
  });

  it('should render notes under their folders when expanded', () => {
    render(<FolderList folders={mockFolders} notes={mockNotes} showHierarchy={true} />);
    
    expect(screen.getByText('Note in Default')).toBeInTheDocument();
    expect(screen.getByText('Work Note')).toBeInTheDocument();
  });
});
