---
name: commit-message
description: Generate a clear, accurate git commit message for the current staged or working-tree changes. Use when the user asks for a commit message, asks to improve wording, or wants a concise summary of what changed.
---

# Commit Message

1. Inspect repository state with `git status --short` and `git diff --name-only` (or `git diff --cached --name-only` when staged changes exist).
2. Read enough of the diff to understand behavior changes, not just filenames.
3. Write one recommended commit message in imperative mood using this format:
   - First line: `<type>(<scope>): <summary>` (max ~72 chars)
   - Blank line
   - 2-5 bullet points describing concrete changes
4. Choose `type` from: `feat`, `fix`, `refactor`, `style`, `chore`, `docs`, `test`.
5. Pick the narrowest useful scope (for example `settings`, `payments`, `mobile-ui`, `backend`).
6. Avoid vague words like "update stuff", "changes", "improve code".
7. Ensure bullets match actual diffs and do not mention work that is not in the current tree.
8. If unrelated file groups exist, propose split commit messages by group and label them clearly.
