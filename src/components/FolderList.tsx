'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Folder } from '@/types/folder';
import { Note } from '@/types/note';
import { UNTITLED_NOTE_TITLE } from '@/constants';
import { ChevronDown, ChevronRight, Folder as FolderIcon } from 'lucide-react';

interface FolderListProps {
  folders: Folder[];
  notes: Note[];
  showHierarchy?: boolean;
}

export default function FolderList({ folders, notes, showHierarchy = true }: FolderListProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(folders.map(f => f.id))
  );

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

  const getNotesForFolder = (folderId: string) => {
    return notes.filter(note => note.folder_id === folderId);
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

  return (
    <div className="space-y-1">
      {folders.map(folder => {
        const folderNotes = getNotesForFolder(folder.id);
        const isExpanded = expandedFolders.has(folder.id);

        return (
          <div key={folder.id}>
            <button
              onClick={() => toggleFolder(folder.id)}
              className="w-full flex items-center gap-2 p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <FolderIcon className="w-4 h-4" />
              <span className="flex-1 text-left truncate">{folder.name}</span>
              <span className="text-xs text-slate-500">{folderNotes.length}</span>
            </button>

            {isExpanded && (
              <div className="ml-6 space-y-1">
                {folderNotes.map(note => (
                  <Link
                    key={note.id}
                    href={`/?noteId=${note.id}`}
                    className="block p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors truncate text-sm"
                  >
                    {note.title || UNTITLED_NOTE_TITLE}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
