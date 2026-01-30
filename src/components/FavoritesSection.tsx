'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Star } from 'lucide-react';
import { Note } from '@/types/note';
import DraggableNote from './DraggableNote';

interface FavoritesSectionProps {
  notes: Note[];
}

export default function FavoritesSection({ notes }: FavoritesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const favoriteNotes = notes.filter(note => note.is_favorite);
  
  if (favoriteNotes.length === 0) {
    return null;
  }

  return (
    <div data-testid="favorites-section">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors group"
        aria-expanded={isExpanded}
        aria-label="Favorites"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 shrink-0" />
        )}
        <Star className="w-4 h-4 shrink-0 text-yellow-400 fill-yellow-400" />
        <span className="flex-1 text-left truncate font-medium">Favorites</span>
        <span className="text-xs text-slate-500">{favoriteNotes.length}</span>
      </button>

      {isExpanded && (
        <div className="ml-6 space-y-1">
          {favoriteNotes.map(note => (
            <DraggableNote key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
