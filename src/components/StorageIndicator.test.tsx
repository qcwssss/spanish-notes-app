import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StorageIndicator from './StorageIndicator';

describe('StorageIndicator', () => {
  it('should render storage usage correctly', () => {
    render(<StorageIndicator used={25000} limit={150000} />);
    
    expect(screen.getByText(/25k/)).toBeInTheDocument();
    expect(screen.getByText(/150k/)).toBeInTheDocument();
  });

  it('should calculate percentage correctly', () => {
    const { container } = render(<StorageIndicator used={30000} limit={150000} />);
    const progressBar = container.querySelector('[style*="width"]');
    expect(progressBar).toHaveStyle({ width: '20%' });
  });

  it('should show warning color when near limit', () => {
    const { container } = render(<StorageIndicator used={140000} limit={150000} />);
    const progressBar = container.querySelector('.bg-yellow-500, .bg-red-500');
    expect(progressBar).toBeInTheDocument();
  });
});
