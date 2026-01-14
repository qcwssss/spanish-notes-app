# Auto Gemini Review Workflow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Automatically trigger Gemini Code Review by commenting `/gemini review` on every new Pull Request using GitHub Actions.

**Architecture:**
- **GitHub Action:** Creates a workflow `.github/workflows/auto-review.yml` that listens for `pull_request` -> `opened`.
- **Logic:** Uses `gh` CLI or a standard action to post a comment on the PR.
- **Permissions:** Requires `pull-requests: write` permission for the `GITHUB_TOKEN`.

**Tech Stack:** GitHub Actions (YAML).

### Task 1: Create GitHub Action Workflow

**Files:**
- Create: `.github/workflows/auto-review.yml`

**Step 1: Create Workflow File**
Create the workflow file that triggers on PR creation and posts the comment.

```yaml
name: Auto Trigger Gemini Review

on:
  pull_request:
    types: [opened]

permissions:
  pull-requests: write

jobs:
  trigger-review:
    runs-on: ubuntu-latest
    steps:
      - name: Comment /gemini review
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '/gemini review'
            })
```

**Step 2: Commit**
```bash
git add .github/workflows/auto-review.yml
git commit -m "ci: add auto gemini review workflow"
```

### Task 2: Verification (Manual)

**Files:**
- None

**Step 1: Push and Verify**
This task is manual verification after push.
1. Push changes to `main` (or feature branch).
2. Create a dummy PR.
3. Verify the bot comments `/gemini review`.

(Note: Since I cannot create a dummy PR easily in this flow without polluting the repo, the code review of the YAML file is the primary verification).
