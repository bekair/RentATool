---
trigger: always_on
---

# Antigravity Rent-A-Tool Project Rules

This file defines the coding style and guidelines for the rent_a_tool monorepo. Antigravity should adhere to these instructions throughout the project. 
You can edit these rules at any time to update my behavior.

## General
- Write clean, modular, and maintainable code.
- Always use `camelCase` for variables and functions, and `PascalCase` for React components.
- Do not make assumptions when deleting code; ask the user first if it's destructive.

## Mobile (React Native / Expo)
- **API Calls:** Never use `axios` directly in UI components. Always use the pre-configured wrappers in `src/api/client.js` or dedicated service files (like `locationService.js`).
- **Styling:** Use React Native's `StyleSheet.create` for styling. Do not use TailwindCSS. Avoid inline styles unless absolutely necessary for dynamic layout calculations.
- **Navigation:** Use standard React Navigation patterns. Ensure global state errors are cleared on screen blur using `useFocusEffect` (e.g. Auth flow).
- **Form Submission:** Always ensure form submit buttons are `disabled` until all required fields on the specific page are filled and valid. Provide visual feedback (e.g., lower opacity or grayed out button) when disabled.
- **Form Components:** Every form component (inputs, text areas, date pickers) and their styling should use the common components defined in `src/components/form/` to make styling strictly compatible and uniform across the application.

## Backend (NestJS / Prisma)
- Follow the standard internal NestJS architecture: Controllers, Services, DTOs, and Modules.
- Validate all incoming data using `class-validator` in the DTO files before it hits the service layer.
- Ensure all Prisma migrations (`npx prisma migrate dev`) are run immediately after making changes to `schema.prisma`. 

## Workflow Guidelines
- Start by answering the user's specific question before jumping into code edits.
- Test new packages locally when possible, and ensure error handling is robust (e.g., catching API failures silently if the UI provides a valid fallback).
