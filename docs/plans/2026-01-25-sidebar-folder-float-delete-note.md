# Sidebar Floating Create Folder + Hover Delete Note

**Date:** 2026-01-25
**Status:** Draft

## Goal
- Replace the full-row "Create Folder" entry with a floating icon inside the sidebar.
- Add a hover-only delete icon for notes in the sidebar list.

## UX Behavior
### Create Folder
- Floating `FolderPlus` icon anchored to the bottom-right of the sidebar (inside `<aside>`).
- Does not consume a list row or push content.
- Hidden when sidebar is collapsed.
- Tooltip/title: `Create folder`.

### Delete Note
- Trash icon appears only on hover in the note row.
- Clicking prompts confirm, deletes the note, and routes back to `/`.
- Does not appear just because the note is selected.

## Components & Files
- `src/components/Sidebar.tsx`
  - Remove full-row create folder button.
  - Add floating icon button.
  - Add `relative` to container and `pb-10` to note list to prevent overlap.
- `src/components/DraggableNote.tsx`
  - Add hover-only trash icon.
  - Use `deleteNote` + `router.push('/')` on confirm.
  - Ensure `stopPropagation` to avoid navigation.

## Implementation Steps
1) Update `Sidebar.tsx` layout and add floating folder icon.
2) Update `DraggableNote.tsx` with hover-only delete icon and delete handler.
3) Verify delete flow matches `Editor.tsx` (confirm + delete + route).
4) Run `lsp_diagnostics` on modified files.

## Notes
- Keep delete behavior consistent with existing confirm text.
- Do not add new dependencies.
