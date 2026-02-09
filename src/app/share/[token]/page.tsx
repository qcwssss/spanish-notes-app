import Link from 'next/link';
import NotePlayer from '@/components/NotePlayer';
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
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'NoteLingo';
  const locale = await getServerLocale();
  const t = createTranslator(locale);
  const note = await getSharedNoteByToken(token);

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
                  <li className="flex items-center gap-2"><span>📝</span>{t('share.featureNotes')}</li>
                  <li className="flex items-center gap-2"><span>🎯</span>{t('share.featureLanguage')}</li>
                  <li className="flex items-center gap-2"><span>🔊</span>{t('share.featureSpeak')}</li>
                  <li className="flex items-center gap-2"><span>🔗</span>{t('share.featureShare')}</li>
                </ul>

                <Link
                  href={ROUTES.app}
                  className="mt-6 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                >
                  {t('share.ctaStart')}
                </Link>
              </section>
            </div>

            <div className="border-t border-slate-200 bg-white/80 px-6 py-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-1">📝 {t('share.featureNotes')}</span>
                <span className="inline-flex items-center gap-1">🎯 {t('share.featureLanguage')}</span>
                <span className="inline-flex items-center gap-1">🔊 {t('share.featureSpeak')}</span>
                <span className="inline-flex items-center gap-1">🔗 {t('share.featureShare')}</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <main className="mx-auto max-w-4xl px-4 py-8 md:py-12">
        <ShareUpdateWatcher token={token} initialUpdatedAt={note.updatedAt} />

        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="truncate text-2xl font-bold text-slate-900 dark:text-slate-100">{note.title}</h1>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-900/30 dark:text-blue-300">
              {t('share.readonlyBadge')}
            </span>
            <ShareThemeToggle />
          </div>
        </div>

        <NotePlayer content={note.content} targetLanguage={note.targetLanguage} />
      </main>
    </div>
  );
}
