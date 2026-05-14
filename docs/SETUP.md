# LawSphere — Setup & Development Guide

## Infrastructure

| Service | Provider |
|---|---|
| Database | **Neon** (serverless PostgreSQL) |
| Frontend | **Vercel** |
| Backend API | Docker / AWS ECS |
| Cache | Redis (Docker locally) |

## Prerequisites
- Node.js >= 20
- pnpm >= 8
- Docker + Docker Compose (for API + Redis locally)
- A [Neon](https://neon.tech) project (free tier works)

## 1. Neon Database Setup

1. Create a project at [console.neon.tech](https://console.neon.tech)
2. Go to **Connection Details** → select **Prisma** from the dropdown
3. Copy both connection strings into your `.env`:

```env
# Pooled (runtime) — from "Connection string" with pgbouncer=true
DATABASE_URL=postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/lawsphere?sslmode=require&pgbouncer=true&connect_timeout=15

# Direct (migrations) — from "Connection string" without pooler
DATABASE_URL_UNPOOLED=postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/lawsphere?sslmode=require
```

4. Run migrations against Neon:
```bash
pnpm db:migrate        # development (creates migration files)
# or
pnpm db:migrate:prod   # production (deploys existing migrations)
```

## 2. Vercel Frontend Deployment

1. Push the repo to GitHub
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Set **Root Directory** → `apps/web`
4. Vercel auto-detects Next.js — no build command changes needed
5. Add environment variables in Vercel dashboard (all `NEXT_PUBLIC_*` vars + `CLERK_SECRET_KEY`)

Required Vercel env vars:
```
NEXT_PUBLIC_API_URL         = https://api.lawsphere.in/api/v1
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_RAZORPAY_KEY_ID
```

## Quick Start (Local Dev — Docker)

```bash
# 1. Copy env and fill in Neon URLs + other secrets
cp .env.example .env

# 2. Start Redis + API (postgres is Neon — no local container)
docker-compose up -d

# 3. Seed initial data
docker-compose exec api npx ts-node packages/database/prisma/seeds/index.ts
```

## Local Development (No Docker)

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your values

# 3. Generate Prisma client
pnpm db:generate

# 4. Run migrations
pnpm db:migrate

# 5. Seed database
pnpm db:seed

# 6. Start development servers
pnpm dev
# API: http://localhost:4000
# Web: http://localhost:3000
# Swagger: http://localhost:4000/api/docs
# Prisma Studio: pnpm db:studio
```

## Project Structure

```
lawsphere/
├── apps/
│   ├── api/                    # NestJS Backend
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── auth/       # JWT + Clerk auth
│   │       │   ├── users/      # User profiles
│   │       │   ├── lawyers/    # Lawyer profiles + search
│   │       │   ├── intake/     # AI intake engine
│   │       │   ├── consultations/  # Appointments + video
│   │       │   ├── documents/  # S3 document management
│   │       │   ├── payments/   # Razorpay + Stripe
│   │       │   ├── messages/   # Socket.IO chat
│   │       │   ├── notifications/
│   │       │   ├── reviews/
│   │       │   ├── admin/
│   │       │   └── ai/         # AI service layer
│   │       ├── common/         # Guards, decorators, filters
│   │       ├── config/         # App configuration
│   │       └── database/       # Prisma service
│   └── web/                    # Next.js 15 Frontend
│       └── src/
│           ├── app/            # App Router pages
│           │   ├── (auth)/     # Login, register
│           │   ├── (client)/   # Client pages
│           │   ├── (lawyer)/   # Lawyer pages
│           │   └── (admin)/    # Admin pages
│           ├── components/     # Reusable components
│           ├── hooks/          # Custom React hooks
│           ├── stores/         # Zustand state stores
│           └── lib/            # API client, utils
├── packages/
│   └── database/
│       └── prisma/
│           ├── schema.prisma   # Complete DB schema
│           └── seeds/          # Seed data
├── infrastructure/
│   ├── docker/                 # Dockerfiles
│   ├── nginx/                  # Nginx config
│   └── k8s/                    # Kubernetes manifests (MVP 3)
├── .github/workflows/          # CI/CD pipelines
├── docker-compose.yml
└── .env.example
```

## API Endpoints Summary

### Auth
- `POST /api/v1/auth/register` — Email/password registration
- `POST /api/v1/auth/login` — Email/password login
- `POST /api/v1/auth/clerk/sync` — Sync Clerk user
- `GET  /api/v1/auth/me` — Get current user

### Lawyers
- `GET  /api/v1/lawyers/search` — Search lawyers (public)
- `GET  /api/v1/lawyers/:slug` — Public lawyer profile
- `GET  /api/v1/lawyers/me/profile` — My profile (LAWYER)
- `PATCH /api/v1/lawyers/me/profile` — Update profile (LAWYER)

### Intake (AI)
- `POST /api/v1/intake/cases` — Submit legal issue (triggers AI pipeline)
- `GET  /api/v1/intake/cases` — Get my cases
- `GET  /api/v1/intake/cases/:id` — Get case with AI analysis
- `GET  /api/v1/intake/cases/:id/recommendations` — AI lawyer matches

### Consultations
- `POST /api/v1/consultations/appointments` — Book appointment
- `PATCH /api/v1/consultations/appointments/:id/confirm` — Confirm (LAWYER)
- `POST /api/v1/consultations/appointments/:id/start` — Get video token
- `GET  /api/v1/consultations/appointments` — My appointments

### Payments
- `POST /api/v1/payments/appointments/:id/order` — Create Razorpay order
- `POST /api/v1/payments/verify` — Verify payment signature
- `GET  /api/v1/payments/history` — Payment history

### Documents
- `POST /api/v1/documents/upload` — Upload document
- `GET  /api/v1/documents` — Get my documents
- `GET  /api/v1/documents/:id/download-url` — Signed S3 URL

### Admin
- `GET  /api/v1/admin/dashboard` — Platform stats
- `GET  /api/v1/admin/verifications` — Pending verifications
- `PATCH /api/v1/admin/verifications/:id` — Approve/reject lawyer

## AI Pipeline Flow

```
Client submits case description
        ↓
[Parallel AI calls]
├── LegalClassifierService  → category + confidence + entities
├── UrgencyDetectorService  → urgency level + risk factors
└── IntakeSummarizerService → structured summary

        ↓
Update case with AI results
        ↓
LawyerRecommenderService    → score + rank top 5 lawyers
        ↓
AiRecommendation records created
        ↓
Client sees matched lawyers
```

## Security Checklist
- [x] JWT authentication with RS256 signing
- [x] RBAC via `@Roles()` decorator
- [x] Global JWT guard on all routes
- [x] `@Public()` decorator for open routes
- [x] Helmet.js security headers
- [x] Rate limiting (10 req/s short, 100 req/min long)
- [x] CORS origin whitelist
- [x] S3 signed URLs (no direct access)
- [x] AES-256 server-side S3 encryption
- [x] Input validation via class-validator + Zod
- [x] Soft delete (no hard data removal)
- [x] Audit log table for all mutations
- [x] Payment signature verification (HMAC)

## Testing Strategy

```bash
# Unit tests
pnpm --filter @lawsphere/api test

# E2E tests
pnpm --filter @lawsphere/api test:e2e

# Watch mode
pnpm --filter @lawsphere/api test -- --watch
```
