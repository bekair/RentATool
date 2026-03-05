# External Integration Points

This document lists all third-party services & libraries the Rent-A-Tool project depends on, grouped by layer. Use it as a reference when evaluating costs, swapping providers, or onboarding new developers.

---

## Mobile (React Native / Expo)

### 1. Google Places Autocomplete
- **Purpose:** Address search & autocomplete in the address form (manual tab).
- **Library:** `react-native-google-places-autocomplete`
- **API:** Google Places API (Autocomplete + Place Details)
- **Env var:** `GOOGLE_MAPS_ANDROID_API_KEY` (in `mobile/.env`)
- **Used in:** `AddressesScreen.js`
- **Pricing:** $2.83/1K autocomplete sessions, $17/1K place details (with structured fields). $200/month free credit.
- **Alternatives:** Mapbox Search, Radar.io, LocationIQ, Geoapify, self-hosted Nominatim/Photon.

### 2. Google Maps (Map View)
- **Purpose:** Interactive map for picking tool locations and addresses (pick from map).
- **Library:** `react-native-maps` (uses Google Maps on Android, Apple Maps on iOS)
- **Env var:** `GOOGLE_MAPS_ANDROID_API_KEY`
- **Used in:** `AddressesScreen.js`, `AddToolScreen.js`, `EditToolScreen.js`, `MapScreen.ios.js`, `MapScreen.android.js`
- **Pricing:** $7/1K Dynamic Maps loads, $5/1K Static Maps. Free $200/month credit.

### 3. Expo Location
- **Purpose:** Request device GPS permissions and fetch current coordinates (for map centering and reverse geocoding).
- **Library:** `expo-location`
- **Used in:** `AddressesScreen.js`, `AddToolScreen.js`, `EditToolScreen.js`, `MapScreen.ios.js`, `MapScreen.android.js`
- **Pricing:** Free (device API, no external calls).


---

## Backend (NestJS)

### 4. PostgreSQL (via Prisma)
- **Purpose:** Primary database for all application data.
- **ORM:** Prisma (`@prisma/client`)
- **Env var:** `DATABASE_URL` (in `backend/.env`)
- **Hosting:** Render Managed PostgreSQL
- **Used in:** All services via `PrismaService`
- **Pricing:** Render free tier: 1 DB, 1GB storage, 90-day expiry. Paid: starts at $7/month.

### 5. JWT Authentication
- **Purpose:** Stateless user authentication for all protected API endpoints.
- **Library:** `@nestjs/jwt` + `passport-jwt`
- **Env var:** `JWT_SECRET` (in `backend/.env`)
- **Used in:** `auth.module.ts`, `auth.service.ts`, `jwt.strategy.ts`, all controllers via `JwtAuthGuard`
- **Pricing:** Free (self-managed).

### 6. bcrypt
- **Purpose:** Password hashing for user registration and login validation.
- **Library:** `bcrypt`
- **Used in:** `users.service.ts`, `auth.service.ts`
- **Pricing:** Free (local computation).

---

## Hosting & Infrastructure

### 7. Render
- **Purpose:** Hosting the NestJS backend and PostgreSQL database.
- **Services:** Web Service (backend API) + Managed PostgreSQL
- **Pricing:** Free tier available. Paid web service from $7/month, DB from $7/month.

### 8. Expo / EAS
- **Purpose:** Development server, OTA updates, and app builds.
- **Used for:** `expo start`, building APK/IPA via EAS Build.
- **Pricing:** Free tier: 30 builds/month. Paid: $99/month for more builds and priority.

---

## Summary Table

| # | Service | Layer | Cost at Scale | Swappable? |
|---|---------|-------|--------------|------------|
| 1 | Google Places Autocomplete | Mobile | **$$$** (most expensive) | ✅ Mapbox, Radar, LocationIQ |
| 2 | Google Maps (MapView) | Mobile | **$$** | ⚠️ Mapbox Maps (requires `react-native-mapbox`) |
| 3 | Expo Location | Mobile | Free | ❌ Device API |
| 4 | PostgreSQL | Backend | $7+/mo | ✅ Any Postgres host (Supabase, Neon, Railway) |
| 5 | JWT Auth | Backend | Free | ❌ Core auth |
| 6 | bcrypt | Backend | Free | ❌ Core security |
| 7 | Render | Infra | $14+/mo | ✅ Railway, Fly.io, AWS |
| 8 | Expo / EAS | Infra | Free–$99/mo | ⚠️ Tightly coupled to Expo |
