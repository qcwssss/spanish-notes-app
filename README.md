**English Version** | [中文版本](./README_zh.md)

---

# Note Lingo

**Note Lingo** is a smart note-taking application designed for language learners. While originally built with Spanish in mind, it **supports any language compatible with your browser's Text-to-Speech (TTS) engine**. It integrates Markdown rendering, interactive Point-and-Read, and multilingual TTS capabilities, helping users intuitively learn pronunciation and grammar while reading and taking notes.

## 1. Project Introduction

Built with Next.js (App Router), this application uses Supabase for authentication and data storage, and is deployed on Cloudflare Pages. Its core highlight is **Interactive Text Processing**—automatically identifying target language phrases in notes and converting them into clickable interactive elements that trigger high-quality speech synthesis.

Depending on your browser (Chrome, Safari, Edge, etc.), it can support dozens of languages out of the box.

## 2. Completed Features

- **Authentication & User System**:
  - Integrated Google OAuth login.
  - User profile management (Target Language selection).
  - Storage quota tracking.
  - Activation code system (Activation Dialog).

- **Note Management**:
  - Full CRUD functionality (Create, Read, Update, Delete).
  - Folder organization (Create / Rename / Delete).
  - Drag-and-drop notes into folders.
  - Folder renaming (Double-click or via menu).
  - Favorites view with sortable list (Newest/Oldest).
  - Responsive sidebar and editing interface.
  - **Note Sharing**: Share notes via public links for read-only access.
    - Try it: [https://spanish-notes-app.vercel.app/share/6ed572b32dfc481f8eceefac771fc2f81bd08712989d4658910ffc7b19f6950b](https://spanish-notes-app.vercel.app/share/6ed572b32dfc481f8eceefac771fc2f81bd08712989d4658910ffc7b19f6950b)

- **Core Interactive Features**:
  - **Interactive Markdown Rendering**: Rewrote Markdown components to recursively parse block-level elements like paragraphs, lists, and headers, implementing word/sentence-level interactivity.
  - **Smart Text Segmentation**: Dynamically builds regex matching patterns based on character sets (Alphabets) to separate target language phrases from explanations.
  - **Browser-Native TTS (Point-and-Read)**:
    - **Universal Support**: Levarges the Web Speech API to support any language installed in your browser/OS (e.g., Spanish, French, German, English, Portuguese, Italian, Dutch, Japanese, Chinese, etc.).
    - **Smart Voice Selection**: Automatically prioritizes high-quality local voices provided by the system.
    - **Interactive Reading**: Click to pronounce, automatically cancelling current playback and switching to new content.

- **Engineering**:
  - **Testing Suite**: Unit and component tests using Vitest + React Testing Library.
  - **Directory Refactoring**: Established a clear project structure, moving test files to a standalone `tests/` directory.
  - **Automated Deployment**: CI/CD via Cloudflare Pages.

## 3. Technical Implementation Details

### Interactive Rendering Flow (`MarkdownRenderer.tsx`)
The application recursively traverses the React element tree, replacing all string nodes with the `TextSplitter` component. This approach supports not just plain text, but also handles identifying text nested within bold, italic, or links, ensuring interactivity is everywhere.

### Language-Aware Segmentation (`segmenter.ts` & `extractor.ts`)
Segmentation logic is "language-based":
1. **Dynamic Regex Generation**: Retrieves corresponding alphabet ranges from `extractor.ts` based on the user's target language setting.
2. **Phrase Capture**: Regular expressions capture coherent target language phrases (including punctuation, hyphens, and ellipses), while preserving translations or annotations in parentheses as normal text.

### Multilingual TTS Engine (`useTTS.ts`)
A custom Hook encapsulating the browser's `speechSynthesis` API:
- **Text Cleaning**: Removes non-language interference characters (like meta-comments) via `extractTargetText` before sending to the TTS engine.
- **Persistence**: Automatically remembers the user's preferred voice for each language.

## 4. Current Development Status

- **Current Branch**: `master`
- **Recent Updates**:
  - Folder system completed and live.
  - Support for dragging notes into folders.
  - Folder support for inline renaming (double-click or menu).
  - Folder deletion with confirmation dialog.
  - Favorites view with sidebar switch and sortable list.
  - Deployment URL: [https://note-lingo-app.pages.dev](https://note-lingo-app.pages.dev)

## 5. Roadmap

- [x] **Favorites View**: View for bookmarked notes.
- [ ] **Expanded Language Support**: Add definitions for more languages (Asian languages, Cyrillic, etc.) in `extractor.ts`.
- [ ] **Offline Support**: Explore PWA possibilities for offline note reading.

## 6. Workflow

This project follows a standardized engineering workflow to ensure code quality and reduce low-level errors:
- **Implementation Phase**: Run `react-impl-review` skill when modifying `.tsx` code.
- **Review Phase**: Run `pr-code-review` skill before creating a PR.
- **Release Phase**: Use `git-ship` skill to automate commit, push, and PR creation.

For detailed instructions, see [Workflow Convention](docs/WORKFLOW.md).

## 7. Development Setup

```bash
npm install
npm run dev
```

Run tests:
```bash
npm test
```

---
*Last updated: 2026-01-30*
