import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { I18nProvider } from '@/components/I18nProvider';
import { DEFAULT_LOCALE, type Locale } from '@/i18n/config';

interface Options extends Omit<RenderOptions, 'queries'> {
  locale?: Locale;
}

export const renderWithI18n = (ui: ReactElement, options: Options = {}) => {
  const { locale = DEFAULT_LOCALE, ...renderOptions } = options;
  return render(
    <I18nProvider initialLocale={locale}>
      {ui}
    </I18nProvider>,
    renderOptions
  );
};
