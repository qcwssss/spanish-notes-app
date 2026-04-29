'use client';

import { useState, useEffect } from 'react';
import { getStoredTheme, setStoredTheme, applyTheme, type ThemePreference } from '@/utils/theme';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemePreference>(() => {
    // 确保在客户端执行
    if (typeof window !== 'undefined') {
      return getStoredTheme() ?? 'dark';
    }
    return 'dark'; // 服务器端默认
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (nextTheme: ThemePreference) => {
    setThemeState(nextTheme);
    setStoredTheme(nextTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return { theme, setTheme, toggleTheme };
}
