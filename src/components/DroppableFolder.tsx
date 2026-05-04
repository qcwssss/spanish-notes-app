'use client';

import { useDroppable } from '@dnd-kit/core';
import { ChevronDown, ChevronRight, Folder as FolderIcon, MoreVertical, Plus } from 'lucide-react';
import { Folder } from '@/types/folder';
import { clsx } from 'clsx';
import { useState, useRef, useEffect } from 'react';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { useToast } from '@/components/ToastProvider';
import * as Dialog from '@radix-ui/react-dialog';
import { deleteFolderAndMoveNotes, deleteFolderAndNotes } from '@/utils/folders/actions';
import { getDefaultFolder } from '@/utils/folders/queries';
import { createNote } from '@/utils/notes/actions';
import { useRouter } from 'next/navigation';
import ActivationDialog from '@/components/ActivationDialog';
import { ROUTES, UNTITLED_NOTE_TITLE } from '@/constants';
import { useI18n } from '@/components/I18nProvider';
import { FolderDeleteDialog, FolderConfirmDeleteAllDialog } from './FolderDeleteDialogs';

interface DroppableFolderProps {
  folder: Folder;
  isExpanded: boolean;
  isActive: boolean;
  onToggle: (folderId: string) => void;
  onSelect?: (folder: Folder) => void;
  onRename: (folderId: string, newName: string) => Promise<void>;
  noteCount: number;
  children: React.ReactNode;
}

export default function DroppableFolder({
  folder,
  isExpanded,
  isActive,
  onToggle,
  onSelect,
  onRename,
  noteCount,
  children
}: DroppableFolderProps) {
  const { t } = useI18n();
  const { isOver, setNodeRef } = useDroppable({
    id: folder.id,
    data: {
      type: 'folder',
      folder,
    },
  });

  const router = useRouter();
  const [isRenaming, setIsRenaming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [displayName, setDisplayName] = useState(folder.name);
  const [newName, setNewName] = useState(folder.name);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showConfirmDeleteAllDialog, setShowConfirmDeleteAllDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const lastFolderName = useRef(folder.name);
  const isMountedRef = useRef(true);

  const { toast } = useToast();
  useOnClickOutside(menuRef, () => setShowMenu(false), showMenu);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (isRenaming || isSubmitting) {
      return;
    }
    if (folder.name === lastFolderName.current) {
      return;
    }
    lastFolderName.current = folder.name;
    setDisplayName(folder.name);
    setNewName(folder.name);
  }, [folder.name, isRenaming, isSubmitting]);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRenameSubmit = async () => {
    const trimmedName = newName.trim();
    const originalName = displayName;

    if (!trimmedName || trimmedName === originalName) {
      setIsRenaming(false);
      setNewName(originalName);
      return;
    }
    
    setIsRenaming(false);
    setDisplayName(trimmedName);

    setIsSubmitting(true);
    try {
      await onRename(folder.id, trimmedName);
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }
      console.error('Failed to rename folder:', error);
      setDisplayName(originalName);
      setNewName(originalName);
      toast({
        title: t('toast.error'),
        description: error instanceof Error ? error.message : t('folders.renameFailed'),
        variant: 'destructive',
      });
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isSubmitting) {
      return;
    }
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
      setNewName(displayName);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    setShowDeleteDialog(true);
  };

  const handleDeleteApiCall = async (apiCall: () => Promise<void>) => {
    setIsDeleting(true);
    try {
      await apiCall();
    } catch (error) {
      toast({
        title: t('toast.error'),
        description: error instanceof Error ? error.message : t('folders.deleteFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteKeepNotes = () => handleDeleteApiCall(async () => {
    const defaultFolder = await getDefaultFolder();
    if (!defaultFolder) {
      throw new Error(t('folders.defaultFolderMissing'));
    }

    await deleteFolderAndMoveNotes(folder.id, defaultFolder.id);
    setShowDeleteDialog(false);
  });

  const handleDeleteAllInit = () => {
    setShowDeleteDialog(false);
    setShowConfirmDeleteAllDialog(true);
  };

  const handleDeleteAllConfirm = () => handleDeleteApiCall(async () => {
    await deleteFolderAndNotes(folder.id);
    setShowConfirmDeleteAllDialog(false);
  });

  const handleCreateNote = async (event: React.MouseEvent) => {
    event.stopPropagation();

    if (!isActive) {
      setShowActivationDialog(true);
      return;
    }

    setIsCreatingNote(true);
    try {
      const newNote = await createNote(UNTITLED_NOTE_TITLE, '', folder.id);
      router.push(`${ROUTES.app}?noteId=${newNote.id}&mode=edit`);
    } catch (error) {
      if (!isMountedRef.current) return;
      console.error('Failed to create note:', error);
      toast({
        title: t('toast.error'),
        description: error instanceof Error ? error.message : t('folders.createNoteFailed'),
        variant: 'destructive',
      });
    } finally {
      if (isMountedRef.current) {
        setIsCreatingNote(false);
      }
    }
  };

  const handleFolderActivate = () => {
    onToggle(folder.id);
    onSelect?.(folder);
  };

  return (
    <>
      <div ref={setNodeRef} data-testid="droppable-folder">
        <div
          className={clsx(
            "w-full flex items-center gap-2 p-2 rounded-lg transition-colors group relative",
            isOver
              ? "bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white"
              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          )}
        >
          {isRenaming ? (
            <div className="flex min-w-0 flex-1 items-center gap-2 text-left">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 shrink-0" />
              )}
              <FolderIcon className="w-4 h-4 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 min-w-0 rounded border border-slate-200 bg-white px-2 py-0.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                disabled={isSubmitting}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (!isRenaming) {
                  handleFolderActivate();
                }
              }}
              onKeyDown={(event) => {
                if (isRenaming) {
                  return;
                }
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleFolderActivate();
                }
              }}
              className="flex min-w-0 flex-1 items-center gap-2 text-left"
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 shrink-0" />
              )}
              <FolderIcon className="w-4 h-4 shrink-0" />
              <span 
                className="flex-1 min-w-0 text-left truncate select-none transition-all max-w-full group-hover:max-w-folder-action"
                onDoubleClick={(e) => {
                  if (isSubmitting) {
                    return;
                  }
                  e.stopPropagation();
                  setNewName(displayName);
                  setIsRenaming(true);
                }}
              >
                {displayName}
              </span>
            </button>
          )}
          
          {!isRenaming && !isSubmitting && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-500">{noteCount}</span>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                className="rounded p-1 can-hover:opacity-0 transition-opacity hover:bg-slate-200 focus:opacity-100 can-hover:group-hover:opacity-100 can-hover:group-focus-within:opacity-100 dark:hover:bg-slate-700"
                   aria-label={t('folders.folderOptions')}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-32 rounded-md border border-slate-200 bg-white py-1 shadow-lg z-50 flex flex-col text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isSubmitting) {
                          return;
                        }
                        setNewName(displayName);
                        setIsRenaming(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                    >
                      {t('folders.edit')}
                    </button>
                    {!folder.is_default && (
                      <button
                        onClick={handleDeleteClick}
                        disabled={isSubmitting}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:bg-slate-700 dark:hover:text-red-300"
                      >
                        {t('folders.delete')}
                      </button>
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleCreateNote}
                disabled={isCreatingNote}
                className="rounded p-1 can-hover:opacity-0 transition-opacity hover:bg-slate-200 focus:opacity-100 can-hover:group-hover:opacity-100 can-hover:group-focus-within:opacity-100 dark:hover:bg-slate-700"
                aria-label={t('folders.createNoteIn', { folder: displayName })}
                title={t('folders.createNoteIn', { folder: displayName })}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="ml-6 space-y-1">
            {children}
          </div>
        )}
      </div>

      <FolderDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        isDeleting={isDeleting}
        onDeleteKeepNotes={handleDeleteKeepNotes}
        onDeleteAllInit={handleDeleteAllInit}
      />

      <FolderConfirmDeleteAllDialog
        open={showConfirmDeleteAllDialog}
        onOpenChange={setShowConfirmDeleteAllDialog}
        isDeleting={isDeleting}
        onConfirm={handleDeleteAllConfirm}
      />
      {!isActive && (
        <ActivationDialog
          open={showActivationDialog}
          onOpenChange={setShowActivationDialog}
        />
      )}
    </>
  );
}
