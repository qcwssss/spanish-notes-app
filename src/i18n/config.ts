export const SUPPORTED_LOCALES = ['en', 'zh'] as const;

export type Locale = typeof SUPPORTED_LOCALES[number];

export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_COOKIE = 'app-locale';

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
};

export const isLocale = (value: string | null | undefined): value is Locale => {
  return value === 'en' || value === 'zh';
};
