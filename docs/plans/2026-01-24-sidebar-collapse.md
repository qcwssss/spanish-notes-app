# Sidebar Collapse Feature Plan

**Date:** 2026-01-24
**Status:** Done

## Goal
Implement a collapsible sidebar similar to Notion.
- **Collapsed state**: Sidebar is hidden; a floating "menu" button appears in the top-left to expand it.
- **Expanded state**: Normal sidebar; contains a button to collapse it.
- **Persistence**: Remember state across reloads using `localStorage`.

## User Experience
1. **Default**: Expanded.
2. **Collapse**: User clicks a "<<" icon (or similar) in the sidebar. Sidebar disappears. Main content expands to fill space.
3. **Expand**: A "Hamburger" or ">>" icon appears floating in the top-left of the content area. Clicking it brings back the sidebar.
4. **Transition**: Smooth width transition.

## Technical Implementation

### State Management
- **Component**: `Sidebar.tsx` (it can manage its own width/visibility to keep `page.tsx` clean, or `page.tsx` can manage it if layout structure requires).
- **Persistence**: `localStorage.getItem('sidebar-collapsed')`.

### Component Changes
**`src/components/Sidebar.tsx`**
- Add `isCollapsed` state.
- Effect to sync with `localStorage`.
- Render logic:
    - If `isCollapsed`: Render a fixed/absolute trigger button. Return minimal DOM.
    - If `!isCollapsed`: Render the full `<aside>`. Add a collapse button (e.g., in the header next to "My Notes").

### Layout & Styling
- Use Tailwind CSS.
- **Expanded**: `w-64 translate-x-0`
- **Collapsed**: `w-0 -translate-x-full` (or just `hidden` if we don't need animation yet, but animation is nicer).
- **Floating Button**: `fixed top-4 left-4 z-50` (or similar).

### React Best Practices (Skill Application)
- **`client-localstorage-schema`**: Use a consistent key `app-sidebar-state`.
- **`rendering-content-visibility`**: Ensure hidden content doesn't affect layout performance.
- **`rerender-move-effect-to-event`**: We can update localStorage in the toggle handler, not just a `useEffect`.

## Steps
1. Create plan (this file).
2. Modify `Sidebar.tsx` to add state and toggle logic.
3. Add icons (Lucide `PanelLeftClose`, `PanelLeftOpen` or `Menu`).
4. Implement persistence.
5. Verify with `react-impl-review`.

## Test Plan
- Manual verification: Toggle, reload page, check persistence.
- Check layout responsiveness.
