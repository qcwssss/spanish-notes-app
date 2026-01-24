'use client';

import { useState } from 'react';
import { createNote } from '@/utils/notes/queries';
import { useRouter } from 'next/navigation';
import ActivationDialog from './ActivationDialog';
import { UNTITLED_NOTE_TITLE } from '@/constants';
import { DEFAULT_FOLDER_NAME } from '@/types/folder';

interface CreateNoteButtonProps {
  isActive: boolean;
  targetFolderId?: string | null;
  targetFolderName?: string | null;
  defaultFolderId?: string | null;
  defaultFolderName?: string;
}

export default function CreateNoteButton({ 
  isActive, 
  targetFolderId, 
  targetFolderName,
  defaultFolderId,
  defaultFolderName = DEFAULT_FOLDER_NAME
}: CreateNoteButtonProps) {
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
      router.push(`/?noteId=${newNote.id}&mode=edit`);
    } catch (e) {
      console.error(e);
      alert('Failed to create note');
    } finally {
      setIsCreating(false);
    }
  };

  const folderName = targetFolderName ?? defaultFolderName;
  const buttonLabel = isCreating
    ? 'Creating...'
    : (folderName ? `New note in ${folderName}` : 'New Note');

  return (
    <>
      <button
        onClick={handleCreate}
        disabled={isCreating}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
      >
        {buttonLabel}
      </button>

      {!isActive && (
        <ActivationDialog 
          open={showActivationDialog} 
          onOpenChange={setShowActivationDialog}
        />
      )}
    </>
  );
}
