# ☁️ Deploying via GitHub (The "Magic" Way)

Since you want to deploy **Both** apps and configure the environment using GitHub, we will use **Infrastructure as Code**.

I have added a special file `render.yaml` to your repository. This file tells the Cloud exactly how to build your backend and database.

## Phase 1: The Backend (Automatic Deployment)

1.  **Push Changes**: Run the git commands below to push the new `render.yaml` to GitHub.
2.  **Go to Render**: Open [dashboard.render.com/blueprints](https://dashboard.render.com/blueprints).
3.  **Click "New Blueprint Instance"**:
    *   Connect your `RentATool` repo.
    *   It will automatically detect `render.yaml`.
    *   Click **"Approve"**.
4.  **Done!**: It will create the Database and the Backend for you.
    *   *Copy the Backend URL it gives you (e.g., `https://rent-a-tool-backend.onrender.com`).*

## Phase 2: The Mobile App (Connecting the Dots)
Now we need to tell the mobile app where the backend lives.

1.  **Update Config (Environment Variable)**:
    *   Good catch! It's better to keep config out of the code.
    *   Open `mobile/eas.json`.
    *   Find `"EXPO_PUBLIC_API_URL"` and replace the placeholder text with your **new Render Backend URL** (e.g. `https://rent-a-tool-backend.onrender.com`).
    *   Push this change to GitHub.

2.  **Build the App (Using EAS)**:
    *   Open your terminal in `mobile/`.
    *   Run: `npx eas-cli build --profile preview --platform android`
    *   *Note: You might need to login with `npx eas-cli login` first.*

This will generate a downloadable link for the Android App (.apk) that is connected to your real cloud backend.

## Phase 3: GitHub Environment (Secrets)
Strictly speaking, `render.yaml` handles the secrets for the backend automatically (it generates a secure `JWT_SECRET` and links the DB).

If you want to store secrets in GitHub for Actions:
1.  Go to your Repo on GitHub.
2.  **Settings** -> **Secrets and variables** -> **Actions**.
3.  Click "New repository secret".
4.  Add `DATABASE_URL`, `JWT_SECRET`, etc.
