import { getServerLocale } from '@/i18n/server';
import { createTranslator } from '@/i18n/translator';

export default async function NotFound() {
  const locale = await getServerLocale();
  const t = createTranslator(locale);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">404</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{t('notFound.pageNotFound')}</p>
        <a
          href="/"
          className="mt-4 inline-block text-blue-600 hover:underline dark:text-blue-400"
        >
          {t('notFound.goHome')}
        </a>
      </div>
    </div>
  );
}
