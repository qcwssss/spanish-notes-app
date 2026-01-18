# Task Plan: Migrate Tests to tests/ Directory

## Goal
Move all test files from `src/**` into a dedicated `tests/` directory, update tooling configuration, and keep imports working.

## Current Phase
Phase 3

## Phases

### Phase 1: Requirements & Discovery
- [x] Identify current test file locations
- [x] Identify Vitest/Vite config include patterns
- [x] Document findings in findings.md
- **Status:** complete

### Phase 2: Planning & Structure
- [x] Define new test directory layout
- [x] Decide mapping from src path to tests path
- [x] Document decisions with rationale
- **Status:** complete

### Phase 3: Implementation
- [ ] Move test files into tests/ tree
- [ ] Update test config include paths
- [ ] Fix any import paths if needed
- **Status:** in_progress

### Phase 2: Planning & Structure
- [ ] Define new test directory layout
- [ ] Decide mapping from src path to tests path
- [ ] Document decisions with rationale
- **Status:** pending

### Phase 3: Implementation
- [x] Move test files into tests/ tree
- [x] Update test config include paths
- [x] Fix any import paths if needed
- **Status:** complete

### Phase 4: Testing & Verification
- [x] Run targeted tests
- [x] Run full test suite
- **Status:** complete


### Phase 4: Testing & Verification
- [ ] Run targeted tests
- [ ] Run full test suite
- **Status:** pending

### Phase 5: Delivery
- [ ] Update docs if needed
- [ ] Summarize changes and handoff
- **Status:** pending

## Key Questions
1. Which test files exist and how many?
2. What test runner patterns are configured (Vitest include/exclude)?

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Mirror structure under `tests/` | Keeps paths predictable and aligns with src layout |
| Update Vitest include to `tests/**/*.test.{ts,tsx}` | Ensures runner only scans new test location |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Notes
- Keep test paths deterministic: tests/** mirrors src/**.
