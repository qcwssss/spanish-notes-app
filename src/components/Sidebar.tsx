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
import { useI18n } from '@/components/I18nProvider';

const SIDEBAR_COLLAPSE_KEY = 'app-sidebar-collapsed';

interface SidebarProps {
  notes: Note[];
  folders: Folder[];
  profile: UserProfile | null;
  selectedNoteId?: string | null;
}

export default function Sidebar({ notes, folders, profile, selectedNoteId }: SidebarProps) {
  const { t } = useI18n();
  const pathname = usePathname();
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Restore collapsed state from local storage (Client-side only)
  useEffect(() => {
    const savedState = localStorage.getItem(SIDEBAR_COLLAPSE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (typeof parsedState === 'boolean') {
          setIsCollapsed(parsedState);
        }
      } catch (e) {
        console.error('Failed to parse sidebar state', e);
      }
    }
  }, []);
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
        title: t('toast.error'),
        description: error instanceof Error ? error.message : t('folders.createFolderFailed'),
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
  
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize to detect mobile using matchMedia
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    // Initial check
    setIsMobile(mediaQuery.matches);

    // Handler for change
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // Modern browsers support addEventListener on MediaQueryList
    // (Safari 14+, Chrome 39+, Firefox 55+)
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Auto-close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [pathname, isMobile]);

  // Handle hydration mismatch for local storage
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine sidebar visibility class using Tailwind responsive prefixes
  // Mobile (default): Fixed, toggle via transform
  // Desktop (md): Relative, toggle via width
  const sidebarClasses = `
    fixed inset-y-0 left-0 z-40
    h-screen w-64
    bg-white dark:bg-slate-900
    shadow-xl
    transition-all duration-300 ease-in-out
    ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}

    md:relative md:inset-auto md:shadow-none
    md:translate-x-0 md:transform-none
    ${isCollapsed ? 'md:w-0 md:opacity-0 md:border-none' : 'md:w-64 md:opacity-100 md:border-r md:border-slate-200 md:dark:border-slate-700'}
  `;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => handleCollapse(true)}
        />
      )}

      {/* Toggle Button (Visible when sidebar is hidden) */}
      <button
        onClick={() => handleCollapse(false)}
        className={`fixed top-4 left-4 z-50 p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg text-slate-500 hover:text-slate-900 border border-slate-200 transition-all duration-300 shadow-lg dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-white dark:border-slate-700 ${
          isCollapsed ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
        }`}
        title={t('sidebar.expandSidebar')}
        aria-label={t('sidebar.expandSidebar')}
      >
        <PanelLeftOpen className="w-5 h-5" />
      </button>

      <aside className={sidebarClasses}>
        <div className="flex flex-col h-full w-64 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('sidebar.myNotes')}</h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleCollapse(true)}
                className="text-slate-500 hover:text-slate-900 transition-all p-1 rounded-md hover:bg-slate-100 opacity-100 md:opacity-0 md:group-hover/sidebar:opacity-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                aria-label={t('sidebar.collapseSidebar')}
                title={t('sidebar.collapseSidebar')}
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
                {t('sidebar.allNotes')}
              </Link>
              <Link
                href="/favorites"
                className={`flex-1 rounded-lg px-3 py-2 text-center transition ${
                  isFavoritesView
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {t('sidebar.favorites')}
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
                title={t('sidebar.createFolder')}
                aria-label={t('sidebar.createFolder')}
              >
                <FolderPlus className="w-5 h-5" />
              </button>
              <UserInfoCard 
                profile={profile} 
                theme={mounted ? theme : 'dark'} // Default safely to dark or matching server, but better to delay render
                onToggleTheme={handleThemeToggle}
              />
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
