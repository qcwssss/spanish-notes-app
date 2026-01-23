'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { Folder } from '@/types/folder';
import { Note } from '@/types/note';
import { UNTITLED_NOTE_TITLE } from '@/constants';
import { moveNote } from '@/utils/notes/actions';
import { renameFolder } from '@/utils/folders/actions';
import DroppableFolder from './DroppableFolder';
import DraggableNote from './DraggableNote';

interface FolderListProps {
  folders: Folder[];
  notes: Note[];
  showHierarchy?: boolean;
}

export default function FolderList({ folders, notes, showHierarchy = true }: FolderListProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(folders.map(f => f.id))
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const notesByFolder = useMemo(() => {
    const map = new Map<string, Note[]>();
    for (const note of notes) {
      if (note.folder_id) {
        if (!map.has(note.folder_id)) {
          map.set(note.folder_id, []);
        }
        map.get(note.folder_id)!.push(note);
      }
    }
    return map;
  }, [notes]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleRenameFolder = async (folderId: string, newName: string) => {
    await renameFolder(folderId, newName);
  };

  const getNotesForFolder = (folderId: string) => {
    return notesByFolder.get(folderId) || [];
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const noteId = active.id as string;
    const folderId = over.id as string;

    if (active.data.current?.type === 'note' && over.data.current?.type === 'folder') {
      const note = active.data.current.note as Note;
      
      if (note.folder_id === folderId) return;

      try {
        await moveNote(noteId, folderId);
      } catch (error) {
        console.error('Failed to move note:', error);
      }
    }
  };

  if (!showHierarchy) {
    return (
      <div className="space-y-1">
        {notes.map(note => (
          <Link
            key={note.id}
            href={`/?noteId=${note.id}`}
            className="block p-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors truncate"
          >
            {note.title || UNTITLED_NOTE_TITLE}
          </Link>
        ))}
      </div>
    );
  }

  const folderTree = (
    <div className="space-y-1">
      {folders.map(folder => {
        const folderNotes = getNotesForFolder(folder.id);
        const isExpanded = expandedFolders.has(folder.id);

        return (
          <DroppableFolder
            key={folder.id}
            folder={folder}
            isExpanded={isExpanded}
            onToggle={toggleFolder}
            onRename={handleRenameFolder}
            noteCount={folderNotes.length}
          >
            {folderNotes.map(note => (
              <DraggableNote key={note.id} note={note} />
            ))}
          </DroppableFolder>
        );
      })}
    </div>
  );

  if (!isClient) {
    return folderTree;
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {folderTree}
    </DndContext>
  );
}
