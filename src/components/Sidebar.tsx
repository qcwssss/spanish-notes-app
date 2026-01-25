'use client';

import { useState, useEffect, useMemo } from 'react';
import { Note } from '@/types/note';
import { Folder, DEFAULT_FOLDER_NAME } from '@/types/folder';
import { UserProfile } from '@/types/profile';
import CreateNoteButton from './CreateNoteButton';
import UserInfoCard from './UserInfoCard';
import FolderList from './FolderList';
import CreateFolderDialog from './CreateFolderDialog';
import { shouldShowHierarchy } from '@/utils/folders/display';
import { createFolder } from '@/utils/folders/actions';
import { FolderPlus, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useToast } from './ToastProvider';

const SIDEBAR_COLLAPSE_KEY = 'app-sidebar-collapsed';

interface SidebarProps {
  notes: Note[];
  folders: Folder[];
  profile: UserProfile | null;
  selectedNoteId?: string | null;
}

export default function Sidebar({ notes, folders, profile, selectedNoteId }: SidebarProps) {
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    const savedState = localStorage.getItem(SIDEBAR_COLLAPSE_KEY);
    if (!savedState) {
      return false;
    }

    try {
      return JSON.parse(savedState);
    } catch (e) {
      console.error('Failed to parse sidebar state', e);
      return false;
    }
  });
  
  const { toast } = useToast();
  const showHierarchy = shouldShowHierarchy(folders);

  const {
    defaultFolder,
    defaultFolderName,
    targetFolderId,
    targetFolderName,
  } = useMemo(() => {
    const defaultFolder = folders.find(f => f.is_default);
    const selectedFolder = selectedFolderId ? folders.find(f => f.id === selectedFolderId) : null;
    
    const selectedNote = selectedNoteId ? notes.find(n => n.id === selectedNoteId) : null;
    const selectedNoteFolderId = selectedNote?.folder_id ?? null;
    const selectedNoteFolder = selectedNoteFolderId ? folders.find(f => f.id === selectedNoteFolderId) : null;

    return {
      defaultFolder,
      defaultFolderName: defaultFolder?.name ?? DEFAULT_FOLDER_NAME,
      targetFolderId: selectedFolderId ?? selectedNoteFolderId,
      targetFolderName: selectedFolder?.name ?? selectedNoteFolder?.name ?? null,
    };
  }, [folders, notes, selectedFolderId, selectedNoteId]);

  useEffect(() => {
    if (selectedFolderId && !folders.find(f => f.id === selectedFolderId)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const handleCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    localStorage.setItem(SIDEBAR_COLLAPSE_KEY, JSON.stringify(collapsed));
  };

  return (
    <>
      <button
        onClick={() => handleCollapse(false)}
        className={`fixed top-4 left-4 z-50 p-2 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-sm rounded-lg text-slate-400 hover:text-white border border-slate-700 transition-all duration-300 shadow-lg ${
          isCollapsed ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
        }`}
        aria-label="Expand Sidebar"
        title="Expand Sidebar"
      >
        <PanelLeftOpen className="w-5 h-5" />
      </button>

      <aside 
        className={`bg-slate-900 h-screen flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden group/sidebar ${
          isCollapsed ? 'w-0 border-none opacity-0' : 'w-64 border-r border-slate-700 opacity-100'
        }`}
      >
        <div className="flex flex-col h-full w-64 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100">My Notes</h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleCollapse(true)}
                className="text-slate-400 hover:text-white transition-all p-1 rounded-md hover:bg-slate-800 opacity-0 group-hover/sidebar:opacity-100"
                aria-label="Collapse Sidebar"
                title="Collapse Sidebar"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
              <CreateNoteButton 
                isActive={profile?.is_active || false} 
                targetFolderId={targetFolderId}
                targetFolderName={targetFolderName}
                defaultFolderId={defaultFolder?.id ?? null}
                defaultFolderName={defaultFolderName}
                variant="icon"
              />
            </div>
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
        </div>

        <CreateFolderDialog
          isOpen={isCreateFolderOpen}
          onClose={() => setIsCreateFolderOpen(false)}
          onCreate={handleCreateFolder}
        />
      </aside>
    </>
  );
}
