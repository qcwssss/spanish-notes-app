import Link from 'next/link';

interface Note {
  id: string;
  title: string;
  updated_at: string;
}

export default function Sidebar({ notes }: { notes: Note[] }) {
  return (
    <aside className="w-64 border-r border-slate-700 bg-slate-900 h-screen overflow-y-auto flex-shrink-0">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-slate-100">My Notes</h2>
      </div>
      <nav className="p-2 space-y-1">
        {notes.map((note) => (
          <Link
            key={note.id}
            href={`/?noteId=${note.id}`}
            className="block p-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors truncate"
          >
            {note.title || 'Untitled Note'}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
