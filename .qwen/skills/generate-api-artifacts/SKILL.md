---
name: generate-api-artifacts
description: Generate backend OpenAPI JSON, mobile API TypeScript types, and mobile runtime enum constants from the current backend schema/contracts. Use when backend API contracts change (especially enums) and mobile generated artifacts must stay in sync.
---

# Generate API Artifacts

1. Confirm generation scripts exist in root `package.json`:
   - `openapi:generate`
   - `api:types`
   - `api:enums`
   - `api:generate`
2. Run `npm run api:generate` from `C:\Users\bcbso\Repos\Own Repos\rent_a_tool`.
3. Verify generated outputs changed as expected:
   - `openapi/openapi.json`
   - `mobile/src/generated/api-types.ts`
   - `mobile/src/generated/api-enums.js`
4. If generation fails, report the exact failing step and reason (OpenAPI export, types generation, or enums generation), then propose the smallest fix.
5. After success, summarize:
   - what was regenerated,
   - whether enum values changed,
   - which mobile screens/constants consume the generated enums.
