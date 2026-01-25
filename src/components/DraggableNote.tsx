'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import { Note } from '@/types/note';
import { UNTITLED_NOTE_TITLE } from '@/constants';
import { Trash2 } from 'lucide-react';
import { deleteNote } from '@/utils/notes/queries';
import { useRouter } from 'next/navigation';

interface DraggableNoteProps {
  note: Note;
}

export default function DraggableNote({ note }: DraggableNoteProps) {
  const router = useRouter();
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

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await deleteNote(note.id);
      router.push('/');
    } catch (error) {
      console.error('Failed to delete note:', error);
      alert('Failed to delete note. Please try again.');
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid="draggable-note"
      className="relative group"
      {...listeners}
      {...attributes}
    >
      <Link
        href={`/?noteId=${note.id}`}
        className="block p-2 pr-9 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors truncate text-sm cursor-grab active:cursor-grabbing"
      >
        {note.title || UNTITLED_NOTE_TITLE}
      </Link>
      <button
        onClick={handleDelete}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded opacity-0 group-hover:opacity-100 transition-all z-10"
        title="Delete note"
        aria-label="Delete note"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
