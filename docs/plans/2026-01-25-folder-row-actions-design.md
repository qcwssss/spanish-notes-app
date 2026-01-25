# Folder Row Actions Design

**Date:** 2026-01-25
**Status:** Done

## Goal
Add Notion-style hover actions to folder rows in the sidebar:
- Show “⋯” (menu) and “＋” (create note) on hover.
- Truncate long folder names on hover to make room for actions.

## UX Behavior
- **Hover**: reveal “⋯” and “＋” on the right side of the folder row.
- **Non-hover**: actions hidden; folder name uses full available width.
- **Truncation**: on hover, folder name uses a fixed max width (truncate with ellipsis).
- **Create**: clicking “＋” creates a note inside that folder.
- **Menu**: clicking “⋯” opens the existing folder menu (rename/delete).

## Layout Details
- Folder row uses `group` to control hover states.
- Folder name:
  - Non-hover: `flex-1` + `truncate`.
  - Hover: apply `max-w-[Npx]` (fixed width) + `truncate`.
- Action buttons:
  - `opacity-0 group-hover:opacity-100` to show on hover only.
  - Right-aligned, compact icon buttons.

## Implementation Notes
- **Component**: `src/components/DroppableFolder.tsx`
  - Add hover action container with two icon buttons.
  - Wire “＋” to create a new note in the folder.
  - Reuse existing menu trigger for “⋯”.
- **Create Note**
  - Use existing createNote action with `folderId`.
  - Keep behavior consistent with top-level create button.

## Success Criteria
- Hover shows “⋯” and “＋” without layout jump.
- Long folder names truncate only on hover.
- Clicking “＋” creates note in that folder.
- Menu still works as before.
