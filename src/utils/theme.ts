export type ThemePreference = 'dark' | 'light';

const THEME_KEY = 'app-theme';

export const getStoredTheme = (): ThemePreference | null => {
  if (typeof window === 'undefined') return null;
  const value = localStorage.getItem(THEME_KEY);
  return value === 'dark' || value === 'light' ? value : null;
};

export const setStoredTheme = (theme: ThemePreference) => {
  localStorage.setItem(THEME_KEY, theme);
};

export const applyTheme = (theme: ThemePreference) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

export const getThemeInitScript = () => `
(() => {
  try {
    var theme = localStorage.getItem('${THEME_KEY}');
    if (theme !== 'dark' && theme !== 'light') theme = 'dark';
    document.documentElement.classList.toggle('dark', theme === 'dark');
  } catch (_) {}
})();
`;
