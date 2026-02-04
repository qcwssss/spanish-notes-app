import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sidebar from '@/components/Sidebar';
import type { Folder } from '@/types/folder';
import { useToast } from '@/components/ToastProvider';
import { renderWithI18n } from '../utils/renderWithI18n';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/components/ToastProvider', () => ({
  useToast: vi.fn(),
}));

const mockProfile = {
  id: 'test-id',
  email: 'test@example.com',
  is_active: true,
  storage_used: 5000,
  plan_type: 'free' as const,
  target_language: 'es',
  created_at: '2026-01-15T00:00:00Z',
};

const mockDefaultFolder: Folder = {
  id: 'default-folder',
  user_id: 'user-123',
  collection_id: 'collection-123',
  name: 'My Notes',
  is_default: true,
  created_at: '2026-01-21T00:00:00Z',
};

describe('Sidebar', () => {
  const mockNotes = [
    { id: '1', title: 'Note 1', updated_at: '2023-01-01', folder_id: 'default-folder', is_favorite: false },
    { id: '2', title: 'Long Note Title That Should Be Truncated Maybe', updated_at: '2023-01-02', folder_id: 'default-folder', is_favorite: false },
  ];

  beforeEach(() => {
    (useToast as any).mockReturnValue({
      toast: vi.fn(),
    });
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('renders the sidebar header', () => {
    renderWithI18n(<Sidebar profile={mockProfile} notes={[]} folders={[mockDefaultFolder]} />);
    expect(screen.getByText('My Notes')).toBeDefined();
  });

  it('renders a list of notes', () => {
    renderWithI18n(<Sidebar profile={mockProfile} notes={mockNotes} folders={[mockDefaultFolder]} />);
    expect(screen.getByText('Note 1')).toBeDefined();
    expect(screen.getByText('Long Note Title That Should Be Truncated Maybe')).toBeDefined();
  });

  it('renders correct links', () => {
    renderWithI18n(<Sidebar profile={mockProfile} notes={mockNotes} folders={[mockDefaultFolder]} />);
    const links = screen
      .getAllByRole('link')
      .filter(link => link.getAttribute('href')?.startsWith('/?noteId='));
    expect(links).toHaveLength(2);
    expect(links[0].getAttribute('href')).toBe('/?noteId=1');
    expect(links[1].getAttribute('href')).toBe('/?noteId=2');
  });

  it('renders "Untitled Note" for empty titles', () => {
    const notes = [{ id: '3', title: '', updated_at: '2023-01-03', folder_id: 'default-folder', is_favorite: false }];
    renderWithI18n(<Sidebar profile={mockProfile} notes={notes} folders={[mockDefaultFolder]} />);
    expect(screen.getByText('Untitled Note')).toBeDefined();
  });

  it('renders a favorites view link', () => {
    renderWithI18n(<Sidebar profile={mockProfile} notes={mockNotes} folders={[mockDefaultFolder]} />);
    const link = screen.getByRole('link', { name: 'Favorites' });
    expect(link.getAttribute('href')).toBe('/favorites');
  });

  it('toggles theme and persists preference', () => {
    localStorage.setItem('app-theme', 'light');

    renderWithI18n(<Sidebar profile={mockProfile} notes={mockNotes} folders={[mockDefaultFolder]} />);

    const toggleButton = screen.getByRole('button', { name: 'Toggle theme' });
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    fireEvent.click(toggleButton);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('app-theme')).toBe('dark');

    fireEvent.click(toggleButton);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('app-theme')).toBe('light');
  });
});
