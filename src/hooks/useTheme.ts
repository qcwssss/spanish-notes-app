'use client';

import { useSyncExternalStore, useEffect } from 'react';
import { getStoredTheme, setStoredTheme, applyTheme, type ThemePreference } from '@/utils/theme';

// 与 src/utils/theme.ts 中保持一致
const THEME_STORAGE_KEY = 'app-theme';

function subscribeToTheme(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  // 使用命名函数以便能从 removeEventListener 正确移除
  const handler = (e: StorageEvent) => {
    if (e.key === THEME_STORAGE_KEY) callback();
  };

  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

function getThemeSnapshot(): ThemePreference {
  return getStoredTheme() ?? 'dark';
}

function getThemeServerSnapshot(): ThemePreference {
  return 'dark';
}

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  );

  // 任何来源（本 Tab setTheme 或其他 Tab 的 storage 事件）触发快照变化时，
  // 同步更新 DOM class，防止 DOM 与存储值脱节
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (nextTheme: ThemePreference) => {
    setStoredTheme(nextTheme);
    applyTheme(nextTheme);
    // 手动派发 StorageEvent 让 useSyncExternalStore 感知当前 Tab 的变化
    window.dispatchEvent(new StorageEvent('storage', { key: THEME_STORAGE_KEY }));
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return { theme, setTheme, toggleTheme };
}
