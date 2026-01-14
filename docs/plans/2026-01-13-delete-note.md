# Delete Note Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Allow users to permanently delete a note from the application.

**Architecture:** 
- **Frontend:** Add a "Delete" button to the editor toolbar.
- **Logic:** Javascript function triggers Supabase deletion, updates local state, and refreshes UI.
- **Safety:** Browser native `confirm()` dialog to prevent accidental deletion.

**Tech Stack:** Vanilla JS, HTML, CSS, Supabase JS Client.

### Task 1: Add Delete Button UI

**Files:**
- Modify: `index.html` (Add button to `.editor-header` or toolbar)
- Modify: `style.css` (Style the button as "danger" - red/hover effect)

**Step 1: Update HTML**
Add `<button id="deleteNoteBtn" class="btn btn-danger" title="Delete Note">🗑️</button>` to the editor header.

**Step 2: Update CSS**
Add `.btn-danger` class in `style.css` with red color scheme (`#ef4444`) and hover effects.

### Task 2: Implement Delete Logic

**Files:**
- Modify: `script.js`

**Step 1: Select Element**
const deleteNoteBtn = document.getElementById('deleteNoteBtn');

**Step 2: Implement Function**
Create `async function deleteCurrentNote()`:
1. Check `currentNoteId`.
2. `confirm('Are you sure you want to delete this note?')`.
3. `supabaseClient.from('notes').delete().eq('id', currentNoteId)`.
4. Handle error/success.
5. On success:
   - Clear `currentNoteId`
   - Reload list (`loadNotesList()`)
   - Reset editor (title/content) or select next note.

**Step 3: Bind Event**
`deleteNoteBtn.addEventListener('click', deleteCurrentNote);`

### Task 3: Manual Verification

**Step 1: Run App**
Open `index.html`.

**Step 2: Test Deletion**
1. Create a "Test Note".
2. Click Delete button.
3. Cancel confirm dialog -> Note should stay.
4. Click Delete again -> OK.
5. Note should vanish from sidebar.
6. Editor should clear or switch to another note.
