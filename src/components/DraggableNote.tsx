'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import { Note } from '@/types/note';
import { UNTITLED_NOTE_TITLE } from '@/constants';
import { Trash2 } from 'lucide-react';
import { deleteNote } from '@/utils/notes/queries';
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
          className="block p-2 pr-9 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors truncate text-sm cursor-grab active:cursor-grabbing"
          {...listeners}
          {...attributes}
        >
          {note.title || UNTITLED_NOTE_TITLE}
        </Link>
        <button
          type="button"
          onClick={handleDeleteClick}
          onPointerDown={(event) => event.stopPropagation()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded opacity-0 group-hover:opacity-100 transition-all z-10"
          title="Delete note"
          aria-label="Delete note"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <Dialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md z-50 shadow-xl focus:outline-none">
            <Dialog.Title className="text-xl font-bold text-slate-100 mb-2">
              Delete note?
            </Dialog.Title>
            
            <Dialog.Description className="text-slate-300 mb-6">
              This will permanently delete this note.
            </Dialog.Description>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
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
