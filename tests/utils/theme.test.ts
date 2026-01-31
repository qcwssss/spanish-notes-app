import { describe, expect, it, beforeEach } from 'vitest';
import { getStoredTheme, setStoredTheme, applyTheme, getThemeInitScript } from '@/utils/theme';

describe('theme utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('reads stored theme when present', () => {
    localStorage.setItem('app-theme', 'dark');
    expect(getStoredTheme()).toBe('dark');
  });

  it('returns null for invalid stored theme', () => {
    localStorage.setItem('app-theme', 'system');
    expect(getStoredTheme()).toBeNull();
  });

  it('stores theme preference in localStorage', () => {
    setStoredTheme('light');
    expect(localStorage.getItem('app-theme')).toBe('light');
  });

  it('applies dark theme by setting the html class', () => {
    applyTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes dark class for light theme', () => {
    document.documentElement.classList.add('dark');
    applyTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('builds an init script that reads app-theme', () => {
    const script = getThemeInitScript();
    expect(script).toContain('app-theme');
    expect(script).toContain('classList');
  });
});
