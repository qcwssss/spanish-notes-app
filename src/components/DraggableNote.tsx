'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import { Note } from '@/types/note';
import { UNTITLED_NOTE_TITLE } from '@/constants';
import { Trash2, Star } from 'lucide-react';
import { deleteNote } from '@/utils/notes/queries';
import { toggleFavorite } from '@/utils/notes/actions';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { useToast } from '@/components/ToastProvider';

interface DraggableNoteProps {
  note: Note;
}

export default function DraggableNote({ note }: DraggableNoteProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isTogglingFavorite) return;
    
    setIsTogglingFavorite(true);
    try {
      await toggleFavorite(note.id, !note.is_favorite);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast({
        title: 'Error',
        description: 'Failed to update favorite status.',
        variant: 'destructive',
      });
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteNote(note.id);
      router.push('/');
    } catch (error) {
      console.error('Failed to delete note:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete note. Please try again.',
        variant: 'destructive',
      });
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        data-testid="draggable-note"
        className="relative group"
      >
        <Link
          href={`/?noteId=${note.id}`}
          className="block p-2 pr-16 rounded-lg text-sm text-slate-600 transition-colors truncate cursor-grab active:cursor-grabbing hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          {...listeners}
          {...attributes}
        >
          {note.title || UNTITLED_NOTE_TITLE}
        </Link>
        <button
          type="button"
          onClick={handleToggleFavorite}
          onPointerDown={(event) => event.stopPropagation()}
          disabled={isTogglingFavorite}
          className={`absolute right-8 top-1/2 -translate-y-1/2 p-1.5 rounded transition-all z-10 ${
            note.is_favorite 
              ? 'text-yellow-400 hover:text-yellow-300' 
              : 'text-slate-500 opacity-0 group-hover:opacity-100 hover:text-yellow-500 dark:text-slate-400 dark:hover:text-yellow-400'
          }`}
          title={note.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-label={note.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star className={`w-4 h-4 ${note.is_favorite ? 'fill-current' : ''}`} />
        </button>
        <button
          type="button"
          onClick={handleDeleteClick}
          onPointerDown={(event) => event.stopPropagation()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded text-slate-500 opacity-0 transition-all group-hover:opacity-100 hover:bg-slate-100 hover:text-red-500 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-red-400 z-10"
          title="Delete note"
          aria-label="Delete note"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <Dialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-50 dark:bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            <Dialog.Title className="mb-2 text-xl font-bold text-slate-900 dark:text-slate-100">
              Delete note?
            </Dialog.Title>
            
            <Dialog.Description className="mb-6 text-slate-600 dark:text-slate-300">
              This will permanently delete this note.
            </Dialog.Description>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-6 py-2 font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
