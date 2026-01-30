'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpDown, Star } from 'lucide-react';
import { Note } from '@/types/note';
import { UNTITLED_NOTE_TITLE } from '@/constants';

interface FavoritesViewProps {
  notes: Note[];
}

export default function FavoritesView({ notes }: FavoritesViewProps) {
  const [isAscending, setIsAscending] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('favorites-sort-ascending');
    if (saved === 'true') {
      setIsAscending(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites-sort-ascending', String(isAscending));
  }, [isAscending]);

  const favoriteNotes = useMemo(() => {
    return notes.filter(note => note.is_favorite);
  }, [notes]);

  const sortedNotes = useMemo(() => {
    return [...favoriteNotes].sort((a, b) => {
      const aTime = new Date(a.updated_at).getTime();
      const bTime = new Date(b.updated_at).getTime();
      return isAscending ? aTime - bTime : bTime - aTime;
    });
  }, [favoriteNotes, isAscending]);

  if (favoriteNotes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-500">No favorites yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-slate-100">
          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          <h1 className="text-2xl font-semibold">Favorites</h1>
          <span className="text-sm text-slate-500">{sortedNotes.length}</span>
        </div>
        <button
          type="button"
          onClick={() => setIsAscending(prev => !prev)}
          className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-600 hover:text-white transition"
          aria-label={isAscending ? 'Oldest' : 'Newest'}
        >
          <ArrowUpDown className="h-4 w-4" />
          {isAscending ? 'Oldest' : 'Newest'}
        </button>
      </div>

      <div className="space-y-2">
        {sortedNotes.map(note => (
          <Link
            key={note.id}
            href={`/?noteId=${note.id}`}
            data-testid="favorite-note"
            className="group flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-slate-200 transition hover:border-slate-700 hover:bg-slate-900"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="truncate font-medium">
                  {note.title || UNTITLED_NOTE_TITLE}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Updated {new Date(note.updated_at).toLocaleDateString()}</p>
            </div>
            <span className="text-xs text-slate-500 group-hover:text-slate-300">Open</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
