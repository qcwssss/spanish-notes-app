import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateFolderDialog from '@/components/CreateFolderDialog';

describe('CreateFolderDialog', () => {
  it('should render dialog when open', () => {
    render(<CreateFolderDialog isOpen={true} onClose={vi.fn()} onCreate={vi.fn()} />);
    
    expect(screen.getByText('Create Folder')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Folder name')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<CreateFolderDialog isOpen={false} onClose={vi.fn()} onCreate={vi.fn()} />);
    
    expect(screen.queryByText('Create Folder')).not.toBeInTheDocument();
  });

  it('should call onCreate with folder name on submit', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    
    render(<CreateFolderDialog isOpen={true} onClose={vi.fn()} onCreate={onCreate} />);
    
    await user.type(screen.getByPlaceholderText('Folder name'), 'Work');
    await user.click(screen.getByRole('button', { name: /create/i }));
    
    expect(onCreate).toHaveBeenCalledWith('Work');
  });

  it('should call onClose when cancel is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<CreateFolderDialog isOpen={true} onClose={onClose} onCreate={vi.fn()} />);
    
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    
    expect(onClose).toHaveBeenCalled();
  });

  it('should not submit with empty name', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    
    render(<CreateFolderDialog isOpen={true} onClose={vi.fn()} onCreate={onCreate} />);
    
    await user.click(screen.getByRole('button', { name: /create/i }));
    
    expect(onCreate).not.toHaveBeenCalled();
  });
});
