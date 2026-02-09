# 🛠️ RENT-a-Tool

RENT-a-Tool is a high-fidelity, peer-to-peer mobile marketplace designed to make tool sharing seamless, secure, and visually stunning. Built with a "Premium-First" philosophy, it combines a robust NestJS backend with a modern React Native dashboard experience.

## 🚀 Vision
Empowering communities to share resources efficiently by providing a trusted platform for renting power tools, gardening equipment, and more.

## 🏗️ Project Structure
This is a Monorepo containing both the frontend and backend:

- **[`backend/`](./backend)**: A scalable NestJS API powered by Prisma ORM and PostgreSQL.
- **[`mobile/`](./mobile)**: A premium React Native application built with Expo, featuring custom floating navigation and a high-fidelity dashboard.

## 💻 Tech Stack
- **Backend**: Node.js, NestJS, Prisma, PostgreSQL, JWT Auth.
- **Mobile**: React Native, Expo, Ionicons, React Navigation.
- **Design**: Vanilla CSS with a focus on dark-mode aesthetics and micro-animations.

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Expo Go (on your mobile device)

### Quick Setup

1. **Install Dependencies** (from the root):
   ```bash
   npm install
   ```

2. **Backend Configuration**:
   - Go to `backend/`
   - Copy `.env.example` to `.env` and configure your database.
   - Run: `npx prisma migrate dev`

3. **Run the Project**:
   - **Start Backend**: `cd backend && npm run start:dev`
   - **Start Mobile**: `cd mobile && npx expo start`

## 🎨 UI Redesign
The project recently underwent a major UI overhaul, transforming the interface into a "Premium Dark" theme with:
- Floating translucent tab bar.
- Custom "Add Tool" action button.
- Performance statistics dashboard in the Profile tab.

---
*Created with ❤️ by the RENT-a-Tool team.*
