import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import SettingsForm from '@/app/settings/SettingsForm';
import { renderWithI18n } from '../../utils/renderWithI18n';

vi.mock('@/utils/profile/queries', () => ({
  updateTargetLanguage: vi.fn(() => Promise.resolve()),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('@/components/StorageIndicator', () => ({
  default: () => <div>StorageIndicator</div>,
}));

const profile = {
  id: 'test-id',
  email: 'test@example.com',
  is_active: true,
  storage_used: 5000,
  plan_type: 'free' as const,
  target_language: null,
  created_at: '2026-01-15T00:00:00Z',
};

describe('SettingsForm', () => {
  it('enables save after selecting a language', () => {
    renderWithI18n(<SettingsForm profile={profile} />);

    expect(screen.getByRole('button', { name: 'Save settings' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Target language'), { target: { value: 'es' } });
    expect(screen.getByRole('button', { name: 'Save settings' })).toBeEnabled();
  });
});
