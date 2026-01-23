'use client';

import { useDroppable } from '@dnd-kit/core';
import { ChevronDown, ChevronRight, Folder as FolderIcon } from 'lucide-react';
import { Folder } from '@/types/folder';
import { clsx } from 'clsx';

interface DroppableFolderProps {
  folder: Folder;
  isExpanded: boolean;
  onToggle: (folderId: string) => void;
  noteCount: number;
  children: React.ReactNode;
}

export default function DroppableFolder({
  folder,
  isExpanded,
  onToggle,
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

  return (
    <div ref={setNodeRef} data-testid="droppable-folder">
      <button
        onClick={() => onToggle(folder.id)}
        className={clsx(
          "w-full flex items-center gap-2 p-2 rounded-lg transition-colors",
          isOver ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
        )}
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        <FolderIcon className="w-4 h-4" />
        <span className="flex-1 text-left truncate">{folder.name}</span>
        <span className="text-xs text-slate-500">{noteCount}</span>
      </button>

      {isExpanded && (
        <div className="ml-6 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
}
