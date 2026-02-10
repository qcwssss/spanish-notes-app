import Link from 'next/link';
import { getServerLocale } from '@/i18n/server';
import { createTranslator } from '@/i18n/translator';
import GoogleSignInButton from '@/components/GoogleSignInButton';

export default async function LandingPage() {
  const locale = await getServerLocale();
  const t = createTranslator(locale);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 dark:text-slate-100">
      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16">
        <section className="rounded-3xl border border-slate-200/70 bg-white/85 p-8 shadow-sm backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/65 md:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">{t('landing.heroTitle')}</h1>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300 md:text-lg">{t('landing.heroSubtitle')}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <GoogleSignInButton
                label={t('landing.startWriting')}
                className="rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
              />
              <GoogleSignInButton
                label={t('auth.button')}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              />
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['📝', t('landing.featureWrite')],
            ['🔊', t('landing.featureSpeak')],
            ['🌍', t('landing.featureLanguage')],
            ['🔗', t('landing.featureShare')],
          ].map(([icon, label]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
              <span className="mr-2">{icon}</span>
              {label}
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/60">
            <h2 className="text-xl font-semibold">{t('landing.howTitle')}</h2>
            <ol className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li>1. {t('landing.step1')}</li>
              <li>2. {t('landing.step2')}</li>
              <li>3. {t('landing.step3')}</li>
            </ol>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">{t('landing.tip')}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/60">
            <h2 className="text-xl font-semibold">{t('landing.rulesTitle')}</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li>• {t('landing.ruleFavorites')}</li>
              <li>• {t('landing.ruleTheme')}</li>
              <li>• {t('landing.ruleLangOnce')}</li>
              <li>• {t('landing.ruleReadOnlyShare')}</li>
            </ul>
          </div>
        </section>

        <div className="mt-8 text-center">
          <GoogleSignInButton
            label={t('landing.startWriting')}
            className="inline-flex rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
          />
        </div>
      </main>
    </div>
  );
}
