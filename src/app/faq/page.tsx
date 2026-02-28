import Link from 'next/link';
import { ROUTES } from '@/constants';
import { getServerLocale } from '@/i18n/server';
import { messages } from '@/i18n/messages';
import { createTranslator } from '@/i18n/translator';
import { ArrowLeft, BookOpen, ChevronDown, CheckCircle2, Home, LifeBuoy } from 'lucide-react';

export default async function FaqPage() {
  const locale = await getServerLocale();
  const t = createTranslator(locale);
  const faqMessageGroup = messages[locale]?.faq ?? messages.en.faq;
  const faqIndices = Object.keys(faqMessageGroup)
    .filter((key) => /^q\d+$/.test(key))
    .map((key) => Number(key.slice(1)))
    .sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-300 selection:bg-blue-500/30 selection:text-blue-200">
      {/* Immersive Background Glow */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden">
        <div className="absolute top-[-20%] h-[30rem] w-[50rem] animate-pulse rounded-full bg-blue-600/5 object-cover blur-[150px]" />
      </div>

      <nav className="relative z-20 flex items-center justify-between border-b border-slate-800/60 bg-[#0A0A0B]/80 px-6 py-4 backdrop-blur-md">
        <Link href={ROUTES.home} className="group flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {t('faq.ctaHome')}
        </Link>
      </nav>

      <main className="relative z-10 mx-auto max-w-4xl px-6 py-16 md:py-24">
        
        {/* Header Section */}
        <header className="mb-20 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400 shadow-[0_0_30px_-5px_rgba(37,99,234,0.3)] backdrop-blur-sm">
            <LifeBuoy className="h-8 w-8" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            {t('faq.title')}
          </h1>
          <p className="mt-6 text-lg font-light text-slate-400 max-w-2xl mx-auto">
            {t('faq.subtitle')}
          </p>
        </header>

        {/* How it Works Section */}
        <section className="mb-24">
          <div className="mb-8 flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-blue-500" strokeWidth={1.5} />
            <h2 className="text-xl font-bold tracking-tight text-white">{t('faq.howTitle')}</h2>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((step) => (
              <div key={step} className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/30 p-6 transition-all hover:-translate-y-1 hover:border-blue-500/30 hover:bg-slate-800/50 hover:shadow-2xl hover:shadow-blue-900/20">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-mono font-bold text-slate-300 transition-colors group-hover:bg-blue-500/20 group-hover:text-blue-400">
                  0{step}
                </div>
                <p className="text-sm font-medium leading-relaxed text-slate-300">
                  {t(`faq.step${step}`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-6">
          <h2 className="mb-8 text-xl font-bold tracking-tight text-white">
            {t('faq.sectionTitle')}
          </h2>
          
          <div className="divide-y divide-slate-800/60 border-y border-slate-800/60">
            {faqIndices.map((index) => (
              <details 
                key={index} 
                className="group [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between py-6 text-lg font-medium text-slate-200 transition-colors hover:text-blue-400">
                  <span className="pr-6">{t(`faq.q${index}`)}</span>
                  <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-900/50 transition-colors group-hover:border-blue-500/30">
                     <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-300 group-open:-rotate-180 group-open:text-blue-500" />
                  </span>
                </summary>
                <div className="overflow-hidden pb-6 pr-12">
                   <p className="text-base font-light leading-relaxed text-slate-400 group-open:animate-in group-open:fade-in group-open:slide-in-from-top-2">
                    {t(`faq.a${index}`)}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Footer Actions */}
        <footer className="mt-24 flex flex-col items-center justify-center gap-6 border-t border-slate-800/60 pt-12 sm:flex-row">
          <Link
            href={ROUTES.app}
            className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-xl bg-blue-600 px-8 py-3.5 font-medium text-white shadow-[0_0_30px_-10px_rgba(37,99,234,0.4)] transition-all hover:bg-blue-500 hover:shadow-[0_0_50px_-15px_rgba(37,99,234,0.6)] hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
          >
            <CheckCircle2 className="mr-2 h-5 w-5" strokeWidth={1.5} />
            {t('faq.ctaStart')}
          </Link>
          <Link
            href={ROUTES.home}
            className="flex w-full items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50 px-8 py-3.5 font-medium text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white sm:w-auto"
          >
            <Home className="mr-2 h-5 w-5" strokeWidth={1.5} />
            {t('faq.ctaHome')}
          </Link>
        </footer>
      </main>
    </div>
  );
}
