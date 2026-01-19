# Fix Plan: PR #8 Feedback (Markdown TTS & Tests)

**Goal:** Address code review feedback on Pull Request #8 to ensure correctness, scalability, and maintainability before merging.

## 1. High Priority: Fix Language Extractor
**Issue:** `extractTargetText` currently strips apostrophes (`'`) and right single quotes (`’`). This corrupts words in French (`l'arbre` -> `larbre`) and English (`it's` -> `its`), leading to incorrect TTS pronunciation.
**Fix:**
- Update `src/utils/language/extractor.ts` to **preserve** these characters instead of replacing them.
- Add `['’]` to the regex character sets for all relevant languages.
- Update `src/utils/language/extractor.test.ts` to include test cases with apostrophes (e.g., "l'arbre").

## 2. Medium Priority: Dynamic Voice Fallback
**Issue:** `useTTS.ts` hardcodes a preference for `es-MX` voices. This logic will fail to select appropriate regional voices when the target language is not Spanish (e.g., it might look for `fr-MX` which doesn't exist).
**Fix:**
- In `src/hooks/useTTS.ts`, remove the hardcoded `es-MX` string.
- Use the existing `LANGUAGE_FALLBACK` map (e.g., `es: 'es-MX'`, `fr: 'fr-FR'`) to determine the preferred dialect suffix dynamically based on `targetLanguage`.

## 3. Medium Priority: Refactor MarkdownRenderer
**Issue:** `MarkdownRenderer.tsx` repeats the `createClickableComponent` call for every HTML tag (`p`, `li`, `h1`-`h6`, etc.), creating unnecessary boilerplate.
**Fix:**
- Define a configuration object mapping tags to their Tailwind classes.
- Use `Object.entries().map()` to generate the `components` object programmatically.
- This reduces code size and makes it easier to add new tags later.

## 4. Housekeeping: Fix Plan Documentation
**Issue:** `task_plan.md` contains duplicate sections for Phase 2, 3, and 4 due to merge conflicts.
**Fix:**
- Edit `task_plan.md` to remove the duplicate/conflicting sections and ensure the status reflects "Phase 5 (Delivery)".

## Execution Order
1. **Extractor Fix**: Modify code & update tests -> Verify tests pass.
2. **TTS Fix**: Update hook logic -> Verify behavior.
3. **Renderer Refactor**: Refactor code -> Verify no visual regression.
4. **Docs**: Clean up `task_plan.md`.
5. **Commit**: Push all fixes to `feature/markdown-tts`.
