# LawSphere — AI-Powered Legal Marketplace

> Connect clients with verified lawyers through AI-driven intake, smart matching, and secure video consultations.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5.9-2D3748?style=flat-square&logo=prisma)
![Firebase](https://img.shields.io/badge/Firebase-Auth-orange?style=flat-square&logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=flat-square&logo=tailwindcss)

---

## Overview

LawSphere is a full-stack legal marketplace for India. Clients describe their legal issue in plain language; an AI pipeline classifies the case, scores urgency, and matches them with the best-fit verified lawyer. Consultations happen via video, audio, or chat — all within the platform.

### Key Features

| Feature | Description |
|---|---|
| **AI Legal Intake** | GPT-4o classifies cases, detects urgency, summarises issues, and ranks matching lawyers |
| **Google Sign-In** | Firebase Authentication with JWT session tokens for all API routes |
| **Verified Lawyers** | Bar Council credential verification before a lawyer goes live |
| **Video Consultations** | Twilio-powered HD video calls with session notes |
| **Document Management** | Secure S3 uploads with signed URL access |
| **Payments** | Razorpay integration for Indian payments |
| **Real-time Messaging** | Socket.IO chat between clients and lawyers |
| **Role-based Dashboards** | Separate UX for Client, Lawyer, and Admin roles |

---

## Tech Stack

```
Frontend       Next.js 15 (App Router) · TypeScript · Tailwind CSS · Zustand
Auth           Firebase Auth (Google OAuth) · JWT (jsonwebtoken)
Database       Neon (serverless PostgreSQL) · Prisma ORM
AI             OpenAI GPT-4o
Storage        AWS S3
Payments       Razorpay
Video          Twilio Video
Monorepo       pnpm workspaces · Turborepo
```

---

## Project Structure

```
lawsphere/
├── apps/
│   └── web/                        # Next.js 15 frontend + API routes
│       └── src/
│           ├── app/
│           │   ├── (auth)/         # /login, /register
│           │   ├── client/         # /client/dashboard, cases, consultations…
│           │   ├── lawyer/         # /lawyer/dashboard, appointments, profile…
│           │   ├── admin/          # /admin/dashboard, users, verifications…
│           │   ├── lawyers/        # Public lawyer search
│           │   ├── notifications/
│           │   ├── settings/
│           │   └── api/            # All API route handlers
│           ├── components/
│           │   ├── layouts/        # DashboardSidebar
│           │   └── ui/             # Button, Badge, Card, Input…
│           ├── lib/
│           │   ├── ai/             # classifier, urgency, summarizer, recommender
│           │   ├── auth.ts         # JWT sign/verify
│           │   ├── firebase.ts     # Firebase client
│           │   ├── firebase-admin.ts
│           │   └── prisma.ts
│           └── stores/
│               └── auth.store.ts   # Zustand auth state
└── packages/
    └── database/
        └── prisma/
            ├── schema.prisma       # Full DB schema
            └── seeds/              # Seed data
```

---

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 8
- A [Neon](https://neon.tech) project (free tier)
- A [Firebase](https://console.firebase.google.com) project with Google sign-in enabled

### 1. Clone & install

```bash
git clone https://github.com/abhaykaiautomation/lawsphere.git
cd lawsphere
pnpm install
```

### 2. Configure environment

Copy the example and fill in your values:

```bash
cp .env.example apps/web/.env.local
```

Minimum required variables:

```env
# Neon — console.neon.tech → Connection Details → Prisma
DATABASE_URL=postgresql://...pooler...neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://...neon.tech/neondb?sslmode=require

# JWT — any random 32+ char string
JWT_SECRET=your_random_32_char_secret

# Firebase — console.firebase.google.com → Project Settings
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# OpenAI — platform.openai.com
OPENAI_API_KEY=
```

Generate a JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Set up the database

```bash
pnpm db:generate    # generate Prisma client
pnpm db:migrate     # push schema to Neon (first time)
```

### 4. Run the dev server

```bash
pnpm dev
# → http://localhost:3000
```

---

## Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project** → name it `lawsphere`
2. **Authentication → Sign-in method → Google** → Enable
3. **Authentication → Settings → Authorized domains** → Add `localhost`
4. **Project Settings → General → Your apps → Web app** → copy config into `NEXT_PUBLIC_FIREBASE_*` vars
5. **Project Settings → Service accounts → Generate new private key** → copy into `FIREBASE_*` vars

---

## Authentication Flow

```
User clicks "Continue with Google"
        ↓
Firebase handles OAuth → issues Firebase ID Token
        ↓
POST /api/auth/firebase-sync  { idToken, role }
        ↓
Server verifies token with Firebase Admin SDK
        ↓
Upsert user in Neon DB
        ↓
signToken() → returns LawSphere JWT (7 days)
        ↓
JWT stored in localStorage + cookie
Used as Bearer token on every API call
```

---

## AI Pipeline

```
Client submits case description
        ↓
┌─────────────────────────────────────────┐
│  Parallel GPT-4o calls                  │
│  ├── LegalClassifier   → category       │
│  ├── UrgencyDetector   → risk level     │
│  └── IntakeSummarizer  → structured     │
│       summary                           │
└─────────────────────────────────────────┘
        ↓
LawyerRecommender → score & rank top 5
        ↓
Client sees matched lawyers with scores
```

---

## Available Scripts

```bash
pnpm dev              # Start Next.js dev server
pnpm build            # Production build
pnpm lint             # ESLint
pnpm typecheck        # TypeScript check
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run migrations (dev)
pnpm db:studio        # Open Prisma Studio
pnpm db:seed          # Seed database
pnpm format           # Prettier
```

---

## Pages Reference

| Role | URL | Description |
|---|---|---|
| Public | `/` | Landing page |
| Public | `/lawyers` | Search & browse lawyers |
| Public | `/login` | Google sign-in |
| Public | `/register` | Role selection + Google sign-up |
| Client | `/client/dashboard` | Cases, consultations overview |
| Client | `/client/cases` | All cases |
| Client | `/client/cases/[id]` | Case detail + AI analysis |
| Client | `/client/intake` | Submit new legal issue |
| Client | `/client/consultations` | Upcoming & past sessions |
| Client | `/client/documents` | Document management |
| Client | `/client/messages` | Chat with lawyer |
| Lawyer | `/lawyer/dashboard` | Appointments, earnings |
| Lawyer | `/lawyer/appointments` | Manage appointments |
| Lawyer | `/lawyer/profile` | Edit profile & fees |
| Lawyer | `/lawyer/documents` | Credentials & case docs |
| Lawyer | `/lawyer/messages` | Chat with clients |
| Admin | `/admin/dashboard` | Platform overview |
| Admin | `/admin/users` | User management |
| Admin | `/admin/verifications` | Approve/reject lawyers |
| Admin | `/admin/analytics` | Revenue & usage metrics |
| All | `/notifications` | Notification centre |
| All | `/settings` | Account preferences |

---

## Roadmap

- [ ] **MVP 1** — Auth, AI intake, lawyer matching, dashboards *(current)*
- [ ] **MVP 2** — Live video consultations, real-time chat, payments
- [ ] **MVP 3** — Mobile app (React Native), Kubernetes deployment, advanced analytics

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes
4. Open a pull request

---

## License

MIT © 2026 LawSphere Technologies
