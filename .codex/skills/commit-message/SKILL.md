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
4. Always return the final recommended message inside one fenced `text` code block so it is easy to copy and paste directly into git or another tool.
5. Do not wrap the commit message in extra prose, markdown bullets outside the code block, or numbered alternatives unless the user explicitly asks for multiple options.
6. Choose `type` from: `feat`, `fix`, `refactor`, `style`, `chore`, `docs`, `test`.
7. Pick the narrowest useful scope (for example `settings`, `payments`, `mobile-ui`, `backend`).
8. Avoid vague words like "update stuff", "changes", "improve code".
9. Ensure bullets match actual diffs and do not mention work that is not in the current tree.
10. If unrelated file groups exist, propose split commit messages by group and put each proposal in its own fenced `text` code block.
