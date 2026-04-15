---
name: create-apk
description: Build a new Android APK for the mobile Expo app in this repo. Use when the user asks to create, build, or prepare an Android APK, EAS preview build, or distribute the mobile app. Trigger on phrases like "build the APK", "create a preview build", "EAS build", "Android build", or "how do I build the app".
---

# Create APK

1. Confirm the mobile app changes to include are already present. Avoid destructive cleanup (clearing caches, resetting node_modules) unless the user explicitly asks.
2. Check the git working tree (`git status --short`) and call out any unexpected unrelated changes before proceeding — the user should know what's going into this build.
3. Review `mobile/package.json` and `mobile/eas.json` to confirm the app uses Expo and has a `preview` EAS profile configured.
4. **Instructions only?** If the user is just asking how to build, stop here and explain the exact command:
   ```
   npx eas-cli build --profile preview --platform android
   ```
   Run from the `mobile/` directory.
5. **Executing the build?** Run the above command from `C:\Users\bcbso\Repos\Own Repos\rent_a_tool\mobile`.
6. Warn the user that EAS requires authentication and network access. If the environment blocks the command, explain what access is needed rather than silently skipping.
7. After the build completes, report: success/failure, the build ID or download URL if present, and any next steps needed to retrieve the APK.
8. Do not claim the APK was downloaded unless you actually downloaded it.
