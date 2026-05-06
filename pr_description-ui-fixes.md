## Description
This PR addresses several UI and interaction issues present in the mobile view, specifically resolving the overlap between the mobile sidebar toggle button and the main content headers, and fixing the `z-index` layering of the note deletion dialogs.

## Key Changes
- **Mobile Sidebar Toggle Repositioned**: Moved the floating Sidebar toggle button on mobile from the top-left to the top-right corner (`right-4`). This effectively leverages the natural whitespace on the right and prevents the button from obscuring document titles and critical reading start points.
- **Removed Unnecessary Padding Workarounds**: Reverted the hardcoded `pl-14` left-padding applied across the `main` container in App and Favorites pages, which skewed the entire layout horizontally.
- **Dialog Overlay Z-Index Fix**: Explicitly added `z-50` to the `Dialog.Content` nodes for the deletion sequence inside `DraggableNote` and `DroppableFolder`. This resolves a severe bug where the content box inadvertently rendered beneath the `Dialog.Overlay`, rendering the delete confirmation buttons unclickable.
- **Minor FavoritesView Margin Fix**: Added a slight `padding-right` to the `FavoritesView` header specifically on mobile to ensure the relocated toggle button does not overlay the Sort button.

## How to Test
1. Make sure to open the application in a mobile viewport (e.g. Chrome DevTools Responsive view).
2. Look at the title of any note; ensure it is aligned to the left properly without being covered by any button.
3. Observe that the Sidebar toggle button is located on the top right.
4. Try to click the delete icon on a Note/Folder in the sidebar to open the delete confirmation dialog, and verify that the "Delete" and "Cancel" buttons are perfectly clickable.
