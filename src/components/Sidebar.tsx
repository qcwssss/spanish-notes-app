'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Note } from '@/types/note';
import { Folder, DEFAULT_FOLDER_NAME } from '@/types/folder';
import { UserProfile } from '@/types/profile';
import CreateNoteButton from './CreateNoteButton';
import UserInfoCard from './UserInfoCard';
import FolderList from './FolderList';
import FavoritesSection from './FavoritesSection';
import CreateFolderDialog from './CreateFolderDialog';
import { shouldShowHierarchy } from '@/utils/folders/display';
import { createFolder } from '@/utils/folders/actions';
import { FolderPlus, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useToast } from './ToastProvider';
import { usePathname } from 'next/navigation';
import { applyTheme, getStoredTheme, setStoredTheme, type ThemePreference } from '@/utils/theme';

const SIDEBAR_COLLAPSE_KEY = 'app-sidebar-collapsed';

interface SidebarProps {
  notes: Note[];
  folders: Folder[];
  profile: UserProfile | null;
  selectedNoteId?: string | null;
}

export default function Sidebar({ notes, folders, profile, selectedNoteId }: SidebarProps) {
  const pathname = usePathname();
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
      const parsedState = JSON.parse(savedState);
      return typeof parsedState === 'boolean' ? parsedState : false;
    } catch (e) {
      console.error('Failed to parse sidebar state', e);
      return false;
    }
  });
  const [theme, setTheme] = useState<ThemePreference>(() => getStoredTheme() ?? 'dark');
  
  const { toast } = useToast();
  const showHierarchy = shouldShowHierarchy(folders);
  const isFavoritesView = pathname === '/favorites';

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

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

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

  const handleThemeToggle = () => {
    const nextTheme: ThemePreference = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    setStoredTheme(nextTheme);
  };

  return (
    <>
      <button
        onClick={() => handleCollapse(false)}
        className={`fixed top-4 left-4 z-50 p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg text-slate-500 hover:text-slate-900 border border-slate-200 transition-all duration-300 shadow-lg dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-white dark:border-slate-700 ${
          isCollapsed ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
        }`}
        aria-label="Expand Sidebar"
        title="Expand Sidebar"
      >
        <PanelLeftOpen className="w-5 h-5" />
      </button>

      <aside 
        className={`bg-white text-slate-900 h-screen flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden group/sidebar relative dark:bg-slate-900 dark:text-slate-100 ${
          isCollapsed ? 'w-0 border-none opacity-0' : 'w-64 border-r border-slate-200 dark:border-slate-700 opacity-100'
        }`}
      >
        <div className="flex flex-col h-full w-64 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">My Notes</h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleCollapse(true)}
                className="text-slate-500 hover:text-slate-900 transition-all p-1 rounded-md hover:bg-slate-100 opacity-0 group-hover/sidebar:opacity-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
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
          
          <nav className="p-2 space-y-3 flex-1 overflow-y-auto pb-16">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1 text-sm dark:border-slate-800 dark:bg-slate-900/60">
              <Link
                href="/"
                className={`flex-1 rounded-lg px-3 py-2 text-center transition ${
                  isFavoritesView
                    ? 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    : 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                }`}
              >
                All Notes
              </Link>
              <Link
                href="/favorites"
                className={`flex-1 rounded-lg px-3 py-2 text-center transition ${
                  isFavoritesView
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Favorites
              </Link>
            </div>
            <FavoritesSection notes={notes} />
            <FolderList 
              folders={folders} 
              notes={notes} 
              isActive={profile?.is_active || false}
              showHierarchy={showHierarchy} 
              onSelectFolder={(folder) => setSelectedFolderId(folder.id)}
            />
          </nav>

          {profile && (
            <div className="relative">
              <button
                onClick={() => setIsCreateFolderOpen(true)}
                className="absolute bottom-full right-3 mb-3 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg transition-all hover:scale-105 z-20"
                title="Create folder"
                aria-label="Create folder"
              >
                <FolderPlus className="w-5 h-5" />
              </button>
              <button
                onClick={handleThemeToggle}
                className="absolute bottom-full left-4 mb-3 px-3 py-2 text-xs text-slate-600 border border-slate-300 rounded-lg hover:text-slate-900 hover:border-slate-400 transition-colors dark:text-slate-300 dark:border-slate-700 dark:hover:text-white dark:hover:border-slate-500"
                aria-label="Toggle theme"
                title="Toggle theme"
              >
                Toggle theme
              </button>
              <UserInfoCard profile={profile} />
            </div>
          )}
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
