import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
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

vi.mock('@/components/ToastProvider', () => ({
  useToast: () => ({ toast: vi.fn() }),
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

describe('SettingsForm light mode', () => {
  it('uses light defaults for card and language select', () => {
    renderWithI18n(<SettingsForm profile={profile} />);

    const card = screen.getByTestId('settings-card');
    expect(card.className).toContain('bg-white');
    expect(card.className).toContain('border-slate-200');
    expect(card.className).toContain('text-slate-900');
    expect(card.className).toContain('dark:bg-slate-900');
    expect(card.className).toContain('dark:border-slate-700');
    expect(card.className).toContain('dark:text-slate-100');

    const select = screen.getByLabelText('Target language');
    expect(select.className).toContain('bg-white');
    expect(select.className).toContain('border-slate-200');
    expect(select.className).toContain('text-slate-900');
    expect(select.className).toContain('dark:bg-slate-800');
    expect(select.className).toContain('dark:border-slate-600');
    expect(select.className).toContain('dark:text-slate-100');
  });
});
