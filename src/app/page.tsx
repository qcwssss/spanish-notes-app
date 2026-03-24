import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BookOpen, Globe2, PenTool, Share2, Volume2 } from 'lucide-react';
import LandingAuthDialog from '@/components/LandingAuthDialog';
import { ROUTES } from '@/constants';
import { getServerLocale } from '@/i18n/server';
import { createTranslator } from '@/i18n/translator';
import { createServerClient } from '@/utils/supabase/server';

export default async function LandingPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(ROUTES.app);
  }

  const locale = await getServerLocale();
  const t = createTranslator(locale);

  const features = [
    { icon: PenTool, title: t('landing.featureWrite') },
    { icon: Volume2, title: t('landing.featureSpeak') },
    { icon: Globe2, title: t('landing.featureLanguage') },
    { icon: Share2, title: t('landing.featureShare') },
  ];

  const steps = [t('landing.step1'), t('landing.step2'), t('landing.step3')];

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <a
        href="#main-content"
        className="sr-only rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        Skip to content
      </a>

      <header className="border-b border-slate-200/80 bg-slate-50/95">
        <nav
          aria-label="Primary"
          className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-8"
        >
          <div className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-950">
            <BookOpen aria-hidden="true" className="h-5 w-5 text-blue-600" />
            <span>VivaNote</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-600 md:gap-6">
            <a
              href="#features"
              className="rounded-full px-3 py-2 transition-colors hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {t('landing.navHow')}
            </a>
            <Link
              href={ROUTES.faq}
              className="rounded-full px-3 py-2 transition-colors hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {t('landing.navFaq')}
            </Link>
          </div>
        </nav>
      </header>

      <main id="main-content" className="mx-auto max-w-6xl px-6 pb-20 pt-14 md:px-8 md:pb-24 md:pt-20">
        <section className="grid gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,460px)] lg:items-center">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
              {t('landing.heroEyebrow')}
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 text-balance sm:text-5xl md:text-6xl">
              {t('landing.heroTitle')}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700">{t('landing.heroSubtitle')}</p>
            <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">{t('landing.heroSupport')}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <LandingAuthDialog triggerLabel={t('landing.startWriting')} />
              <Link
                href="#features"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {t('landing.secondaryCta')}
              </Link>
            </div>
          </div>

          <section
            aria-labelledby="preview-title"
            className="rounded-[2rem] border border-slate-200 bg-[#fffdf8] p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-6"
          >
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                    {t('landing.previewLabel')}
                  </p>
                  <h2 id="preview-title" className="mt-2 text-xl font-semibold text-slate-950">
                    {t('landing.previewTitle')}
                  </h2>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                  {t('landing.previewBadge')}
                </span>
              </div>

              <div className="mt-5 space-y-5">
                <article className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm leading-7 text-slate-700">{t('landing.previewBody')}</p>
                </article>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {t('landing.previewVocabTitle')}
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-700">
                      <li>amanecer — sunrise</li>
                      <li>callejuela — side street</li>
                      <li>disfrutar — enjoy</li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                      {t('landing.previewListenTitle')}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-700">
                      “Me encanta caminar por las callejuelas de Madrid al amanecer.”
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </section>

        <section id="features" aria-labelledby="features-title" className="mt-20 md:mt-24">
          <div className="max-w-2xl">
            <h2 id="features-title" className="text-2xl font-semibold tracking-tight text-slate-950 text-balance">
              {t('landing.rulesTitle')}
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">{t('landing.tip')}</p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {features.map(({ icon: Icon, title }) => (
              <article key={title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="how-title" className="mt-16 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:items-start">
            <div>
              <h2 id="how-title" className="text-2xl font-semibold tracking-tight text-slate-950 text-balance">
                {t('landing.howTitle')}
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600">{t('landing.tip')}</p>
            </div>

            <ol className="space-y-4">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-4 rounded-2xl bg-slate-50 p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-blue-700 shadow-sm">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm leading-7 text-slate-700">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
    </div>
  );
}
