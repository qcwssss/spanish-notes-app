import Link from 'next/link';
import { ROUTES } from '@/constants';
import { getServerLocale } from '@/i18n/server';
import { messages } from '@/i18n/messages';
import { createTranslator } from '@/i18n/translator';

export default async function FaqPage() {
  const locale = await getServerLocale();
  const t = createTranslator(locale);
  const faqMessageGroup = messages[locale]?.faq ?? messages.en.faq;
  const faqIndices = Object.keys(faqMessageGroup)
    .filter((key) => /^q\d+$/.test(key))
    .map((key) => Number(key.slice(1)))
    .sort((a, b) => a - b);

  const faqItems = faqIndices.map((index) => ({
    q: t(`faq.q${index}`),
    a: t(`faq.a${index}`),
  }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <main className="mx-auto max-w-4xl px-4 py-10 md:py-14">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 md:p-8">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t('faq.title')}</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 md:text-base">{t('faq.subtitle')}</p>
        </header>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/60">
          <h2 className="text-lg font-semibold">{t('faq.howTitle')}</h2>
          <ol className="mt-3 list-decimal list-outside space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
            <li>{t('faq.step1')}</li>
            <li>{t('faq.step2')}</li>
            <li>{t('faq.step3')}</li>
          </ol>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/60">
          <h2 className="text-lg font-semibold">{t('faq.sectionTitle')}</h2>
          <div className="mt-4 space-y-3">
            {faqItems.map((item) => (
              <details key={item.q} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                <summary className="cursor-pointer text-sm font-medium text-slate-900 dark:text-slate-100">{item.q}</summary>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <footer className="mt-6 flex flex-wrap gap-2">
          <Link
            href={ROUTES.home}
            className="inline-flex rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t('faq.ctaHome')}
          </Link>
          <Link
            href={ROUTES.app}
            className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            {t('faq.ctaStart')}
          </Link>
        </footer>
      </main>
    </div>
  );
}
