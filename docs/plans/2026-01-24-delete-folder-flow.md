# Delete Folder Flow Plan

**Date:** 2026-01-24
**Status:** Done

## Goal
Add a delete-folder flow with two user choices:
1) **Delete folder (keep notes)** → move notes to the user’s default folder, then delete the folder.
2) **Delete folder and all notes** → require a second confirmation.

## Requirements
- Default folder **cannot** be deleted (use `is_default` and/or default folder id).
- Menu entry should be **Edit** (rename) and **Delete** in the folder menu.
- All copy in **English**.
- If moving notes fails, **do not delete** the folder.
- If delete-all is chosen, require an extra confirmation step.
- Failure should show a toast error.

## UX Copy (Proposed)
**Menu**
- Edit
- Delete

**Primary Dialog**
- Title: `Delete folder`
- Option 1 button: `Delete folder (keep notes)`
- Option 1 helper text: `Notes will move to your default folder.`
- Option 2 button: `Delete folder and all notes`

**Secondary Confirmation (Option 2 only)**
- Title: `Delete folder and notes?`
- Body: `This will permanently delete all notes in this folder.`
- Buttons: `Cancel` / `Delete`

## Data / Server Actions
Current `deleteFolder` prevents deleting folders with notes. We need two new behaviors.

### RPCs for atomicity (Selected)
Postgres functions ensure **move/delete** happens atomically:
- `move_notes_and_delete_folder(folder_id, default_folder_id)`
- `delete_folder_and_notes(folder_id)`

Advantages:
- Avoid partial success (e.g., notes moved but folder not deleted).
- Guarantees the “all-or-nothing” requirement.

SQL:
- `@supabase/2026-01-24-folder-delete-rpcs.sql`

## UI Changes
### `src/components/DroppableFolder.tsx`
- Replace menu label **Edit folder name** → **Edit**.
- Add **Delete** option in menu.
- When user selects Delete:
  - Open primary dialog with the two choices.
  - If “keep notes” → execute delete+move immediately.
  - If “delete all notes” → open secondary confirmation dialog.

### Dialogs
- Use Radix `Dialog` (already used in `ActivationDialog`) to avoid new dependency.
- Disable actions while `isSubmitting` is true.
- On errors, show toast via `useToast`.

## Default Folder Lookup
- Use `getDefaultFolder()` from `src/utils/folders/queries.ts` to obtain the default folder id.
- This avoids relying on the folder name (user can rename it).

## Testing Plan (Vitest)
**Target file:** `tests/components/folders/DroppableFolder.test.tsx`

Add tests:
1) Renders **Edit** and **Delete** menu items.
2) Clicking **Delete** opens the primary dialog.
3) “Delete folder (keep notes)” triggers delete+move action and closes dialog.
4) “Delete folder and all notes” opens confirmation dialog.
5) Confirming delete-all triggers action.
6) Errors trigger toast and do **not** close dialog (optional UX choice).

Mock server actions:
- `deleteFolderAndMoveNotes`
- `deleteFolderAndNotes`
- `getDefaultFolder` (returns a mock id)

## Implementation Steps
1) Add server-side actions for the two delete flows.
2) Add delete UI and dialogs in `DroppableFolder`.
3) Update menu label to **Edit**.
4) Add tests for dialogs and actions.
5) Run targeted tests: `DroppableFolder.test.tsx`.

## Notes
- RPCs chosen for atomicity.
- Dialogs close on success; errors show toast.

## Definition of Done
- Default folder cannot be deleted.
- Both delete flows work and show correct dialogs.
- Errors show toast and do not cause partial deletes.
- Tests updated and passing.
