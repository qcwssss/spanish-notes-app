import { createServerClient } from '@/utils/supabase/server';
import Sidebar from '@/components/Sidebar';
import NotePlayer from '@/components/NotePlayer';

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
  let activeNoteContent = null;

  if (selectedNoteId) {
    const { data: note } = await supabase
      .from('notes')
      .select('content')
      .eq('id', selectedNoteId)
      .single();
    activeNoteContent = note?.content;
  }

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-slate-100">
      <Sidebar notes={notes || []} />
      
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        {activeNoteContent ? (
          <div className="max-w-4xl mx-auto space-y-8">
             <header className="space-y-4">
               <h1 className="text-3xl font-bold text-slate-100">
                 {notes?.find(n => n.id === selectedNoteId)?.title || 'Untitled Note'}
               </h1>
             </header>
             <NotePlayer content={activeNoteContent} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p>Select a note to start practicing</p>
          </div>
        )}
      </main>
    </div>
  );
}
