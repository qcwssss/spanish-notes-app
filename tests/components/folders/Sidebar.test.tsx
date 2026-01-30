import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Sidebar from '@/components/Sidebar';
import type { Folder } from '@/types/folder';
import type { Note } from '@/types/note';
import type { UserProfile } from '@/types/profile';

const mockDefaultFolder: Folder = {
  id: 'default-folder',
  user_id: 'user-123',
  collection_id: 'collection-123',
  name: 'My Notes',
  is_default: true,
  created_at: '2026-01-21T00:00:00Z',
};

const mockRealFolder: Folder = {
  id: 'work-folder',
  user_id: 'user-123',
  collection_id: 'collection-123',
  name: 'Work',
  is_default: false,
  created_at: '2026-01-21T00:00:00Z',
};

const mockNotes: Note[] = [
  {
    id: 'note-1',
    user_id: 'user-123',
    folder_id: 'default-folder',
    title: 'Test Note',
    updated_at: '2026-01-21T00:00:00Z',
    is_favorite: false,
  },
];

const mockProfile: UserProfile = {
  id: 'profile-123',
  email: 'test@example.com',
  is_active: true,
  storage_used: 0,
  plan_type: 'free',
  target_language: 'es',
  created_at: '2026-01-21T00:00:00Z',
};

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

vi.mock('@/components/ToastProvider', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe('Sidebar Progressive Display', () => {
  it('should show flat list when only default folder exists (simple mode)', () => {
    render(
      <Sidebar 
        notes={mockNotes} 
        folders={[mockDefaultFolder]} 
        profile={mockProfile} 
      />
    );
    
    expect(screen.getByText('Test Note')).toBeInTheDocument();
  });

  it('should show hierarchy when real folders exist (advanced mode)', () => {
    render(
      <Sidebar 
        notes={mockNotes} 
        folders={[mockDefaultFolder, mockRealFolder]} 
        profile={mockProfile} 
      />
    );
    
    expect(screen.getAllByText('My Notes').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('should show Create Folder button', () => {
    render(
      <Sidebar 
        notes={mockNotes} 
        folders={[mockDefaultFolder]} 
        profile={mockProfile} 
      />
    );
    
    expect(screen.getByRole('button', { name: /create folder/i })).toBeInTheDocument();
  });
});
