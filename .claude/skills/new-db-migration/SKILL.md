---
name: new-db-migration
description: Create and validate a new Prisma database migration for the NestJS backend, then prepare the development deployment steps. Use when the user asks for a schema change, Prisma migration, backend build validation, or the dev deployment workflow. Trigger on phrases like "add a migration", "update the schema", "prisma migrate", "new database field", "add column to", or "deploy to Render".
---

# New DB Migration

1. **Understand the request first.** Identify the schema or backend change needed and answer any direct question before touching files.
2. **Make backend changes** — edit `backend/prisma/schema.prisma` and any related service/DTO files as needed.
3. **Check migration commands** — review `backend/package.json` and `migrate_db.bat` to confirm the repo's exact migration workflow before running anything.
4. **Run the migration** from the backend directory:
   ```
   npx prisma migrate dev
   ```
   Working directory: `C:\Users\bcbso\Repos\Own Repos\rent_a_tool\backend`
5. **Format the backend:**
   ```
   npm run format --workspace=backend
   ```
6. **Build the backend** to catch type errors:
   ```
   npm run build --workspace=backend
   ```
7. **Summarize the diff** — check `git diff` and list the files that changed, including the new migration SQL file and any regenerated Prisma client artifacts.
8. **Deployment** — if the user wants to deploy, explain that Render picks up changes automatically on push, or can be triggered manually via the Render dashboard. Only trigger a deploy hook if the user explicitly requests it and the hook URL is available in the repo or provided by the user.
9. If any step needs network access or blocked filesystem access, request escalation with a clear justification rather than silently skipping it.
