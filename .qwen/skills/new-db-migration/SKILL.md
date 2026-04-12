---
name: new-db-migration
description: Create and validate a new Prisma database migration for the NestJS backend and prepare the development deployment steps. Use when the user asks for a schema change, Prisma migration, backend formatting/build validation, or the dev deployment workflow.
---

# New DB Migration

1. Start by identifying the requested schema or backend change and answer any direct question before editing files.
2. Make the necessary backend changes first, then review [backend/package.json](C:/Users/bcbso/Repos/Own%20Repos/rent_a_tool/backend/package.json) and [migrate_db.bat](C:/Users/bcbso/Repos/Own%20Repos/rent_a_tool/migrate_db.bat) for the repo's migration commands.
3. Create the migration from `C:\Users\bcbso\Repos\Own Repos\rent_a_tool\backend` with `npx prisma migrate dev` after editing `schema.prisma`.
4. Format the backend with `npm run format --workspace=backend`.
5. Build the backend with `npm run build --workspace=backend`.
6. Check the git diff and summarize the files that changed, including the new migration files and generated Prisma artifacts.
7. If the user asked for deployment, explain that Render deployment normally happens by pushing the committed changes or triggering Render manually. Only trigger a deploy hook when the user explicitly wants that action and the hook details are available in the repo or provided by the user.
8. If a command needs network or blocked filesystem access, request escalation instead of skipping the workflow silently.
