# pre-push-review
# Use before pushing code to remote, to catch issues that external reviewers (like Gemini) would flag
# Supporting tools and docs are in .opencode/skills/pre-push-review
# ============================================

# Pre-Push Self-Review

## Overview

Catch issues BEFORE pushing. Reduce `/gemini review` cycles from 3-4 rounds to 1.

**Core principle:** Review yourself first, push once, pass review.

## When to Use

- Before `git push`
- After completing a feature/fix
- Before creating a PR

## The 3-Round Self-Review Process

```
Round 1: Verification Gate (automated)
  ↓
Round 2: Code Quality Checklist (manual review)
  ↓
Round 3: Fresh-Eyes Sub-Agent Review
  ↓
PUSH (confident)
```

---

## Round 1: Verification Gate

**Run ALL commands. ALL must pass.**

```bash
# 1. Build check
npm run build

# 2. Lint check  
npm run lint

# 3. Type check
npx tsc --noEmit

# 4. Test (if exists)
npm run test 2>/dev/null || echo "No tests configured"
```

**Gate Rule:**
- ANY failure = STOP and FIX
- Do NOT proceed to Round 2 until all pass

---

## Round 2: Code Quality Checklist

Review your changes against this checklist. Check each item.

### Security

- [ ] No hardcoded secrets, API keys, or credentials
- [ ] No `.env` files or secrets committed
- [ ] No `console.log` with sensitive data
- [ ] Environment variables validated before use

### Next.js Specific

- [ ] No `use client` directive missing for client components
- [ ] No `use server` directive missing for server actions
- [ ] Metadata (title, description) set for new pages
- [ ] Dynamic routes have proper error handling
- [ ] Image components use `next/image` with proper sizing

### TypeScript

- [ ] No `any` types (use proper types or `unknown`)
- [ ] No non-null assertions (`!`) without validation
- [ ] All function parameters have explicit types
- [ ] Return types explicit for public functions

### Supabase

- [ ] Environment variables checked before client creation
- [ ] Error handling for all Supabase calls
- [ ] RLS (Row Level Security) considered for new tables
- [ ] No raw SQL injection vulnerabilities

### Code Quality

- [ ] No commented-out code blocks
- [ ] No TODO comments without issue reference
- [ ] No duplicate code (DRY principle)
- [ ] Consistent naming conventions
- [ ] Files in correct directories

### Documentation

- [ ] New functions have JSDoc comments
- [ ] Complex logic has inline comments
- [ ] README updated if public API changed
- [ ] Plan docs updated if implementation differs

---

## Round 3: Fresh-Eyes Sub-Agent Review

Dispatch a code-reviewer sub-agent for unbiased review.

### Step 1: Get commit range

```bash
BASE_SHA=$(git merge-base HEAD origin/master)
HEAD_SHA=$(git rev-parse HEAD)
echo "Review range: $BASE_SHA..$HEAD_SHA"
```

### Step 2: Dispatch code-reviewer

Use `superpowers:requesting-code-review` skill to dispatch sub-agent.

### Step 3: Act on feedback

| Severity | Action |
|----------|--------|
| Critical | Fix immediately, re-run Round 1 |
| Important | Fix before pushing |
| Minor | Fix now or create TODO with issue |

---

## Quick Reference Card

```
BEFORE PUSH:

1. npm run build     (must pass)
2. npm run lint      (must pass)  
3. npx tsc --noEmit  (must pass)
4. Review checklist  (all checked)
5. Sub-agent review  (no Critical issues)
6. git push          (confident!)
```

---

## Common Issues This Catches

| Issue | Round | How Caught |
|-------|-------|------------|
| Build failures | 1 | `npm run build` |
| Type errors | 1 | `npx tsc --noEmit` |
| Lint errors | 1 | `npm run lint` |
| Hardcoded secrets | 2 | Security checklist |
| Missing `use client` | 2 | Next.js checklist |
| Non-null assertions | 2 | TypeScript checklist |
| Logic errors | 3 | Sub-agent review |
| Missing edge cases | 3 | Sub-agent review |
| Architecture issues | 3 | Sub-agent review |

---

## Anti-Patterns

**Never:**
- Skip Round 1 because "it's a small change"
- Push with unchecked items
- Ignore sub-agent Critical/Important issues
- Push to trigger CI instead of local verification

**If tempted to skip:**
- Remember: 1 thorough review < 4 Gemini review cycles
- Local verification = faster feedback loop

---

## Integration with Gemini Review

After pushing, Gemini will still review. Expected outcomes:

| Self-Review Quality | Gemini Findings |
|---------------------|-----------------|
| All 3 rounds done | 0-2 minor suggestions |
| Skipped Round 3 | 3-5 issues |
| Skipped Round 2 | 5-10 issues |
| Skipped Round 1 | Build/lint failures |

Goal: Gemini finds only **polish suggestions**, not **real issues**.
