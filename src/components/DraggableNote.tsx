'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import { Note } from '@/types/note';
import { UNTITLED_NOTE_TITLE } from '@/constants';

interface DraggableNoteProps {
  note: Note;
}

export default function DraggableNote({ note }: DraggableNoteProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: note.id,
    data: {
      type: 'note',
      note,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid="draggable-note"
      {...listeners}
      {...attributes}
    >
      <Link
        href={`/?noteId=${note.id}`}
        className="block p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors truncate text-sm cursor-grab active:cursor-grabbing"
      >
        {note.title || UNTITLED_NOTE_TITLE}
      </Link>
    </div>
  );
}
