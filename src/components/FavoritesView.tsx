'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpDown, Star } from 'lucide-react';
import { NoteListItem } from '@/types/note';
import { ROUTES, UNTITLED_NOTE_TITLE } from '@/constants';
import { useI18n } from '@/components/I18nProvider';

interface FavoritesViewProps {
  notes: NoteListItem[];
}

export default function FavoritesView({ notes }: FavoritesViewProps) {
  const { t } = useI18n();
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

  const getDisplayTitle = (title: string | null) => {
    if (!title || title === UNTITLED_NOTE_TITLE) {
      return t('notes.untitled');
    }
    return title;
  };

  if (favoriteNotes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">{t('favorites.empty')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 pr-12 md:pr-0 dark:border-slate-800">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          <h1 className="text-2xl font-semibold">{t('favorites.title')}</h1>
          <span className="text-sm text-slate-500 dark:text-slate-500">{sortedNotes.length}</span>
        </div>
        <button
          type="button"
          onClick={() => setIsAscending(prev => !prev)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
          aria-label={isAscending ? t('favorites.oldest') : t('favorites.newest')}
        >
          <ArrowUpDown className="h-4 w-4" />
          {isAscending ? t('favorites.oldest') : t('favorites.newest')}
        </button>
      </div>

      <div className="space-y-2">
        {sortedNotes.map(note => (
          <Link
            key={note.id}
            href={`${ROUTES.app}?noteId=${note.id}`}
            data-testid="favorite-note"
            className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="truncate font-medium">
                  {getDisplayTitle(note.title)}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                {t('favorites.updated', { date: new Date(note.updated_at).toLocaleDateString() })}
              </p>
            </div>
            <span className="text-xs text-slate-500 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300">{t('favorites.open')}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
