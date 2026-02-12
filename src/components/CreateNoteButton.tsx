'use client';

import { useState } from 'react';
import { createNote } from '@/utils/notes/queries';
import { useRouter } from 'next/navigation';
import ActivationDialog from './ActivationDialog';
import { ROUTES, UNTITLED_NOTE_TITLE } from '@/constants';
import { DEFAULT_FOLDER_NAME } from '@/types/folder';
import { SquarePen } from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';
import { useToast } from '@/components/ToastProvider';

interface CreateNoteButtonProps {
  isActive: boolean;
  targetFolderId?: string | null;
  targetFolderName?: string | null;
  defaultFolderId?: string | null;
  defaultFolderName?: string;
  variant?: 'button' | 'icon';
}

export default function CreateNoteButton({ 
  isActive, 
  targetFolderId, 
  targetFolderName,
  defaultFolderId,
  defaultFolderName = DEFAULT_FOLDER_NAME,
  variant = 'button'
}: CreateNoteButtonProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!isActive) {
      setShowActivationDialog(true);
      return;
    }

    setIsCreating(true);
    try {
      const folderId = targetFolderId ?? defaultFolderId ?? undefined;
      const newNote = await createNote(UNTITLED_NOTE_TITLE, '', folderId);
      router.push(`${ROUTES.app}?noteId=${newNote.id}&mode=edit`);
    } catch (e) {
      console.error(e);
      toast({ title: t('notes.createFailed'), variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const folderName = targetFolderName ?? defaultFolderName;
  const buttonLabel = isCreating
    ? t('notes.creating')
    : (folderName ? t('notes.newNoteIn', { folder: folderName }) : t('notes.newNote'));

  const activationDialog = !isActive && (
    <ActivationDialog 
      open={showActivationDialog} 
      onOpenChange={setShowActivationDialog}
    />
  );

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleCreate}
          disabled={isCreating}
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors disabled:opacity-50"
          title={buttonLabel}
          aria-label={buttonLabel}
        >
          <SquarePen className="w-5 h-5" />
        </button>
        {activationDialog}
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleCreate}
        disabled={isCreating}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
      >
        {buttonLabel}
      </button>
      {activationDialog}
    </>
  );
}
