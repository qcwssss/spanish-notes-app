'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createTranslator } from '@/i18n/translator';
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale, isLocale } from '@/i18n/config';

interface I18nContextValue {
  locale: Locale;
  setLocale: (nextLocale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

interface I18nProviderProps {
  initialLocale?: Locale;
  children: React.ReactNode;
}

const setLocaleCookie = (locale: Locale) => {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${maxAge}`;
};

export function I18nProvider({ initialLocale = DEFAULT_LOCALE, children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCALE_COOKIE);
    if (isLocale(stored) && stored !== locale) {
      setLocaleState(stored);
      setLocaleCookie(stored);
    }
  }, [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem(LOCALE_COOKIE, nextLocale);
    setLocaleCookie(nextLocale);
  };

  const t = useMemo(() => createTranslator(locale), [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};
