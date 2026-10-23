# FarmerReachNG

**Agritech platform connecting agricultural extension officers with farmers in Plateau State, Nigeria.**

Dry-season (irrigation) advisory via SMS/WhatsApp · Market access · Post-harvest storage.

## Thematic Areas
| Area | Implementation |
|------|----------------|
| Productivity & Resilience | Extension campaigns via Twilio, irrigation targeting |
| Market Access & Value Chains | Produce listings marketplace |
| Post-Harvest Innovation | Bookable storage (ambient / cold / silo / warehouse) |
| Agri-Finance & Inclusion | Fee-based storage (payment foundation) |

## Stack
| Layer | Tech |
|-------|------|
| Frontend | Next.js 16 · Tailwind CSS v4 · GSAP |
| Backend | Node.js · Express |
| Database | MongoDB Atlas |
| Auth | JWT + RBAC · Email/password · **Google OAuth** |
| Messaging | Twilio (SMS + WhatsApp) |
| Deploy | Vercel (web) · Render (API) |

## Monorepo
```
farmerreachng/
├── apps/
│   ├── web/          # Next.js frontend
│   └── server/       # Express API
├── packages/shared/  # Shared constants
├── docs/
│   ├── API.md        # Full REST API reference
│   └── DATABASE.md   # Schema documentation
├── package.json
├── .gitignore
└── README.md
```

## Roles (RBAC)
`farmer` · `extension_officer` · `storage_operator` · `admin` · `super_admin`

## Quick Start

### 1. Install
```bash
cd farmerreachng
rm -rf node_modules apps/*/node_modules package-lock.json
npm install
```

### 2. Environment

**apps/server/.env** (from `.env.example`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=long-random-string
CLIENT_URL=http://localhost:3000
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
GOOGLE_CLIENT_ID=          # same as frontend Client ID
```

**apps/web/.env.local** (from `.env.example`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=   # Google Cloud Web Client ID
```

### 3. Seed (optional demo users)
```bash
cd apps/server && npm run seed
```

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@farmerreachng.com | ChangeMe123! |
| Extension Officer | officer@farmerreachng.com | Officer123! |
| Farmer | farmer@farmerreachng.com | Farmer123! |
| Storage Operator | storage@farmerreachng.com | Storage123! |

> These are convenience seeds only. Once Google Auth is configured, real Google accounts work for sign-up and sign-in with no demo dependency.

### 4. Run
```bash
npm run dev
# Web → http://localhost:3000
# API → http://localhost:5000
```

## Google OAuth Setup
1. [Google Cloud Console](https://console.cloud.google.com/) → create project
2. APIs & Services → Credentials → Create OAuth 2.0 Client ID (Web application)
3. Authorized JavaScript origins: `http://localhost:3000` (+ production Vercel URL)
4. Authorized redirect URIs: not required for GIS button flow (ID token)
5. Copy **Client ID** into:
   - `apps/web/.env.local` → `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - `apps/server/.env` → `GOOGLE_CLIENT_ID`
6. Restart both servers — “Continue with Google” appears on Login & Register

## Documentation
- [API Reference](docs/API.md)
- [Database Schemas](docs/DATABASE.md)

## Design
- Bold Geist typography, deep greens + amber accent
- GSAP hero animations
- Role-aware dashboards, mobile-first

## Deploy
- **Frontend** → Vercel, root directory `apps/web`
- **Backend** → Render, root directory `apps/server`, start: `npm start`

## License
Private — Hackathon project
