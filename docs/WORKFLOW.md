# Workflow Convention

This workflow standardizes how we implement, review, and ship changes to reduce obvious mistakes (hardcoded values, edge cases, and state-reset issues).

## 1) Implementation Phase (React/Next.js)
Trigger: any `.tsx` / `.jsx` change.

- Run **`react-impl-review`** during coding to catch:
  - Magic numbers / hardcoded constants
  - Empty/null handling
  - Edge cases (deleted entities, stale selections)
  - `useEffect` dependency pitfalls
  - Event-handler duplication
  - Missing user-visible error feedback

## 2) Pre‑PR Review Phase
Trigger: before creating a PR.

- Run **`pr-code-review`** to verify:
  - Constants extracted
  - Edge cases and empty paths covered
  - State transitions stable
  - Errors are surfaced to users
  - No duplicated logic left

## 3) Ship Phase
Trigger: after review passes.

- Run **`git-ship`** to:
  - Commit with clean message
  - Push branch
  - Create PR with summary + notes

---

## Commands Summary
- `react-impl-review` — during implementation
- `pr-code-review` — before PR
- `git-ship` — ship and PR
