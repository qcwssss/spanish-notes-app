import { createServerClient } from '@/utils/supabase/server';
import { getUserProfile } from '@/utils/profile/queries';
import { getFolders } from '@/utils/folders/queries';
import Sidebar from '@/components/Sidebar';
import Editor from '@/components/Editor';
import AuthGate from '@/components/AuthGate';
import { getServerLocale } from '@/i18n/server';
import { createTranslator } from '@/i18n/translator';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants';

export const metadata: Metadata = {
  title: 'My Notes | Spanish Notes',
  description: 'Manage and study your Spanish notes',
};

export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(ROUTES.home);
  }

  const profile = await getUserProfile();
  const folders = await getFolders();
  const locale = await getServerLocale();
  const t = createTranslator(locale);

  const { data: notes } = await supabase
    .from('notes')
    .select('id, title, updated_at, folder_id, is_favorite')
    .order('updated_at', { ascending: false });

  const resolvedSearchParams = await searchParams;
  const selectedNoteId = [resolvedSearchParams?.noteId].flat()[0];
  const isEditMode = resolvedSearchParams?.mode === 'edit';
  let activeNote = null;

  if (selectedNoteId) {
    const { data: note } = await supabase
      .from('notes')
      .select('*')
      .eq('id', selectedNoteId)
      .eq('user_id', user.id)
      .single();
    activeNote = note;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <AuthGate />
      <Sidebar
        notes={notes || []}
        folders={folders}
        profile={profile}
        selectedNoteId={selectedNoteId ?? null}
      />

      <main className="flex-1 px-0 py-4 md:p-8 overflow-y-auto h-screen">
        {activeNote ? (
          <Editor
            note={activeNote}
            isActive={profile?.is_active || false}
            targetLanguage={profile?.target_language ?? 'es'}
            initialEditMode={isEditMode}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-500">
            <p className="px-4 text-center">{t('app.selectNote')}</p>
          </div>
        )}
      </main>
    </div>
  );
}
