'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { applyTheme, getStoredTheme, setStoredTheme, type ThemePreference } from '@/utils/theme';
import { useI18n } from '@/components/I18nProvider';

export default function ShareThemeToggle() {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<ThemePreference>('dark');

  useEffect(() => {
    const stored = getStoredTheme() ?? 'dark';
    setTheme(stored);
    applyTheme(stored);
    setMounted(true);
  }, []);

  const handleToggle = () => {
    const nextTheme: ThemePreference = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    setStoredTheme(nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      aria-label={t('profile.toggleTheme')}
      title={t('profile.toggleTheme')}
    >
      {!mounted || theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
