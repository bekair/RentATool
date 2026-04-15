---
name: commit-message
description: Generate a clear, accurate git commit message for the current staged or working-tree changes. Use when the user asks for a commit message, wants help wording a commit, or wants a concise summary of what changed. Trigger whenever the user says things like "write a commit message", "commit this", "what should my commit say", or asks to summarize recent changes for git.
---

# Commit Message

1. Inspect the repository state: run `git status --short` and `git diff --cached --name-only` (staged) or `git diff --name-only` (unstaged) to see what changed.
2. Read enough of the actual diff to understand *behavior* changes — not just which files changed, but what the code now does differently.
3. Write one recommended commit message in imperative mood using this format:
   - First line: `<type>(<scope>): <summary>` — max ~72 characters
   - Blank line
   - 2–4 short bullet points describing the most important concrete changes
   - Keep the whole message compact: usually 3–6 total lines
4. Return the final message inside a single fenced `text` code block so it's easy to copy straight into git.
5. Do not add extra prose, extra bullet lists outside the code block, or numbered alternatives unless the user explicitly asks for multiple options.

## Type and scope

Choose `type` from: `feat`, `fix`, `refactor`, `style`, `chore`, `docs`, `test`

Pick the narrowest useful scope — for example `settings`, `payments`, `mobile-ui`, `backend`, `auth`.

## Quality rules

- Avoid vague words like "update stuff", "changes", "improve code", "misc fixes".
- Prefer shorter, clearer wording over exhaustive detail — don't restate filenames unless it genuinely helps.
- Every bullet must reflect something actually in the diff. Don't mention work that isn't in the current tree.

## Split commits

If the staged/unstaged files clearly belong to unrelated concerns, propose a split: one fenced `text` block per logical commit group, each with its own message.
