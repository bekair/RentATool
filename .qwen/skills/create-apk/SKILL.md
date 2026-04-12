---
name: create-apk
description: Build a new Android APK for the mobile Expo app in this repo. Use when the user asks to create, build, or prepare an Android APK or EAS preview build for the mobile application.
---

# Create APK

1. Confirm the mobile app changes to include are already present and avoid destructive cleanup unless the user asks for it.
2. Check the git working tree and call out any unexpected unrelated changes before proceeding.
3. Review [mobile/package.json](C:/Users/bcbso/Repos/Own%20Repos/rent_a_tool/mobile/package.json) and [mobile/eas.json](C:/Users/bcbso/Repos/Own%20Repos/rent_a_tool/mobile/eas.json) to confirm the app uses Expo and has a `preview` EAS profile.
4. If the request is only for instructions, stop after explaining the exact command: run `npx eas-cli build --profile preview --platform android` from the `mobile/` directory.
5. If the user wants the build executed, run the build from `C:\Users\bcbso\Repos\Own Repos\rent_a_tool\mobile`.
6. Tell the user that EAS may require authentication and network access. If sandboxing blocks the command, request escalation with a narrow justification.
7. After the build completes, share the important result: whether it succeeded, the build id or download URL if present, and any follow-up needed to retrieve the APK.
8. Do not claim the APK was downloaded unless you actually downloaded it.
