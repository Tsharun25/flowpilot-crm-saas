# FlowPilot CRM deployment

FlowPilot is a self-hosted source-code starter. Both routes require Node.js 20+, a MongoDB replica set, private secrets, schema synchronization, HTTPS, backups, monitoring, and post-deployment verification.

## Required environment

Copy `.env.example`; replace every placeholder. `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` must be the final HTTPS origin. Keep `DATABASE_URL`, `NEXTAUTH_SECRET`, `RATE_LIMIT_SALT`, and `RESEND_API_KEY` server-only. Verify the `EMAIL_FROM` domain in Resend and configure `NEXT_PUBLIC_SUPPORT_URL` with the seller/deployment owner's HTTPS support page.

## Route 1 — Vercel

1. Import the repository and configure the environment variables.
2. From a trusted machine connected to the target database, run `npm ci`, `npx prisma generate`, and `npx prisma db push`.
3. Deploy with `npm run build`.
4. Verify `/`, `/robots.txt`, `/sitemap.xml`, login/logout, protected redirects, normal-workspace CRUD, demo read-only behavior, exports, and backup access.

The reference Vercel deployment has been exercised, but a buyer's environment remains their responsibility.

## Route 2 — Docker/VPS

Run schema synchronization from a trusted one-off environment, then:

```bash
docker build -t flowpilot-crm:1.5.1 .
docker run -d --name flowpilot-crm --env-file .env -p 3000:3000 flowpilot-crm:1.5.1
```

Terminate HTTPS with Caddy, Nginx, or a managed load balancer. Do not expose MongoDB publicly. The Dockerfile is included, but Docker runtime verification is blocked on the current audit machine because Docker CLI is unavailable.

## Upgrade and recovery

Back up MongoDB and test restoration before upgrades. Install the committed lockfile, regenerate Prisma Client, apply `prisma db push`, build, and run the documented regression checks. Roll back application code only alongside a compatible database backup/restore plan. Password reset uses Resend; verify a permitted inbox after every production configuration change.
