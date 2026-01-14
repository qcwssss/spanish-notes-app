import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Sidebar from './Sidebar';

// Mock next/link if necessary, but try without first or minimal mock
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('Sidebar', () => {
  const mockNotes = [
    { id: '1', title: 'Note 1', updated_at: '2023-01-01' },
    { id: '2', title: 'Long Note Title That Should Be Truncated Maybe', updated_at: '2023-01-02' },
  ];

  it('renders the sidebar header', () => {
    render(<Sidebar notes={[]} />);
    expect(screen.getByText('My Notes')).toBeDefined();
  });

  it('renders a list of notes', () => {
    render(<Sidebar notes={mockNotes} />);
    expect(screen.getByText('Note 1')).toBeDefined();
    expect(screen.getByText('Long Note Title That Should Be Truncated Maybe')).toBeDefined();
  });

  it('renders correct links', () => {
    render(<Sidebar notes={mockNotes} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0].getAttribute('href')).toBe('/?noteId=1');
    expect(links[1].getAttribute('href')).toBe('/?noteId=2');
  });
  
  it('renders "Untitled Note" for empty titles', () => {
     const notes = [{ id: '3', title: '', updated_at: '2023-01-03' }];
     render(<Sidebar notes={notes} />);
     expect(screen.getByText('Untitled Note')).toBeDefined();
  });
});
