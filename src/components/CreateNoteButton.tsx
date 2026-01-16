'use client';

import { useState } from 'react';
import { createNote } from '@/utils/notes/queries';
import { useRouter } from 'next/navigation';
import ActivationDialog from './ActivationDialog';

interface CreateNoteButtonProps {
  isActive: boolean;
}

export default function CreateNoteButton({ isActive }: CreateNoteButtonProps) {
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
      const newNote = await createNote('Untitled Note', '');
      router.push(`/?noteId=${newNote.id}`);
    } catch (e) {
      console.error(e);
      alert('Failed to create note');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <button
        onClick={handleCreate}
        disabled={isCreating}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
      >
        {isCreating ? 'Creating...' : '+ New Note'}
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
