export interface Note {
  id: string;
  user_id: string;
  folder_id: string;
  is_favorite: boolean;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export type NoteListItem = Pick<Note, 'id' | 'folder_id' | 'is_favorite' | 'title' | 'updated_at'>;
