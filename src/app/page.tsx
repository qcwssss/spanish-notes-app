import { createServerClient } from '@/utils/supabase/server';
import Sidebar from '@/components/Sidebar';
import Editor from '@/components/Editor';


export const runtime = 'edge';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createServerClient();

  // 1. Fetch Notes List
  const { data: notes } = await supabase
    .from('notes')
    .select('id, title, updated_at')
    .order('updated_at', { ascending: false });

  // 2. Determine Selected Note
  const resolvedSearchParams = await searchParams;
  const selectedNoteId = resolvedSearchParams?.noteId as string;
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
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar notes={notes || []} />
      
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        {activeNote ? (
           <Editor note={activeNote} />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p>Select a note to start practicing</p>
          </div>
        )}
      </main>
    </div>
  );
}
