import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/utils/supabase/server';
import { getServerLocale } from '@/i18n/server';
import { createTranslator } from '@/i18n/translator';
import { revokeNoteShare } from '@/utils/shares/queries';

export const runtime = 'edge';

interface ShareRow {
  note_id: string;
  token: string;
  is_active: boolean;
  created_at: string;
}

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
    .select('note_id, token, is_active, created_at')
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
  const noteIds = rows.map((row) => row.note_id);

  const noteMap = new Map<string, { id: string; title: string }>();
  if (noteIds.length > 0) {
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('id, title')
      .in('id', noteIds);

    if (notesError) {
      throw new Error(notesError.message);
    }

    (notes ?? []).forEach((note) => {
      noteMap.set(note.id as string, {
        id: note.id as string,
        title: (note.title as string) || '',
      });
    });
  }

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
          {rows.map((row) => (
            <div key={`${row.token}-${row.created_at}`} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{noteMap.get(row.note_id)?.title || t('notes.untitled')}</p>
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

                  {noteMap.get(row.note_id)?.id && (
                    <Link
                      href={`/?noteId=${row.note_id}`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      {t('share.openNote')}
                    </Link>
                  )}

                  {noteMap.get(row.note_id)?.id && row.is_active && (
                    <form
                      action={async () => {
                        'use server';
                        await revokeNoteShare(row.note_id);
                        revalidatePath('/shares');
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-lg bg-amber-50 px-3 py-1.5 text-sm text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50"
                      >
                        {t('share.revoke')}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
