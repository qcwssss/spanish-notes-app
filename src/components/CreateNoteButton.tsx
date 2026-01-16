'use client';

import { createNote } from '@/utils/notes/queries';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Plus } from 'lucide-react';

export default function CreateNoteButton() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const newNote = await createNote();
      if (newNote) {
        router.push(`/?noteId=${newNote.id}`);
      }
    } catch (error) {
      console.error('Failed to create note:', error);
      alert('Failed to create note');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <button
      onClick={handleCreate}
      disabled={isCreating}
      className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium mb-4 disabled:opacity-50 cursor-pointer"
    >
      {isCreating ? (
        <span className="animate-pulse">Creating...</span>
      ) : (
        <>
          <Plus size={20} />
          <span>New Note</span>
        </>
      )}
    </button>
  );
}
