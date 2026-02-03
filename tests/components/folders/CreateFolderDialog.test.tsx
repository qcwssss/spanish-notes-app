import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateFolderDialog from '@/components/CreateFolderDialog';
import { renderWithI18n } from '../../utils/renderWithI18n';

describe('CreateFolderDialog', () => {
  it('should render dialog when open', () => {
    renderWithI18n(<CreateFolderDialog isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);
    
    expect(screen.getByRole('heading', { name: 'Create Folder' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Folder name')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    renderWithI18n(<CreateFolderDialog isOpen={false} onClose={vi.fn()} onCreate={vi.fn()} />);
    
    expect(screen.queryByText('Create Folder')).not.toBeInTheDocument();
  });

  it('should call onCreate with folder name on submit', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    
    renderWithI18n(<CreateFolderDialog isOpen={true} onClose={vi.fn()} onCreate={onCreate} />);
    
    await user.type(screen.getByPlaceholderText('Folder name'), 'Work');
    await user.click(screen.getByRole('button', { name: /Create Folder/i }));
    
    expect(onCreate).toHaveBeenCalledWith('Work');
  });

  it('should call onClose when cancel is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    renderWithI18n(<CreateFolderDialog isOpen={true} onClose={onClose} onCreate={vi.fn()} />);
    
    // Get the text button, not the X icon button
    const cancelButtons = screen.getAllByRole('button', { name: /Cancel/i });
    const textCancelButton = cancelButtons.find(btn => btn.textContent === 'Cancel');
    await user.click(textCancelButton!);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('should not submit with empty name', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    
    renderWithI18n(<CreateFolderDialog isOpen={true} onClose={vi.fn()} onCreate={onCreate} />);
    
    await user.click(screen.getByRole('button', { name: /create/i }));
    
    expect(onCreate).not.toHaveBeenCalled();
  });
});
