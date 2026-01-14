# Migrate Notes Feature to Next.js

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Migrate core notes functionality from Vanilla JS to Next.js App Router.

**Architecture:** 
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (SSR)
- **State Management:** React Context or simple local state

---

## Pre-requisites

Ensure `.env.local` has valid Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

---

## Task 1: Create Notes Layout (Sidebar + Editor)

**Goal:** Replicate the old app layout with Sidebar (list) and Main (editor).

### Step 1: Create Layout Structure

**Files:**
- Create: `src/app/notes/layout.tsx` (Sidebar + Main layout)
- Create: `src/app/notes/page.tsx` (Main editor area)
- Modify: `src/app/page.tsx` (Redirect to /notes or show login)

### Step 2: Create Sidebar Component

**Files:**
- Create: `src/components/Sidebar.tsx`
- Create: `src/components/NoteList.tsx`

**Features:**
- Fetch notes from Supabase
- Display list of notes (title, preview)
- Active state highlighting
- Search/Filter (optional, later)

### Step 3: Create Editor Component

**Files:**
- Create: `src/components/Editor.tsx`
- Create: `src/components/Toolbar.tsx`

**Features:**
- Title input
- Content textarea (Markdown supported)
- Toolbar with actions (Delete, etc.)

---

## Task 2: Implement Supabase Data Fetching

**Goal:** Connect UI to Supabase database.

### Step 1: Create Notes Table Type Definition

**Files:**
- Create: `src/types/note.ts`

```typescript
export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}
```

### Step 2: Create Notes Utilities

**Files:**
- Create: `src/utils/notes/queries.ts` (fetch, create, update, delete)

```typescript
// fetchNotes(userId)
// createNote(userId, title, content)
// updateNote(id, updates)
// deleteNote(id)
```

---

## Task 3: Integrate with Layout

**Goal:** Make the layout interactive.

### Step 1: Add State Management

Use React `useState` and `useEffect` in `page.tsx`:
- `notes`: Array of notes
- `currentNote`: Selected note
- `isLoading`: Loading state

### Step 2: Wire up Components

- Pass data from `page.tsx` to `Sidebar` and `Editor`
- Handle note selection
- Handle note updates

---

## Task 4: Add Delete Note Feature

**Goal:** Allow users to delete notes safely.

### Step 1: Add Delete Button to Toolbar

**Files:**
- Modify: `src/components/Toolbar.tsx`

Add a delete button with confirmation dialog.

### Step 2: Implement Delete Logic

**Files:**
- Modify: `src/utils/notes/queries.ts` (add deleteNote function)
- Modify: `src/app/notes/page.tsx` (handle delete action)

---

## Task 5: Add Create Note Feature

**Goal:** Allow users to create new notes.

### Step 1: Add "New Note" Button

**Files:**
- Modify: `src/components/Sidebar.tsx`

Add a "+" button to create new note.

### Step 2: Implement Create Logic

**Files:**
- Modify: `src/utils/notes/queries.ts` (add createNote function)
- Modify: `src/app/notes/page.tsx` (handle create action)

---

## Task 6: Add Save/Auto-save

**Goal:** Save notes automatically or on change.

### Step 1: Implement Save Button

**Files:**
- Modify: `src/components/Toolbar.tsx`

Add save button with loading state.

### Step 2: Implement Auto-save (Optional)

Use `useEffect` with debounce to auto-save on content change.

---

## Verification

1. Run `npm run dev`
2. Navigate to `/notes`
3. Verify:
   - [ ] Notes list loads from Supabase
   - [ ] Clicking a note opens it in editor
   - [ ] Creating a new note works
   - [ ] Editing and saving works
   - [ ] Deleting a note works
   - [ ] UI matches old app design (Glassmorphism)
