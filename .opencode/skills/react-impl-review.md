# React Implementation Review Skill

(user - Skill) Lightweight checklist to apply **during implementation** of React/Next.js changes (not during PR review). Helps prevent obvious mistakes like hardcoded values, edge cases, and state-reset bugs.

## When to Use
- While writing or modifying `.tsx`/`.jsx` code
- Before running tests or creating PRs

## Checklist (Implementation-Time)
1. **Avoid hardcoded values**
   - Extract non-obvious constants (length limits, regex, thresholds) into named constants.
2. **Empty/Null handling**
   - Ensure empty input and null data paths have safe fallbacks.
3. **Edge cases**
   - Think through first-run, deleted entities, and stale selections.
4. **State transitions**
   - Check `useEffect` dependencies to avoid resetting state unexpectedly.
5. **Event logic duplication**
   - Extract repeated event logic into helpers.
6. **Error feedback**
   - Ensure user-visible errors (toast/dialog) exist for failures.

## Output Format
- Briefly confirm checks passed or list issues found.

## Constraints
- Keep changes scoped; no unrelated refactors.
- Do not run heavy skills during PR review.
