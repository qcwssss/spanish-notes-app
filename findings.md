# Findings & Decisions

## Requirements
- Move tests from `src/**` into `tests/` directory.
- Update Vitest config to point to new test locations.
- Preserve imports and module resolution.

## Research Findings
- Found 10 test files under `src/**` (components, hooks, utils, app routes).
- Vitest config located at `vitest.config.ts` with include `src/**/*.test.{ts,tsx}`.
- Plan: mirror tests into `tests/` and switch Vitest include to `tests/**/*.test.{ts,tsx}`.

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
|          |           |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
|       |            |

## Resources
- `vitest.config.*` (to be located)
- `package.json` scripts (to be checked)

## Visual/Browser Findings
- N/A

---
*Update this file after every 2 view/browser/search operations*
