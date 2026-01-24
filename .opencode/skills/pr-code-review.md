# PR Code Review Skill

(user - Skill) Pre-PR review checklist to catch obvious issues (magic numbers, edge cases, empty state handling, logic pitfalls) before shipping.

## When to Use
- Before `git ship` / creating a PR
- After any user-facing behavior change
- After touching React/Next.js components, server actions, or database logic

## Core Checklist (Must Run)
1. **Magic numbers / hardcoded strings**
   - Identify non-obvious constants (e.g., `60`, `3000`, regex flags) and extract to named constants.
2. **Empty / null / undefined paths**
   - Ensure safe fallbacks for empty strings, null returns, and missing props.
3. **Edge cases & invariants**
   - Verify behavior for empty input, deleted entities, or stale selections.
4. **State transitions**
   - Check effects for stale dependencies or unintended resets.
5. **Error handling**
   - Confirm user-visible feedback exists; avoid silent failures.
6. **Duplicate logic**
   - Refactor repeated blocks into helpers.
7. **Data correctness**
   - Confirm DB constraints are honored and fallback values align with defaults.

## React/Next.js Add-On Checks
- Derived state should not be recalculated in effects unless necessary.
- Event handlers should avoid duplicate logic.
- Ensure `useEffect` deps do not reset state unexpectedly.
- Keep UI labels and actions consistent with data source.

## Tooling Steps
- Run `lsp_diagnostics` on modified files.
- Review `git diff` for missed edge cases.
- If tests exist near the change, run targeted tests.

## Output Format
Provide a short summary:
- **Issues**: bullet list of blockers or warnings
- **Suggestions**: optional improvements
- **Decision**: “Safe to ship” or “Needs fixes”

## Constraints
- Do not introduce new dependencies just for review fixes.
- Avoid refactors unrelated to the PR scope.
- Do not invoke heavyweight skills during review; use React best-practices while coding instead.
