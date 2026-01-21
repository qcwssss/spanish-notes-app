export interface Note {
  id: string;
  user_id?: string;
  folder_id?: string;
  is_favorite?: boolean;
  title: string;
  content?: string;
  created_at?: string;
  updated_at: string;
}
