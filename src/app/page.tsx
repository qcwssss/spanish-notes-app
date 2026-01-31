import { createServerClient } from '@/utils/supabase/server';
import { getUserProfile } from '@/utils/profile/queries';
import { getFolders } from '@/utils/folders/queries';
import Sidebar from '@/components/Sidebar';
import Editor from '@/components/Editor';
import AuthGate from '@/components/AuthGate';

export const runtime = 'edge';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createServerClient();
  const profile = await getUserProfile();
  const folders = await getFolders();

  // 1. Fetch Notes List
  const { data: notes } = await supabase
    .from('notes')
    .select('id, title, updated_at, folder_id, is_favorite')
    .order('updated_at', { ascending: false });

  // 2. Determine Selected Note
  const resolvedSearchParams = await searchParams;
  const selectedNoteId = resolvedSearchParams?.noteId as string;
  const isEditMode = resolvedSearchParams?.mode === 'edit';
  let activeNote = null;

  if (selectedNoteId) {
    const { data: note } = await supabase
      .from('notes')
      .select('*')
      .eq('id', selectedNoteId)
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

      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        {activeNote ? (
          <Editor
            note={activeNote}
            isActive={profile?.is_active || false}
            targetLanguage={profile?.target_language ?? 'es'}
            initialEditMode={isEditMode}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-500">
            <p className="px-4 text-center">Select a note to start practicing</p>
          </div>
        )}
      </main>
    </div>
  );
}
