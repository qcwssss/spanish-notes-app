import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUserProfile } from '@/utils/profile/queries';
import SettingsForm from './SettingsForm';
import { getServerLocale } from '@/i18n/server';
import { createTranslator } from '@/i18n/translator';
import { createServerClient } from '@/utils/supabase/server';
import RevokeShareButton from '@/components/RevokeShareButton';
import ScrollToSectionOnLoad from '@/components/ScrollToSectionOnLoad';

interface SettingsSearchParams {
  section?: string;
}

interface ShareRow {
  id: string;
  note_id: string;
  token: string;
  is_active: boolean;
  created_at: string;
  note: NoteInfo | NoteInfo[] | null;
}

type NoteInfo = {
  id: string | null;
  title: string | null;
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<SettingsSearchParams>;
} = {}) {
  const profile = await getUserProfile();
  const locale = await getServerLocale();
  const t = createTranslator(locale);
  const resolvedSearchParams = (await searchParams) ?? {};
  const shouldFocusSharedLinks = resolvedSearchParams.section === 'shared-links';

  if (!profile) {
    redirect('/');
  }

  if (!profile.is_active) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">⚠️ {t('settings.inactiveTitle')}</h1>
          <p className="text-slate-400">{t('settings.inactiveDescription')}</p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            {t('settings.backHome')}
          </Link>
        </div>
      </div>
    );
  }

  const supabase = await createServerClient();
  const { data: shareRows, error: shareError } = await supabase
    .from('note_shares')
    .select('id, note_id, token, is_active, created_at, note:notes!note_shares_note_id_fkey(id, title)')
    .eq('owner_id', profile.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (shareError) {
    throw new Error(shareError.message);
  }

  const dateFormatter = new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {shouldFocusSharedLinks && <ScrollToSectionOnLoad sectionId="shared-links" />}
      <div className="max-w-2xl mx-auto p-8 space-y-8">
        <div>
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-2"
          >
            ← {t('settings.backNotes')}
          </Link>
          <h1 className="text-3xl font-bold mt-4">⚙️ {t('settings.title')}</h1>
        </div>

        <SettingsForm profile={profile} />

        <section
          id="shared-links"
          className={`bg-white border border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 rounded-xl p-6 space-y-4 ${
            shouldFocusSharedLinks
              ? 'ring-2 ring-blue-500/50 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-950'
              : ''
          }`}
        >
          <h2 className="text-xl font-semibold flex items-center gap-2">🔗 {t('share.manageTitle')}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">{t('share.manageSubtitle')}</p>

          {!shareRows || shareRows.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">{t('share.noShares')}</p>
          ) : (
            <div className="space-y-3">
              {(shareRows as ShareRow[]).map((row) => {
                const note = Array.isArray(row.note) ? row.note[0] : row.note;
                return (
                  <div key={row.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                    <p className="truncate font-medium">{note?.title || t('notes.untitled')}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {t('share.latestSharedAt', { date: dateFormatter.format(new Date(row.created_at)) })}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <Link
                        href={`/share/${row.token}`}
                        target="_blank"
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        {t('share.openShare')}
                      </Link>

                      {note?.id && (
                        <Link
                          href={`/?noteId=${note.id}`}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          {t('share.openNote')}
                        </Link>
                      )}

                      <RevokeShareButton noteId={row.note_id} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
