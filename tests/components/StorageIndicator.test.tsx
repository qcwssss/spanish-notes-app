import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import StorageIndicator from '@/components/StorageIndicator';
import { renderWithI18n } from '../utils/renderWithI18n';

describe('StorageIndicator', () => {
  it('should render storage usage correctly', () => {
    renderWithI18n(<StorageIndicator used={25000} limit={150000} />);
    
    expect(screen.getByText(/25k\/150k characters/)).toBeInTheDocument();
  });

  it('should calculate percentage correctly', () => {
    const { container } = renderWithI18n(<StorageIndicator used={30000} limit={150000} />);
    const progressBar = container.querySelector('[style*="width"]');
    expect(progressBar).toHaveStyle({ width: '20%' });
  });

  it('should show warning color when near limit', () => {
    const { container } = renderWithI18n(<StorageIndicator used={140000} limit={150000} />);
    const progressBar = container.querySelector('.bg-yellow-500, .bg-red-500');
    expect(progressBar).toBeInTheDocument();
  });
});
