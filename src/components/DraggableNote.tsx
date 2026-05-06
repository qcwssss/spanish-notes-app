'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import { NoteListItem } from '@/types/note';
import { ROUTES, UNTITLED_NOTE_TITLE } from '@/constants';
import { Trash2, Star } from 'lucide-react';
import { deleteNote } from '@/utils/notes/actions';
import { toggleFavorite } from '@/utils/notes/actions';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { useToast } from '@/components/ToastProvider';
import { useI18n } from '@/components/I18nProvider';

interface DraggableNoteProps {
  note: NoteListItem;
}

export default function DraggableNote({ note }: DraggableNoteProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useI18n();
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

  const displayTitle = note.title && note.title !== UNTITLED_NOTE_TITLE
    ? note.title
    : t('notes.untitled');

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
        title: t('toast.error'),
        description: t('toast.favoriteUpdateFailed'),
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
      router.push(ROUTES.app);
    } catch (error) {
      console.error('Failed to delete note:', error);
      toast({
        title: t('toast.error'),
        description: t('notes.deleteFailed'),
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
          href={`${ROUTES.app}?noteId=${note.id}`}
          className="block p-2 pr-16 rounded-lg text-sm text-slate-600 transition-colors truncate cursor-grab active:cursor-grabbing hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/60 dark:hover:text-white"
          {...listeners}
          {...attributes}
        >
          {displayTitle}
        </Link>
        <button
          type="button"
          onClick={handleToggleFavorite}
          onPointerDown={(event) => event.stopPropagation()}
          disabled={isTogglingFavorite}
          className={`absolute right-8 top-1/2 -translate-y-1/2 p-1.5 rounded transition-all z-10 ${
            note.is_favorite 
              ? 'text-yellow-400 hover:text-yellow-300' 
              : 'text-slate-500 can-hover:opacity-0 can-hover:group-hover:opacity-100 can-hover:group-focus-within:opacity-100 hover:text-yellow-500 dark:text-slate-400 dark:hover:text-yellow-400'
          }`}
          title={note.is_favorite ? t('notes.favoriteRemove') : t('notes.favoriteAdd')}
          aria-label={note.is_favorite ? t('notes.favoriteRemove') : t('notes.favoriteAdd')}
        >
          <Star className={`w-4 h-4 ${note.is_favorite ? 'fill-current' : ''}`} />
        </button>
        <button
          type="button"
          onClick={handleDeleteClick}
          onPointerDown={(event) => event.stopPropagation()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded text-slate-500 can-hover:opacity-0 transition-all can-hover:group-hover:opacity-100 can-hover:group-focus-within:opacity-100 hover:bg-slate-100 hover:text-red-500 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-red-400 z-10"
          title={t('notes.deleteNote')}
          aria-label={t('notes.deleteNote')}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <Dialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-50 dark:bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            <Dialog.Title className="mb-2 text-xl font-bold text-slate-900 dark:text-slate-100">
              {t('notes.deleteTitle')}
            </Dialog.Title>
            
            <Dialog.Description className="mb-6 text-slate-600 dark:text-slate-300">
              {t('notes.deleteDescription')}
            </Dialog.Description>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              >
                {t('editor.cancel')}
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-6 py-2 font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
              >
                {isDeleting ? t('notes.deleting') : t('editor.delete')}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
