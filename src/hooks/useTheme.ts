'use client';

import { useSyncExternalStore } from 'react';
import { getStoredTheme, setStoredTheme, applyTheme, type ThemePreference } from '@/utils/theme';

// 使用 useSyncExternalStore 在 SSR / CSR 两侧获得一致的初始值，
// 彻底消除水合阶段的主题闪烁（FOUC）。

const THEME_STORAGE_KEY = 'theme';

function subscribeToTheme(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  // 监听其他 Tab 的 storage 变化，保持 Tab 间同步
  window.addEventListener('storage', (e) => {
    if (e.key === THEME_STORAGE_KEY) callback();
  });
  return () => window.removeEventListener('storage', callback as EventListener);
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

  const setTheme = (nextTheme: ThemePreference) => {
    setStoredTheme(nextTheme);
    applyTheme(nextTheme);
    // 手动触发同页面内的重新渲染（storage 事件不会在当前 Tab 中触发）
    window.dispatchEvent(new StorageEvent('storage', { key: THEME_STORAGE_KEY }));
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return { theme, setTheme, toggleTheme };
}
