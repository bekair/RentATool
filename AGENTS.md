# Rent-A-Tool Project Rules

This file defines the coding style and guidelines for the `rent_a_tool` monorepo. Codex should follow these instructions throughout the project.

## General
- Write clean, modular, and maintainable code.
- Use `camelCase` for variables and functions, and `PascalCase` for React components.
- Do not make assumptions when deleting code; ask the user first if the change is destructive.

## Repo-Local Skills
- Use [create-apk](C:\Users\bcbso\Repos\Own Repos\rent_a_tool\.codex\skills\create-apk\SKILL.md) when the user asks to build or prepare an Android APK or Expo EAS preview build.
- Use [new-db-migration](C:\Users\bcbso\Repos\Own Repos\rent_a_tool\.codex\skills\new-db-migration\SKILL.md) when the user asks for Prisma schema changes, database migrations, backend formatting/build validation, or the development deployment workflow.
- Use [commit-message](C:\Users\bcbso\Repos\Own Repos\rent_a_tool\.codex\skills\commit-message\SKILL.md) when the user asks for a clear commit message for current changes or asks to improve commit wording.
- Use [generate-api-artifacts](C:\Users\bcbso\Repos\Own Repos\rent_a_tool\.codex\skills\generate-api-artifacts\SKILL.md) when backend API contracts change and OpenAPI/types/enums must be regenerated for mobile.

## Mobile (React Native / Expo)
- **API calls:** Never use `axios` directly in UI components. Always use the pre-configured wrappers in `src/api/client.js` or dedicated service files such as `locationService.js`.
- **Styling:** Use React Native's `StyleSheet.create` for styling. Do not use TailwindCSS. Avoid inline styles unless they are required for dynamic layout calculations.
- **Navigation:** Use standard React Navigation patterns. Ensure global state errors are cleared on screen blur using `useFocusEffect` where relevant, such as auth flows.
- **Form submission:** Keep submit buttons disabled until all required fields on the current page are filled and valid. Provide visual feedback, such as lower opacity or a grayed out button, when disabled.
- **Form components:** Use the shared components in `src/components/form/` for form inputs, text areas, date pickers, and related styling so forms stay visually consistent across the app.
- **Shared UI components:** Reuse or create shared components under `src/components/` for common UI controls (especially buttons and loading/disabled button states) instead of re-implementing button logic per screen.
- **Validation:** Implement validation for required fields and business-specific checks anywhere data is saved. Provide real-time inline feedback through the common form components' `error` prop. Submit buttons must remain disabled, with visual feedback, until the form is valid.
- **Loading feedback:** Every async action, including form submission, initial data fetching, and destructive operations such as delete, must show clear in-progress feedback. Match the UI pattern to the situation: use an `ActivityIndicator` for saves, a full-screen or inline spinner for screen loads, and disable controls to prevent duplicate submissions.
- **Theming:** For any new or modified mobile UI, use shared theme tokens and hooks from `src/theme/` (for example `useTheme` and themed style helpers) instead of introducing new hardcoded color literals.

## Backend (NestJS / Prisma)
- Follow the standard NestJS structure of controllers, services, DTOs, and modules.
- Validate all incoming data with `class-validator` in DTO files before it reaches the service layer.
- Run Prisma migrations immediately after changing `schema.prisma`.

## Workflow Guidelines
- Start by answering the user's specific question before jumping into code edits.
- Test new packages locally when possible, and keep error handling robust, including API failure handling where the UI has a valid fallback.
- If an integration is added, update [docs/integrations.md](C:\Users\bcbso\Repos\Own Repos\rent_a_tool\docs\integrations.md) using the same structure as the existing entries.


