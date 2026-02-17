# 🛠 Rent-a-Tool Development Guide

This guide covers the three main ways to run and test the Rent-a-Tool application.

---

## 1. Fully Local Setup
**Use this for: Heavy development, adding features, or offline work.**
*Everything (Database, Backend, and Mobile App) runs on your computer.*

### Prerequisites
- [Docker](https://www.docker.com/) (recommended for Database) OR a local PostgreSQL installation.
- Node.js installed.

### Steps
1. **Start the Database**:
   - If using Docker, run a Postgres container:
     ```bash
     docker run --name rent-a-tool-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
     ```
2. **Configure Backend**:
   - Go to `backend/.env` and ensure `DATABASE_URL` points to your local DB:
     ```env
     DATABASE_URL="postgresql://postgres:password@localhost:5432/postgres?schema=public"
     ```
3. **Initialize DB**:
   - In `backend/`, run: `npx prisma migrate dev`
4. **Start Backend**:
   - From root: `npm run backend:dev`
5. **Start Mobile**:
   - From root: `npm run mobile:start`
   - *Note: Ensure your phone and computer are on the same Wi-Fi.*

### 🌍 Sharing your Local Backend (Tunnel)
If you want to run the backend locally but let someone **outside your network** see it:
1. In `backend/`, run: `npx localtunnel --port 3000`
2. Copy the URL (e.g., `https://green-ants-zip.loca.lt`).
3. Set `EXPO_PUBLIC_API_URL` in `mobile/.env` to that URL.

---

## 2. Hybrid Setup
**Use this for: Testing the mobile app against "Live" data without setting up a local database.**
*Database/Backend run on Render (Cloud), Mobile App runs locally.*

### Prerequisites
- Your backend must be deployed to Render.

### Steps
1. **Get your Render URL**:
   - Example: `https://rent-a-tool-backend.onrender.com`
2. **Configure Mobile App**:
   - Create or update `mobile/.env`:
     ```env
     EXPO_PUBLIC_API_URL=https://your-backend-url.onrender.com
     ```
3. **Start Mobile**:
   - From root: `npm run mobile:start`
   - The app will now communicate with the Cloud database.

---

## 3. Fully Remote Setup (Cloud Deployment)
**Use this for: Sharing the app with friends or final testing.**
*Everything runs in the Cloud (Render + Neon/Render DB).*

### 🚀 Deploying the Backend to Render (Step-by-Step)
1. **Push your code**: Ensure `render.yaml` is in your root folder and pushed to your GitHub repository.
2. **Open Render**: Go to [dashboard.render.com](https://dashboard.render.com).
3. **Use Blueprints**: 
   - Click **"New +"** and select **"Blueprint"**.
   - Connect your **RentATool** GitHub repository.
   - Render will automatically read `render.yaml`.
4. **Approve Infrastructure**:
   - Render will show you it's about to create a **PostgreSQL Database** and a **Web Service (Backend)**.
   - Click **"Approve"**.
5. **Check Database**: Once created, Render automatically handles the `DATABASE_URL`.
6. **Watch Logs**: Under the Web Service -> Logs, you should see the build finish and the message: `Nest application successfully started`.

### 📱 Deploying the Mobile App (EAS)
1. **Update API Link**: 
   - Go to `mobile/eas.json`.
   - Set `EXPO_PUBLIC_API_URL` to your new Render Backend URL (e.g., `https://rent-a-tool-backend.onrender.com`).
2. **Build APK**:
   - Inside the `mobile/` folder, run:
     ```bash
     npx eas-cli build --profile preview
     ```
3. **Distribute**: Download the resulting `.apk` file and share it!

---

## 💡 Quick Reference: Environment Variables

| Variable | Description | Typical Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | DB Connection String | `postgresql://...` |
| `JWT_SECRET` | Secret for Auth Tokens | Any secure string |
| `EXPO_PUBLIC_API_URL` | Mobile -> API Link | `http://localhost:3000` or Render URL |
