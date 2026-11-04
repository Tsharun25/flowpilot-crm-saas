# FlowPilot CRM deployment

FlowPilot is a self-hosted source-code starter. Both routes require Node.js 20+, a MongoDB replica set, private secrets, schema synchronization, HTTPS, backups, monitoring, and post-deployment verification.

## Required environment

Copy `.env.example`; replace every placeholder. `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`, and the server-only `PASSWORD_RESET_ORIGIN` must be the exact final HTTPS origin. Keep `DATABASE_URL`, `NEXTAUTH_SECRET`, `RATE_LIMIT_SALT`, `PASSWORD_RESET_ORIGIN`, and `RESEND_API_KEY` server-only. Verify the `EMAIL_FROM` domain in Resend and configure `NEXT_PUBLIC_SUPPORT_URL` with the seller/deployment owner's HTTPS support page. Reset delivery fails closed before token issuance if its trusted origin is missing or invalid.

## Route 1 — Vercel

1. Import the repository and configure the environment variables.
2. From a trusted machine connected to the target database, run `npm ci`, `npx prisma generate`, and `npx prisma db push`.
3. Deploy with `npm run build`.
4. Verify `/`, `/robots.txt`, `/sitemap.xml`, login/logout, protected redirects, normal-workspace CRUD, demo read-only behavior, exports, and backup access.

The reference Vercel deployment has been exercised, but a buyer's environment remains their responsibility.

## Route 2 — Docker/VPS

Prerequisites are Node.js 20.9+, npm 10+, a MongoDB replica set, and a completed `.env` copied from `.env.example`. On a VPS, install and build in this order:

```bash
npm ci
npx prisma generate
npx prisma db push
npm run build
npm start
```

`npm start` requires `.env` and the standalone output produced by `npm run build`. Register the first production account at `/register`; it becomes owner only of its newly created workspace. Branding locations are documented in `HowToSetup.md`.

Run schema synchronization from a trusted one-off environment, then:

```bash
docker build -t flowpilot-crm:1.5.4 .
docker run -d --name flowpilot-crm --env-file .env -p 3000:3000 flowpilot-crm:1.5.4
```

Terminate HTTPS with Caddy, Nginx, or a managed load balancer. Do not expose MongoDB publicly. The Dockerfile is included, but Docker runtime verification is blocked on the current audit machine because Docker CLI is unavailable.

The included `docker-compose.yml` initializes a local single-node `rs0` replica set. After it is healthy, run `docker compose exec app npx prisma db push`. To seed a dedicated non-production database, run the host command `DEMO_PASSWORD=<dedicated-value> npm run seed:demo` with `DATABASE_URL` pointed at that replica set; the standalone runtime image intentionally excludes development tooling.

## Upgrade and recovery

Back up MongoDB and test restoration before upgrades. Install the committed lockfile, regenerate Prisma Client, apply `prisma db push`, build, and run the documented regression checks. Roll back application code only alongside a compatible database backup/restore plan. Password reset uses Resend; verify a permitted inbox after every production configuration change.
