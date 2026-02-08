---
name: pr-autopilot
description: Use when a branch is ready and you want one-command style workflow for commit, push, PR creation, and iterative PR comment triage/fix loops.
---

# PR Autopilot

## Overview

Use this skill after feature work is complete to run a consistent ship loop:

1. Verify locally
2. Commit + push
3. Create PR
4. Monitor review comments
5. Judge comment validity
6. Apply valid fixes
7. Push and repeat until clean

This skill is optimized for speed and review quality while keeping git safety.

---

## Guardrails

- Never force push unless explicitly requested.
- Never use destructive git commands.
- Never commit secrets.
- Always run local verification before creating/updating PR.
- For AI review comments, evaluate technically before implementing.

---

## Inputs

- Base branch: `master` (or `main` if repo uses it)
- Current feature branch name
- PR title/summary intent

Optional:
- Preferred reviewer label (`/gemini review` trigger)

---

## Phase 1: Preflight (must pass)

Run:

```bash
npm run build
npm test -- --run
```

If Cloudflare Pages is relevant:

```bash
npm run pages:build
```

If any command fails: stop, fix, re-run.

---

## Phase 2: Commit + Push

```bash
git status --short
git add -A
git commit -m "<type(scope): message>"
git push -u origin <branch>
```

Commit style:
- `feat(...)` for new capability
- `fix(...)` for bug fix
- `refactor(...)` for non-behavior cleanup
- `docs(...)` for documentation only

---

## Phase 3: Create PR

```bash
gh pr create --base master --head <branch> --title "<title>" --body "$(cat <<'EOF'
## Summary
- <bullet 1>
- <bullet 2>

## Validation
- `npm run build`
- `npm test -- --run`
EOF
)"
```

If PR already exists, skip creation and continue with monitoring.

---

## Phase 4: Monitor PR Feedback

Fetch review comments and timeline comments:

```bash
gh pr view <pr-number> --comments
gh api repos/<owner>/<repo>/pulls/<pr-number>/comments
```

Classify each item:

- `valid` -> implement
- `invalid for this repo` -> explain briefly in thread
- `unclear` -> ask targeted clarification

Severity handling:
- High/Critical: fix first
- Medium: fix next
- Low/Nit: batch if worthwhile

---

## Phase 5: Fix Loop

For each valid item:

1. Implement minimal safe change
2. Re-run verification (`build`, `test`, and `pages:build` if needed)
3. Commit with focused message
4. Push

Example:

```bash
git add -A
git commit -m "fix(review): address <short-topic>"
git push
```

Then optionally retrigger AI review:

```bash
gh pr comment <pr-number> --body "/gemini review"
```

Repeat until no actionable comments remain.

---

## Comment Validity Rules (important)

When a comment conflicts with observed repo behavior (e.g., build typing constraints):

1. Reproduce locally
2. Prefer reproducible correctness over generic convention
3. Reply with concise technical reason

Do not blindly implement suggestions that break build/tests.

---

## Done Criteria

- PR open and up-to-date
- CI/build checks passing
- No unresolved high/medium valid comments
- Local `build` and `test` passing on latest commit

---

## Quick Run Card

```text
1) verify: build + test (+ pages:build)
2) commit + push
3) create/open PR
4) fetch comments
5) judge validity
6) fix valid items
7) verify + push
8) repeat until clean
```
