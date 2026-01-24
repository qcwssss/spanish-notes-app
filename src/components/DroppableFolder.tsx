'use client';

import { useDroppable } from '@dnd-kit/core';
import { ChevronDown, ChevronRight, Folder as FolderIcon, MoreVertical } from 'lucide-react';
import { Folder } from '@/types/folder';
import { clsx } from 'clsx';
import { useState, useRef, useEffect } from 'react';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { useToast } from '@/components/ToastProvider';
import * as Dialog from '@radix-ui/react-dialog';
import { deleteFolderAndMoveNotes, deleteFolderAndNotes } from '@/utils/folders/actions';
import { getDefaultFolder } from '@/utils/folders/queries';

interface DroppableFolderProps {
  folder: Folder;
  isExpanded: boolean;
  onToggle: (folderId: string) => void;
  onSelect?: (folder: Folder) => void;
  onRename: (folderId: string, newName: string) => Promise<void>;
  noteCount: number;
  children: React.ReactNode;
}

export default function DroppableFolder({
  folder,
  isExpanded,
  onToggle,
  onSelect,
  onRename,
  noteCount,
  children
}: DroppableFolderProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: folder.id,
    data: {
      type: 'folder',
      folder,
    },
  });

  const [isRenaming, setIsRenaming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to rename folder',
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
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete folder',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteKeepNotes = () => handleDeleteApiCall(async () => {
    const defaultFolder = await getDefaultFolder();
    if (!defaultFolder) {
      throw new Error('Default folder not found');
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
            isOver ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
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
                className="flex-1 bg-slate-900 text-white px-2 py-0.5 rounded border border-slate-600 focus:border-blue-500 outline-none text-sm min-w-0"
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
                className="flex-1 text-left truncate select-none"
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
              <span className="text-xs text-slate-500">{noteCount}</span>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1 hover:bg-slate-700 rounded opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                  aria-label="Folder options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-50 py-1 flex flex-col">
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
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                      Edit
                    </button>
                    {!folder.is_default && (
                      <button
                        onClick={handleDeleteClick}
                        disabled={isSubmitting}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="ml-6 space-y-1">
            {children}
          </div>
        )}
      </div>

      <Dialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md z-50 shadow-xl focus:outline-none"
          >
            <Dialog.Title className="text-xl font-bold text-slate-100 mb-4">
              Delete folder
            </Dialog.Title>
            
            <div className="space-y-3">
              <button
                onClick={handleDeleteKeepNotes}
                disabled={isDeleting}
                className="w-full flex flex-col items-start p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors text-left"
              >
                <span className="text-slate-200 font-medium">Delete folder (keep notes)</span>
                <span className="text-slate-400 text-sm mt-1">Notes will move to your default folder.</span>
              </button>

              <button
                onClick={handleDeleteAllInit}
                disabled={isDeleting}
                className="w-full p-4 bg-red-900/20 hover:bg-red-900/30 border border-red-900/50 hover:border-red-800 rounded-lg transition-colors text-red-400 font-medium text-left"
              >
                Delete folder and all notes
              </button>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={showConfirmDeleteAllDialog} onOpenChange={setShowConfirmDeleteAllDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md z-50 shadow-xl focus:outline-none">
            <Dialog.Title className="text-xl font-bold text-slate-100 mb-2">
              Delete folder and notes?
            </Dialog.Title>
            
            <Dialog.Description className="text-slate-300 mb-6">
              This will permanently delete all notes in this folder.
            </Dialog.Description>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDeleteAllDialog(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllConfirm}
                disabled={isDeleting}
                className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
