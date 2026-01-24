# Git Ship Skill

(user - Skill) Automates the standard git workflow for finishing a task: staging all tracked changes, composing a quality commit, pushing the branch, and creating a GitHub PR.

## When to Use
- After implementing a feature or fix that is ready for review.
- When the current work tree is clean aside from the intended changes.
- When the user explicitly wants you to "git push/create PR" or when the skill matches the workflow (e.g., "create PR", "commit and push").

## Checklist
1. **Status check**: run `git status --short` to confirm there are staged/unstaged files and no unrelated modifications.
2. **Review diff**: inspect `git diff` (and `git diff --cached` if needed) for accuracy before committing.
3. **Commit**: stage the files (or rely on `git add .` from the skill) and commit with a descriptive message following the `type: description` format (e.g., `feat: add create-in-folder target`).
4. **Push**: push the branch to the remote with `git push -u origin <branch>`.
5. **Create PR**: use `gh pr create` with:
   - Title matching the commit (or a concise variant).
   - Body containing `## Summary` with 2-3 bullets and `## Notes` for reminders.
6. **Report PR URL**: include the PR link in your completion message for easy access.

## Constraints
- Never run `git push --force` or override hooks.
- Do not stage files unrelated to the task.
- If the branch already exists remotely, skip the `-u` flag when pushing.
- If the project has untracked directories that should not be committed, explicitly exclude them before running the skill.

## Example Invocation
> "Use the git-ship skill to push and PR the feature branch once the code is done."