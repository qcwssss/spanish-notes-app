'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Note } from '@/types/note';
import { Folder } from '@/types/folder';
import { UserProfile } from '@/types/profile';
import CreateNoteButton from './CreateNoteButton';
import UserInfoCard from './UserInfoCard';
import FolderList from './FolderList';
import CreateFolderDialog from './CreateFolderDialog';
import { shouldShowHierarchy } from '@/utils/folders/display';
import { createFolder } from '@/utils/folders/actions';
import { UNTITLED_NOTE_TITLE } from '@/constants';
import { FolderPlus } from 'lucide-react';

interface SidebarProps {
  notes: Note[];
  folders: Folder[];
  profile: UserProfile | null;
}

export default function Sidebar({ notes, folders, profile }: SidebarProps) {
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const showHierarchy = shouldShowHierarchy(folders);

  const handleCreateFolder = async (name: string) => {
    await createFolder(name);
    setIsCreateFolderOpen(false);
  };

  return (
    <aside className="w-64 border-r border-slate-700 bg-slate-900 h-screen flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-slate-100 mb-4">My Notes</h2>
        <CreateNoteButton isActive={profile?.is_active || false} />
      </div>

      <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
        {showHierarchy ? (
          <FolderList folders={folders} notes={notes} showHierarchy={true} />
        ) : (
          <div className="space-y-1">
            {notes.map((note) => (
              <Link
                key={note.id}
                href={`/?noteId=${note.id}`}
                className="block p-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors truncate"
              >
                {note.title || UNTITLED_NOTE_TITLE}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <div className="p-2 border-t border-slate-700">
        <button
          onClick={() => setIsCreateFolderOpen(true)}
          className="w-full flex items-center gap-2 p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          aria-label="Create Folder"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Create Folder</span>
        </button>
      </div>

      {profile && <UserInfoCard profile={profile} />}

      <CreateFolderDialog
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        onCreate={handleCreateFolder}
      />
    </aside>
  );
}
