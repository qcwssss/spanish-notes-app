import Link from 'next/link';
import NotePlayer from '@/components/NotePlayer';
import { getServerLocale } from '@/i18n/server';
import { createTranslator } from '@/i18n/translator';
import { getSharedNoteByToken } from '@/utils/shares/queries';

export const runtime = 'edge';

export default async function SharedNotePage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;
  const locale = await getServerLocale();
  const t = createTranslator(locale);
  const note = await getSharedNoteByToken(token);

  if (!note) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <main className="mx-auto max-w-3xl px-4 py-16">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
            <h1 className="text-2xl font-bold">{t('share.unavailableTitle')}</h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300">{t('share.unavailableDescription')}</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {t('share.ctaHome')}
              </Link>
              <Link
                href="/"
                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-500"
              >
                {t('share.ctaStart')}
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <main className="mx-auto max-w-4xl px-4 py-8 md:py-12">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="truncate text-2xl font-bold text-slate-900 dark:text-slate-100">{note.title}</h1>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-900/30 dark:text-blue-300">
            {t('share.readonlyBadge')}
          </span>
        </div>

        <NotePlayer content={note.content} targetLanguage={note.targetLanguage} />
      </main>
    </div>
  );
}
