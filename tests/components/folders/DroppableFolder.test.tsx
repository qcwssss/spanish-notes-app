import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DndContext } from '@dnd-kit/core';
import DroppableFolder from '@/components/DroppableFolder';

describe('DroppableFolder', () => {
  const mockFolder = {
    id: 'folder-1',
    name: 'My Notes',
    is_default: true,
    user_id: 'user-1',
    collection_id: 'collection-1',
    created_at: '2026-01-01',
  };

  const renderWithDnd = (ui: React.ReactElement) => {
    return render(<DndContext>{ui}</DndContext>);
  };

  it('should render the folder name', () => {
    renderWithDnd(
      <DroppableFolder folder={mockFolder} isExpanded={true} onToggle={() => {}} noteCount={5}>
        <div>Child content</div>
      </DroppableFolder>
    );
    expect(screen.getByText('My Notes')).toBeInTheDocument();
  });

  it('should render note count', () => {
    renderWithDnd(
      <DroppableFolder folder={mockFolder} isExpanded={true} onToggle={() => {}} noteCount={5}>
        <div>Child content</div>
      </DroppableFolder>
    );
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should render children when expanded', () => {
    renderWithDnd(
      <DroppableFolder folder={mockFolder} isExpanded={true} onToggle={() => {}} noteCount={1}>
        <div>Child note</div>
      </DroppableFolder>
    );
    expect(screen.getByText('Child note')).toBeInTheDocument();
  });

  it('should NOT render children when collapsed', () => {
    renderWithDnd(
      <DroppableFolder folder={mockFolder} isExpanded={false} onToggle={() => {}} noteCount={1}>
        <div>Child note</div>
      </DroppableFolder>
    );
    expect(screen.queryByText('Child note')).not.toBeInTheDocument();
  });

  it('should have droppable data attribute', () => {
    renderWithDnd(
      <DroppableFolder folder={mockFolder} isExpanded={true} onToggle={() => {}} noteCount={0}>
        <div>Content</div>
      </DroppableFolder>
    );
    expect(screen.getByTestId('droppable-folder')).toBeInTheDocument();
  });
});
