'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/types/note';
import { updateNote, deleteNote } from '@/utils/notes/queries';
import NotePlayer from './NotePlayer';
import { useRouter } from 'next/navigation';
import ActivationDialog from './ActivationDialog';

interface EditorProps {
  note: Note;
  isActive: boolean;
}

export default function Editor({ note, isActive }: EditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const router = useRouter();

  // Sync state if note prop changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content || '');
    setIsEditing(false); // Reset to view mode when note changes
  }, [note.id, note.title, note.content]);

  const handleSave = async () => {
    if (!isActive) {
      setShowActivationDialog(true);
      return;
    }

    setIsSaving(true);
    try {
      await updateNote(note.id, { title, content });
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      alert('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
        await deleteNote(note.id);
        // Optimistic UI or wait for revalidate
        // The server action revalidates '/', but we might need to clear the query param
        router.push('/'); 
    } catch {
        alert('Failed to delete');
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header / Toolbar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-700 pb-4">
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 bg-transparent text-3xl font-bold text-slate-100 border-none focus:ring-0 outline-none placeholder-slate-600"
            placeholder="Note Title"
          />
        ) : (
          <h1 className="text-3xl font-bold text-slate-100 flex-1 truncate">{title}</h1>
        )}

        <div className="flex items-center gap-2 flex-shrink-0">
            {!isEditing ? (
                <>
                <button 
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-600"
                >
                    Edit
                </button>
                <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-lg transition-colors border border-red-900/30"
                >
                    Delete
                </button>
                </>
            ) : (
                <>
                <button 
                    onClick={() => {
                        setIsEditing(false);
                        setTitle(note.title);
                        setContent(note.content || '');
                    }}
                    className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
                >
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
                </>
            )}
        </div>
      </div>

      {/* Content Area */}
      {isEditing ? (
        <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-[calc(100vh-200px)] bg-slate-900/50 border border-slate-700 rounded-xl p-6 text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none leading-relaxed"
            placeholder="Write your Spanish notes here... Format:
## Heading
Spanish text
Chinese translation"
        />
      ) : (
        <NotePlayer content={content} />
      )}

      {!isActive && (
        <ActivationDialog 
          open={showActivationDialog} 
          onOpenChange={setShowActivationDialog}
        />
      )}
    </div>
  );
}
