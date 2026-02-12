import Link from 'next/link';
import { ROUTES } from '@/constants';
import { getServerLocale } from '@/i18n/server';
import { messages } from '@/i18n/messages';
import { createTranslator } from '@/i18n/translator';
import { HelpCircle, BookOpen, CheckCircle2, ChevronRight, Home } from 'lucide-react';

export default async function FaqPage() {
  const locale = await getServerLocale();
  const t = createTranslator(locale);
  const faqMessageGroup = messages[locale]?.faq ?? messages.en.faq;
  const faqIndices = Object.keys(faqMessageGroup)
    .filter((key) => /^q\d+$/.test(key))
    .map((key) => Number(key.slice(1)))
    .sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      <main className="mx-auto max-w-4xl px-4 py-10 md:py-16">
        
        {/* Header Section */}
        <header className="mb-8 text-center md:mb-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-sm dark:bg-blue-900/30 dark:text-blue-400">
            <HelpCircle className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            {t('faq.title')}
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t('faq.subtitle')}
          </p>
        </header>

        {/* How it Works Section */}
        <section className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('faq.howTitle')}</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((step) => (
              <div key={step} className="relative rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/50">
                <div className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-md ring-4 ring-white dark:ring-slate-900">
                  {step}
                </div>
                <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t(`faq.step${step}`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-4">
          <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-white px-2">
            {t('faq.sectionTitle')}
          </h2>
          
          <div className="grid gap-4">
            {faqIndices.map((index) => (
              <details 
                key={index} 
                className="group rounded-2xl border border-slate-200 bg-white transition-all hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-blue-800 dark:hover:bg-slate-900 open:ring-2 open:ring-blue-100 dark:open:ring-blue-900/30"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between p-5 text-base font-medium text-slate-800 dark:text-slate-200">
                  <span>{t(`faq.q${index}`)}</span>
                  <ChevronRight className="h-5 w-5 text-slate-400 transition-transform duration-200 group-open:rotate-90 group-open:text-blue-500" />
                </summary>
                <div className="border-t border-slate-100 px-5 pb-5 pt-3 text-slate-600 dark:border-slate-800 dark:text-slate-400 leading-relaxed">
                  {t(`faq.a${index}`)}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Footer Actions */}
        <footer className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href={ROUTES.home}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white sm:w-auto"
          >
            <Home className="h-4 w-4" />
            {t('faq.ctaHome')}
          </Link>
          <Link
            href={ROUTES.app}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-md transition-all hover:bg-blue-500 hover:shadow-lg sm:w-auto"
          >
            <CheckCircle2 className="h-4 w-4" />
            {t('faq.ctaStart')}
          </Link>
        </footer>
      </main>
    </div>
  );
}
