import { render, screen, fireEvent } from '@testing-library/react';
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

  const defaultProps = {
    folder: mockFolder,
    isExpanded: true,
    onToggle: vi.fn(),
    onRename: vi.fn(),
    noteCount: 5,
    children: <div>Child content</div>
  };

  it('should render the folder name', () => {
    renderWithDnd(
      <DroppableFolder {...defaultProps} />
    );
    expect(screen.getByText('My Notes')).toBeInTheDocument();
  });

  it('should render note count', () => {
    renderWithDnd(
      <DroppableFolder {...defaultProps} />
    );
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should render children when expanded', () => {
    renderWithDnd(
      <DroppableFolder {...defaultProps}>
        <div>Child note</div>
      </DroppableFolder>
    );
    expect(screen.getByText('Child note')).toBeInTheDocument();
  });

  it('should NOT render children when collapsed', () => {
    renderWithDnd(
      <DroppableFolder {...defaultProps} isExpanded={false}>
        <div>Child note</div>
      </DroppableFolder>
    );
    expect(screen.queryByText('Child note')).not.toBeInTheDocument();
  });

  it('should have droppable data attribute', () => {
    renderWithDnd(
      <DroppableFolder {...defaultProps} noteCount={0}>
        <div>Content</div>
      </DroppableFolder>
    );
    expect(screen.getByTestId('droppable-folder')).toBeInTheDocument();
  });

  it('enters rename mode on double click', () => {
    renderWithDnd(<DroppableFolder {...defaultProps} />);
    const nameSpan = screen.getByText('My Notes');
    fireEvent.doubleClick(nameSpan);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('My Notes');
  });

  it('renders menu button', () => {
    renderWithDnd(<DroppableFolder {...defaultProps} />);
    expect(screen.getByLabelText('Folder options')).toBeInTheDocument();
  });

  it('renders correct menu item label', () => {
    renderWithDnd(<DroppableFolder {...defaultProps} />);
    const menuButton = screen.getByLabelText('Folder options');
    fireEvent.click(menuButton);
    expect(screen.getByText('Edit folder name')).toBeInTheDocument();
  });

  it('updates display name when folder prop changes', () => {
    const { rerender } = renderWithDnd(<DroppableFolder {...defaultProps} />);
    expect(screen.getByText('My Notes')).toBeInTheDocument();
    
    const newFolder = { ...mockFolder, name: 'Updated Notes' };
    rerender(
      <DndContext>
        <DroppableFolder {...defaultProps} folder={newFolder} />
      </DndContext>
    );
    
    expect(screen.getByText('Updated Notes')).toBeInTheDocument();
  });

  it('updates UI immediately on rename submit', async () => {
    const slowRename = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    renderWithDnd(<DroppableFolder {...defaultProps} onRename={slowRename} />);
    
    fireEvent.doubleClick(screen.getByText('My Notes'));
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'Fast Update' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Fast Update')).toBeInTheDocument();
    
    expect(slowRename).toHaveBeenCalledWith('folder-1', 'Fast Update');
  });
});
