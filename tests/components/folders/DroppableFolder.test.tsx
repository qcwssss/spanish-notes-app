import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DndContext } from '@dnd-kit/core';
import DroppableFolder from '@/components/DroppableFolder';
import { useToast } from '@/components/ToastProvider';
import { renderWithI18n } from '../../utils/renderWithI18n';
import { I18nProvider } from '@/components/I18nProvider';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockDeleteFolderAndMoveNotes = vi.fn();
const mockDeleteFolderAndNotes = vi.fn();
const mockGetDefaultFolder = vi.fn();

// Mock useToast
vi.mock('@/components/ToastProvider', () => ({
  useToast: vi.fn(),
}));

const mockedUseToast = vi.mocked(useToast);

vi.mock('@/utils/folders/actions', () => ({
  deleteFolderAndMoveNotes: (...args: unknown[]) => mockDeleteFolderAndMoveNotes(...args),
  deleteFolderAndNotes: (...args: unknown[]) => mockDeleteFolderAndNotes(...args),
}));

vi.mock('@/utils/folders/queries', () => ({
  getDefaultFolder: () => mockGetDefaultFolder(),
}));

describe('DroppableFolder', () => {
  const mockFolder = {
    id: 'folder-1',
    name: 'My Notes',
    is_default: false,
    user_id: 'user-1',
    collection_id: 'collection-1',
    created_at: '2026-01-01',
  };

  const defaultFolder = {
    id: 'default-folder',
    name: 'Default Folder',
    is_default: true,
    user_id: 'user-1',
    collection_id: 'collection-1',
    created_at: '2026-01-01',
  };

  const mockToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDefaultFolder.mockResolvedValue(defaultFolder);
    mockedUseToast.mockReturnValue({
      toast: mockToast,
    });
  });

  const renderWithDnd = (ui: React.ReactElement) => {
    return renderWithI18n(<DndContext>{ui}</DndContext>);
  };

  const defaultProps = {
    folder: mockFolder,
    isExpanded: true,
    isActive: true,
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

  it('renders menu items', () => {
    renderWithDnd(<DroppableFolder {...defaultProps} />);
    const menuButton = screen.getByLabelText('Folder options');
    fireEvent.click(menuButton);
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('hides delete for default folder', () => {
    renderWithDnd(
      <DroppableFolder
        {...defaultProps}
        folder={{ ...defaultFolder, name: 'My Notes' }}
      />
    );
    const menuButton = screen.getByLabelText('Folder options');
    fireEvent.click(menuButton);
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('updates display name when folder prop changes', () => {
    const { rerender } = renderWithDnd(<DroppableFolder {...defaultProps} />);
    expect(screen.getByText('My Notes')).toBeInTheDocument();
    
    const newFolder = { ...mockFolder, name: 'Updated Notes' };
    rerender(
      <I18nProvider>
        <DndContext>
          <DroppableFolder {...defaultProps} folder={newFolder} />
        </DndContext>
      </I18nProvider>
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

  it('shows toast on rename error', async () => {
    const errorRename = vi.fn().mockRejectedValue(new Error('Rename failed'));
    renderWithDnd(<DroppableFolder {...defaultProps} onRename={errorRename} />);
    
    fireEvent.doubleClick(screen.getByText('My Notes'));
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'Error Update' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Error',
        variant: 'destructive',
      }));
    });

    expect(screen.getByText('My Notes')).toBeInTheDocument();
    expect(screen.queryByText('Error Update')).not.toBeInTheDocument();
  });

  it('deletes folder and keeps notes', async () => {
    renderWithDnd(<DroppableFolder {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Folder options'));
    fireEvent.click(screen.getByText('Delete'));

    expect(screen.getByText('Delete folder')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Delete folder (keep notes)'));

    await waitFor(() => {
      expect(mockDeleteFolderAndMoveNotes).toHaveBeenCalledWith('folder-1', 'default-folder');
    });

    await waitFor(() => {
      expect(screen.queryByText('Delete folder')).not.toBeInTheDocument();
    });
  });

  it('requires confirmation before deleting all notes', async () => {
    renderWithDnd(<DroppableFolder {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Folder options'));
    fireEvent.click(screen.getByText('Delete'));

    fireEvent.click(screen.getByText('Delete folder and all notes'));

    expect(screen.getByText('Delete folder and notes?')).toBeInTheDocument();
    expect(screen.getByText('This will permanently delete all notes in this folder.')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(mockDeleteFolderAndNotes).toHaveBeenCalledWith('folder-1');
    });

    await waitFor(() => {
      expect(screen.queryByText('Delete folder and notes?')).not.toBeInTheDocument();
    });
  });
});
