# Metadata & Route Architecture Audit (2026-02-09)

## 1. Route Restructuring

We have swapped the application root and landing page to improve the first-time user experience and SEO.

| Page Type | Old Route | New Route | Purpose |
| :--- | :--- | :--- | :--- |
| **Landing Page** | `/home` | `/` (Root) | Marketing, SEO, "What is this app?", Login entry point. |
| **App Interface** | `/` (Root) | `/app` | The actual notes application. Requires authentication. |

### Rationale
- **User Acquisition**: New visitors hitting `spanish-notes.com` (or similar) should see the Landing Page, not a login wall or an empty app state.
- **SEO**: The root domain `/` is the most important for search engines. It should contain indexable content (Landing Page), not an app shell.
- **Clarity**: Separates the "Product" (Landing) from the "Tool" (App).

## 2. Metadata Changes

With the route swap, we updated the `Metadata` configuration in Next.js to reflect the content of each route.

### Global Layout (`src/app/layout.tsx`)
- **Title**: `Spanish Notes App` (Default)
- **Description**: `Learn Spanish with AI-powered interactive notes`
- **Theme Color**: Dynamic (Light/Dark)
- **Icons**: Standard favicon set.

### Landing Page (`src/app/page.tsx`)
- **Inherits**: Global metadata.
- **Title**: Uses default `Spanish Notes App`.
- **Action**: Consider adding specific OpenGraph (OG) tags here for social sharing (e.g., a hero image of the app).

### App Interface (`src/app/app/page.tsx`)
- **New Metadata Added**:
  ```typescript
  export const metadata: Metadata = {
    title: 'My Notes | Spanish Notes',
    description: 'Manage and study your Spanish notes',
  };
  ```
- **Purpose**: When a user is in the app, the browser tab should say "My Notes" or similar, distinguishing it from the marketing site.

## 3. PWA Configuration (`public/manifest.webmanifest`)

### `start_url` Update
- **Old**: `"start_url": "/"`
- **New**: `"start_url": "/app"`

### Implication
- **Install Experience**: When a user installs the app (Add to Home Screen), launching it will now open **directly into the App interface** (`/app`), bypassing the Landing Page.
- **Why**: Installed users are "active users". They don't need to see the marketing landing page every time they open the app. They want to write notes immediately.
- **Auth Handling**:
  - If logged in: They see their notes.
  - If logged out: `AuthGate` or Middleware (future) will redirect them to Login or show the Login modal.
  - *Note*: Currently `AuthGate` handles the check. If we implement a server-side redirect in Middleware later, it will seamlessly send them to `/` (Landing) to log in, then redirect back to `/app`.

## 4. Outstanding Items / Recommendations

1.  **OpenGraph Images**:
    - We should add `opengraph-image.png` to `src/app/` (for Landing) and maybe a different one for `src/app/app/` (though less critical for private app pages).
2.  **Canonical URLs**:
    - Ensure `metadataBase` is set in `layout.tsx` if we want fully correct absolute URLs for SEO.
3.  **Robots.txt**:
    - We might want to disallow `/app` in `robots.txt` to prevent Google from trying to index the private app shell (though Auth usually blocks it, it's good practice).
    - *Current*: No `robots.txt` found in `src/app`.
    - *Action*: Create `src/app/robots.ts`.

## 5. Verification Checklist

- [x] Visit `/` -> Shows Landing Page.
- [x] Visit `/app` -> Shows App (or Login).
- [x] PWA Install -> Icon opens `/app`.
- [x] Browser Tab Title on Landing: "Spanish Notes App".
- [x] Browser Tab Title on App: "My Notes | Spanish Notes".
