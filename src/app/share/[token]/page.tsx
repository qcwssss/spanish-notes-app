import Link from 'next/link';
import { NotebookPen } from 'lucide-react';
import FaqEntryLink from '@/components/FaqEntryLink';
import NotePlayer from '@/components/NotePlayer';
import ShareHelpHint from '@/components/ShareHelpHint';
import ShareThemeToggle from '@/components/ShareThemeToggle';
import ShareUpdateWatcher from '@/components/ShareUpdateWatcher';
import { getServerLocale } from '@/i18n/server';
import { createTranslator } from '@/i18n/translator';
import { getSharedNoteByToken } from '@/utils/shares/queries';
import { ROUTES } from '@/constants';

export default async function SharedNotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'VivaNote';
  const locale = await getServerLocale();
  const t = createTranslator(locale);
  const note = await getSharedNoteByToken(token);
  const shareFeatures = [
    { icon: '📝', ariaLabel: 'Memo', label: t('share.featureNotes') },
    { icon: '🎯', ariaLabel: 'Target', label: t('share.featureLanguage') },
    { icon: '🔊', ariaLabel: 'Speaker', label: t('share.featureSpeak') },
    { icon: '🔗', ariaLabel: 'Link', label: t('share.featureShare') },
  ];

  if (!note) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
        <main className="mx-auto max-w-5xl px-4 py-16">
          <div className="mb-8 text-center">
            <Link
              href={ROUTES.home}
              className="inline-block text-3xl font-bold tracking-tight text-slate-900 transition-colors hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-200 md:text-4xl"
            >
              {appName}
            </Link>
            <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600 dark:text-slate-300 md:text-lg">{t('share.brandTagline')}</p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
            <div className="grid gap-0 md:grid-cols-2">
              <section className="p-8 md:p-10">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-2xl dark:bg-amber-900/20">🔒</div>
                <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{t('share.unavailableTitle')}</h1>
                <p className="mt-3 text-slate-600 dark:text-slate-300">{t('share.unavailableDescription')}</p>
                <div className="mt-6 inline-flex rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
                  (•_•)  /|\  / \
                </div>
              </section>

              <section className="border-t border-slate-200 bg-slate-50/80 p-8 md:border-l md:border-t-0 md:p-10 dark:border-slate-700 dark:bg-slate-800/40">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg dark:bg-blue-900/30">🌍</div>
                <h2 className="text-xl font-semibold">{t('share.promoTitle')}</h2>
                <p className="mt-2 text-slate-600 dark:text-slate-300">{t('share.promoDescription')}</p>

                <ul className="mt-5 space-y-3 text-sm">
                  {shareFeatures.map((feature) => (
                    <li key={feature.label} className="flex items-center gap-2">
                      <span role="img" aria-label={feature.ariaLabel}>{feature.icon}</span>
                      {feature.label}
                    </li>
                  ))}
                </ul>

                <Link
                  href={ROUTES.app}
                  className="mt-6 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                >
                  {t('share.ctaStart')}
                </Link>
                <div className="mt-3">
                  <FaqEntryLink label={t('faq.entryCta')} />
                </div>
              </section>
            </div>

            <div className="border-t border-slate-200 bg-white/80 px-6 py-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
              <ul className="flex flex-wrap items-center gap-4">
                {shareFeatures.map((feature) => (
                  <li key={feature.label} className="inline-flex items-center gap-1">
                    <span role="img" aria-label={feature.ariaLabel}>{feature.icon}</span>
                    {feature.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex w-full flex-col items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-center text-sm font-medium text-white sm:flex-row sm:text-base">
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline">⚡</span>
          <span>{t('share.topBannerText')}</span>
        </div>
        <Link
          href={ROUTES.app}
          className="group inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/30 sm:ml-2 sm:text-sm"
        >
          {t('share.topBannerCta')}
          <span className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">→</span>
        </Link>
      </div>

      <main className="mx-auto w-full max-w-4xl flex-grow px-4 py-8 md:py-12">
        <ShareUpdateWatcher token={token} initialUpdatedAt={note.updatedAt} />

        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="flex-shrink-0 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-900/30 dark:text-blue-300">
              {t('share.readonlyBadge')}
            </span>
            <h1 className="truncate text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">{note.title}</h1>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            <ShareHelpHint
              ctaLabel={t('share.howToUseCta')}
              title={t('share.howToUseTitle')}
              steps={[t('share.howToUseStep1'), t('share.howToUseStep2'), t('share.howToUseStep3')]}
              tip={t('share.howToUseTip')}
            />
            <ShareThemeToggle />
            <Link
              href={ROUTES.app}
              className="group relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-white shadow-sm transition-all duration-300 hover:w-40 focus:w-40 hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:ring-blue-400/40 dark:focus-visible:ring-offset-slate-950"
              aria-label={t('share.ctaCreate')}
            >
              <NotebookPen className="absolute left-2.5 h-4 w-4 flex-shrink-0 transition-opacity duration-300 group-hover:opacity-0 group-focus:opacity-0" />
              <span className="opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus:opacity-100 whitespace-nowrap text-sm font-medium">
                {t('share.ctaCreate')}
              </span>
            </Link>
          </div>
        </div>

        <NotePlayer content={note.content} targetLanguage={note.targetLanguage} />

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {t('share.brandCtaPrefix')} {appName}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t('share.brandTagline')}</p>

          <ul className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            {shareFeatures.map((feature) => (
              <li key={feature.label} className="inline-flex items-center gap-1">
                <span role="img" aria-label={feature.ariaLabel}>{feature.icon}</span>
                {feature.label}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={ROUTES.home}
              className="inline-flex rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t('share.ctaHome')}
            </Link>
            <Link
              href={ROUTES.faq}
              className="inline-flex rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t('faq.entryCta')}
            </Link>
            <Link
              href={ROUTES.app}
              className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              {t('share.ctaStart')}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
