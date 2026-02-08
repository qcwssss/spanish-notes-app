import Link from 'next/link';
import { createServerClient } from '@/utils/supabase/server';
import { getServerLocale } from '@/i18n/server';
import { createTranslator } from '@/i18n/translator';
import RevokeShareButton from '@/components/RevokeShareButton';

export const runtime = 'edge';

interface ShareRow {
  note_id: string;
  token: string;
  is_active: boolean;
  created_at: string;
  note:
    | {
        id: string | null;
        title: string | null;
      }
    | {
        id: string | null;
        title: string | null;
      }[]
    | null;
}

const getRelatedNote = (row: ShareRow): { id: string | null; title: string | null } | null => {
  if (!row.note) return null;
  if (Array.isArray(row.note)) {
    return row.note[0] ?? null;
  }
  return row.note;
};

export default async function SharesPage() {
  const locale = await getServerLocale();
  const t = createTranslator(locale);
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900/70">
          <h1 className="text-xl font-semibold">{t('share.manageTitle')}</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">{t('auth.title')}</p>
          <Link href="/" className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500">
            {t('share.ctaHome')}
          </Link>
        </div>
      </main>
    );
  }

  const { data, error } = await supabase
    .from('note_shares')
    .select('note_id, token, is_active, created_at, note:notes!note_shares_note_id_fkey(id, title)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data as ShareRow[] | null) ?? [];
  const dateFormatter = new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{t('share.manageTitle')}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t('share.manageSubtitle')}</p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
          {t('share.noShares')}
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => {
            const note = getRelatedNote(row);
            const noteId = note?.id ?? null;
            const hasNote = Boolean(noteId);

            return (
            <div key={`${row.token}-${row.created_at}`} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{note?.title || t('notes.untitled')}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {row.is_active ? t('share.statusActive') : t('share.statusRevoked')}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {t('share.latestSharedAt', { date: dateFormatter.format(new Date(row.created_at)) })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {row.is_active && (
                    <Link
                      href={`/share/${row.token}`}
                      target="_blank"
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      {t('share.openShare')}
                    </Link>
                  )}

                  {hasNote && (
                    <Link
                      href={`/?noteId=${noteId}`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      {t('share.openNote')}
                    </Link>
                  )}

                  {hasNote && row.is_active && (
                    <RevokeShareButton noteId={row.note_id} />
                  )}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
