'use client';

import { useDroppable } from '@dnd-kit/core';
import { ChevronDown, ChevronRight, Folder as FolderIcon, MoreVertical } from 'lucide-react';
import { Folder } from '@/types/folder';
import { clsx } from 'clsx';
import { useState, useRef, useEffect } from 'react';

interface DroppableFolderProps {
  folder: Folder;
  isExpanded: boolean;
  onToggle: (folderId: string) => void;
  onRename: (folderId: string, newName: string) => Promise<void>;
  noteCount: number;
  children: React.ReactNode;
}

export default function DroppableFolder({
  folder,
  isExpanded,
  onToggle,
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
  const [displayName, setDisplayName] = useState(folder.name);
  const [newName, setNewName] = useState(folder.name);
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDisplayName(folder.name);
    setNewName(folder.name);
  }, [folder.name]);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRenameSubmit = async () => {
    const trimmedName = newName.trim();

    if (!trimmedName || trimmedName === displayName) {
      setIsRenaming(false);
      setNewName(displayName);
      return;
    }
    
    setIsRenaming(false);
    setDisplayName(trimmedName);
    
    try {
      await onRename(folder.id, trimmedName);
    } catch (error) {
      console.error('Failed to rename folder:', error);
      setDisplayName(folder.name);
      setNewName(folder.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
      setNewName(displayName);
    }
  };

  return (
    <div ref={setNodeRef} data-testid="droppable-folder">
      <div
        className={clsx(
          "w-full flex items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer group relative",
          isOver ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
        )}
        onClick={() => !isRenaming && onToggle(folder.id)}
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 shrink-0" />
        )}
        <FolderIcon className="w-4 h-4 shrink-0" />
        
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-slate-900 text-white px-2 py-0.5 rounded border border-slate-600 focus:border-blue-500 outline-none text-sm min-w-0"
          />
        ) : (
          <span 
            className="flex-1 text-left truncate select-none"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setNewName(displayName);
              setIsRenaming(true);
            }}
          >
            {displayName}
          </span>
        )}
        
        {!isRenaming && (
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
                <div className="absolute right-0 top-full mt-1 w-32 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-50 py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewName(displayName);
                      setIsRenaming(true);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    Edit folder name
                  </button>
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
  );
}
