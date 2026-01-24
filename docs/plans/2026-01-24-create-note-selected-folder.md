# Create Note In Selected Folder Plan

**Date:** 2026-01-24
**Status:** Done

## Goal
Match Apple Notes behavior: new notes are created in the **currently selected** folder. If no folder is selected, default to the user’s default folder.

## UX Behavior
- Clicking a folder sets it as the **current target** for new notes.
- The global create button text becomes: `New note in {Folder Name}`.
- Clicking the button creates the note inside that folder.
- If no folder is selected, create in the default folder.
- No persistence across page reloads (session-only).

## Copy
- Button label: `New note in {Folder Name}`
- Fallback label (no selection): `New note in My Notes` (resolved by default folder name)

## Data Flow
1. User selects folder → store `selectedFolderId` + `selectedFolderName` in client state.
2. Create button calls `createNote` with `folder_id = selectedFolderId`.
3. If `selectedFolderId` is missing, fetch `getDefaultFolder()` and use its id.

## Implementation Steps
### 1) Add selected folder state
- In `FolderList` (or parent that owns folder selection), add state:
  - `selectedFolderId: string | null`
  - `selectedFolderName: string | null`
- When user clicks a folder row, set both.

### 2) Wire selection into CreateNoteButton
- Update `CreateNoteButton` props to accept:
  - `targetFolderId: string | null`
  - `targetFolderName: string | null`
- Button label uses name:
  - `New note in ${targetFolderName ?? defaultFolderName}`
- Create action uses `targetFolderId ?? defaultFolderId`.

### 3) Resolve default folder
- Use existing server utility `getDefaultFolder()`.
- Ensure the default folder name is available for label fallback.

### 4) Update createNote call
- Ensure `createNote` supports `folder_id` input (or add optional param if missing).
- Pass `folder_id` from target selection.

## Files Likely Affected
- `src/components/FolderList.tsx` (store selection + emit selection changes)
- `src/components/CreateNoteButton.tsx` (label + folder_id logic)
- `src/app/page.tsx` or container wiring (pass selection to button)
- `src/utils/notes/queries.ts` (ensure `createNote` accepts folder_id)
- tests in `tests/components/` (update button label + create note behavior)

## Tests
- Update/Create tests to cover:
  1) Label changes when a folder is selected.
  2) `createNote` called with selected folder id.
  3) Fallback to default folder when no selection.

## Open Questions
- Where should selected folder state live? (FolderList vs. parent page)
- Do we show the selected folder visually (highlight)?

## Definition of Done
- New note button reflects selected folder.
- Notes are created under selected folder.
- Default folder is used when nothing selected.
- Tests updated and passing.
