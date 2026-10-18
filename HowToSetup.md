# FlowPilot CRM — Setup Guide

This guide starts FlowPilot CRM on a clean machine. No production credentials are included in the source archive.

## Requirements

- Node.js 20 LTS or newer
- npm 10 or newer
- MongoDB Atlas or a MongoDB replica set

MongoDB must run as a replica set because Prisma nested writes use transactions. MongoDB Atlas clusters meet this requirement. FlowPilot 1.1 uses USD as its single display currency and groups won deals into calendar months using UTC.

## Local installation

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL`.
3. Install and prepare the application:

```bash
npm ci
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Open `http://localhost:3000`. The seed command creates `demo@flowpilot.com` with password `DemoFlow2026!` and sample workspace data. Change or remove this account before accepting real users.

## Production build

```bash
npm ci
npx prisma generate
npx prisma db push
npm run build
npm start
```

Set `NEXTAUTH_URL` to the final HTTPS domain. Use a unique secret generated with `openssl rand -base64 32`.

## Deployment route 1: Vercel

1. Import the Git repository into Vercel.
2. Add all three variables from `.env.example` with production values.
3. Keep the standard Next.js build command (`npm run build`).
4. Run `npx prisma db push` once against the production database before first use.
5. Deploy, then set `NEXTAUTH_URL` to the final domain and redeploy.

## Deployment route 2: Docker / VPS

```bash
docker build -t flowpilot-crm .
docker run -d --name flowpilot-crm -p 3000:3000 --env-file .env flowpilot-crm
```

Put Caddy, Nginx, or a managed load balancer in front of port 3000 for HTTPS. Back up MongoDB separately and never commit `.env`.

## Verification

```bash
npm run lint
npm run build
npm audit --omit=dev
```

Test registration, login/logout, project CRUD, task status changes, client pipeline changes, settings, mobile navigation, and workspace isolation before launch.

For an existing 1.0 installation, back up MongoDB and run `npx prisma db push` to add the optional `wonAt` field/index. Historic Won deals without a close date remain in the Won total but are not placed on the monthly chart until a date is established by re-saving their Won status or an operator-controlled migration.

## Common issues

- `PrismaClientInitializationError`: verify the MongoDB URL and network allow-list.
- Login redirects back to login: confirm `NEXTAUTH_SECRET` and the exact HTTPS `NEXTAUTH_URL`.
- Empty dashboard: run `npm run seed` or create data through the UI.
