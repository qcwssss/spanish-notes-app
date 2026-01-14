export interface Note {
  id: string;
  user_id?: string; // Optional for now as we might not fetch it in list view
  title: string;
  content?: string; // Optional in list view
  created_at?: string;
  updated_at: string;
}
