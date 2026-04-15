---
name: generate-api-artifacts
description: Generate backend OpenAPI JSON, mobile API TypeScript types, and mobile runtime enum constants from the current backend schema and contracts. Use whenever backend API contracts change — especially enums — and the mobile generated artifacts need to stay in sync. Trigger on phrases like "generate API types", "regenerate enums", "sync mobile types", "run api:generate", or "update the generated files".
---

# Generate API Artifacts

1. Confirm the generation scripts exist in the root `package.json`:
   - `openapi:generate`
   - `api:types`
   - `api:enums`
   - `api:generate`
2. Run the full generation from the repo root:
   ```
   npm run api:generate
   ```
   Working directory: `C:\Users\bcbso\Repos\Own Repos\rent_a_tool`
3. Verify the expected output files were updated:
   - `openapi/openapi.json`
   - `mobile/src/generated/api-types.ts`
   - `mobile/src/generated/api-enums.js`
4. **If generation fails**, report the exact failing step and reason (OpenAPI export, types generation, or enums generation) and propose the smallest fix to unblock it.
5. **After success**, summarize:
   - What was regenerated
   - Whether any enum values changed (additions, removals, renames)
   - Which mobile screens or constants consume the affected enums
