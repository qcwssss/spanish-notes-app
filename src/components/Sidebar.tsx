'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/types/note';
import { Folder, DEFAULT_FOLDER_NAME } from '@/types/folder';
import { UserProfile } from '@/types/profile';
import CreateNoteButton from './CreateNoteButton';
import UserInfoCard from './UserInfoCard';
import FolderList from './FolderList';
import CreateFolderDialog from './CreateFolderDialog';
import { shouldShowHierarchy } from '@/utils/folders/display';
import { createFolder } from '@/utils/folders/actions';
import { FolderPlus } from 'lucide-react';
import { useToast } from './ToastProvider';

interface SidebarProps {
  notes: Note[];
  folders: Folder[];
  profile: UserProfile | null;
  selectedNoteId?: string | null;
}

export default function Sidebar({ notes, folders, profile, selectedNoteId }: SidebarProps) {
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const { toast } = useToast();
  const showHierarchy = shouldShowHierarchy(folders);

  const defaultFolder = folders.find(f => f.is_default);
  const selectedFolderName = selectedFolderId
    ? folders.find(folder => folder.id === selectedFolderId)?.name ?? null
    : null;
  const selectedNote = selectedNoteId
    ? notes.find(note => note.id === selectedNoteId)
    : null;
  const selectedNoteFolderId = selectedNote?.folder_id ?? null;
  const selectedNoteFolderName = selectedNoteFolderId
    ? folders.find(folder => folder.id === selectedNoteFolderId)?.name ?? null
    : null;
  const defaultFolderName = defaultFolder?.name ?? DEFAULT_FOLDER_NAME;
  const targetFolderId = selectedFolderId ?? selectedNoteFolderId;
  const targetFolderName = selectedFolderName ?? selectedNoteFolderName;

  useEffect(() => {
    if (selectedFolderId && !folders.find(f => f.id === selectedFolderId)) {
      setSelectedFolderId(null);
    }
  }, [folders, selectedFolderId]);

  const handleCreateFolder = async (name: string) => {
    try {
      await createFolder(name);
      setIsCreateFolderOpen(false);
    } catch (error) {
      console.error('Failed to create folder:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create folder',
        variant: 'destructive',
      });
    }
  };

  return (
    <aside className="w-64 border-r border-slate-700 bg-slate-900 h-screen flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-slate-100 mb-4">My Notes</h2>
        <CreateNoteButton 
          isActive={profile?.is_active || false} 
          targetFolderId={targetFolderId}
          targetFolderName={targetFolderName}
          defaultFolderId={defaultFolder?.id ?? null}
          defaultFolderName={defaultFolderName}
        />
      </div>

      <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
        <FolderList 
          folders={folders} 
          notes={notes} 
          showHierarchy={showHierarchy} 
          onSelectFolder={(folder) => setSelectedFolderId(folder.id)}
        />
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
