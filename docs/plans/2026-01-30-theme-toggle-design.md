# Theme Toggle (Manual Dark/Light) Design

## TL;DR
Add a manual dark/light toggle that is independent of system preference. Store the choice in localStorage, apply it on app load, and place the toggle button at the bottom of the sidebar. Step 1 focuses only on the sidebar and main content area for a "minimum viable" light mode.

---

## Goal
- Provide a manual theme toggle with two explicit options: dark or light
- Do NOT follow system preference
- Persist user choice across reloads
- Avoid noticeable flicker on initial load

## Scope
### Step 1 (Minimum viable)
- Cover the sidebar and main content area only
- Ensure readability and basic contrast in light mode
- Do not refactor all secondary pages or dialogs

### Step 2 (Full polish, later)
- Extend to settings pages, dialogs, secondary panels, lists, and buttons
- Introduce a unified light theme palette (hover, borders, surfaces, text)

## Design Decisions
- Toggle lives at the bottom of the sidebar (global, non-invasive, consistent access)
- Use `dark` class on the document root for theme switching
- Store theme in localStorage (key: `app-theme`, values: `dark` | `light`)
- Default to `dark` if no stored preference

## Implementation Strategy (Step 1)
### Theme Storage and Initialization
- On first load, read `localStorage.getItem('app-theme')`
- Apply `document.documentElement.classList.toggle('dark', theme === 'dark')`
- Inject a small inline script in `layout.tsx` to set the class before the app renders

### Toggle Interaction
- Single button toggles between `dark` and `light`
- Button shows current state with icon (sun/moon), and has `aria-label` + `title`
- Place inside sidebar bottom area near user info

### Styling Approach
- Convert hardcoded dark classes to `dark:` variants where needed
- Keep light mode minimal: readable background, text, and primary actions
- Avoid changing layout or behavior

## Expected File Touchpoints
- `src/app/layout.tsx`: theme initialization script
- `src/app/globals.css`: ensure Tailwind `dark` variant (v4 custom variant if needed)
- `src/components/Sidebar.tsx`: add toggle button + theme-aware classes
- `src/app/page.tsx`: light mode for main content area

## Risks
- Existing hardcoded dark styles may cause low contrast in light mode
- If initialization is delayed, a 1-frame theme flash may occur
- Sidebar toggle is unavailable while sidebar is collapsed (acceptable for Step 1)

## Verification (Step 1)
- Reload keeps the chosen theme
- Sidebar and main content are readable in light mode
- Toggle is discoverable and responsive
