import { createServerClient } from '@/utils/supabase/server';
import { getUserProfile } from '@/utils/profile/queries';
import { getFolders } from '@/utils/folders/queries';
import Sidebar from '@/components/Sidebar';
import FavoritesView from '@/components/FavoritesView';
import AuthGate from '@/components/AuthGate';

export default async function FavoritesPage() {
  const supabase = await createServerClient();
  const profile = await getUserProfile();
  const folders = await getFolders();

  const { data: notes } = await supabase
    .from('notes')
    .select('id, title, updated_at, folder_id, is_favorite')
    .eq('is_favorite', true)
    .order('updated_at', { ascending: false });

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <AuthGate />
      <Sidebar
        notes={notes || []}
        folders={folders}
        profile={profile}
      />

      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <FavoritesView notes={notes || []} />
      </main>
    </div>
  );
}
