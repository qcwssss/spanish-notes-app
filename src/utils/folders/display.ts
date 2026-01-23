import { Folder } from '@/types/folder';

export function shouldShowHierarchy(folders: Folder[]): boolean {
  const realFolders = folders.filter(f => !f.is_default);
  return realFolders.length > 0;
}
