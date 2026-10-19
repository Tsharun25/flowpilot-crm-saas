# FlowPilot CRM — Setup Guide

This guide starts FlowPilot CRM on a clean machine. No production credentials are included in the source archive.

FlowPilot is provided as a self-hosted starter. The documented deployment routes describe the required setup, but they are not a security or production certification for every environment. Before processing real customer data, replace the public demo credentials and verify authentication, workspace isolation, accessibility, backups, recovery, monitoring, and infrastructure security in the target environment.

## Requirements

- Node.js 20 LTS or newer
- npm 10 or newer
- MongoDB Atlas or a MongoDB replica set

MongoDB must run as a replica set because Prisma transactions are used for controlled project deletion. MongoDB Atlas clusters meet this requirement. FlowPilot 1.2 uses USD as its single display currency, stores new or edited deal amounts as exact integer cents, and groups won deals into calendar months using UTC.

## Local installation

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL`.
3. Install and prepare the application:

```bash
npm ci
npx prisma generate
npx prisma db push
npm run seed:demo
npm run dev
```

Open `http://localhost:3000`. The explicit `seed:demo` command creates `demo@flowpilot.com` with password `DemoFlow2026!` and marks its workspace with the persistent `isDemo` flag. For upgrades, the seed recognizes the documented legacy demo slug patterns once and then persists that marker. It deletes that demo workspace's existing projects, tasks, and clients, so run it only against a dedicated demo database. The public demo workspace identity is locked in the UI and server action. Change or remove this account before accepting real users. Plain `npm run seed` intentionally refuses to delete data without the confirmation flag.

Demo reset scheduling is not built in. Run the reset manually or through infrastructure you control, and never reuse the demo database for real customer data.

## Upgrade an existing installation to 1.2.0

1. Back up the MongoDB database and verify that the backup can be restored.
2. Install the release lockfile and regenerate Prisma Client.
3. Apply the additive schema update before accepting writes from the new application version.

```bash
npm ci
npx prisma generate
npx prisma db push
```

The update adds optional `Client.valueCents` storage as a MongoDB `long`/Prisma `BigInt` and adds the `Workspace.isDemo` marker. It does not delete or rewrite existing deal values. If an older document has no `valueCents`, FlowPilot treats its legacy integer `value` as whole USD at read time. Creating or re-saving a client writes the exact two-decimal amount to `valueCents` and keeps a truncated whole-dollar `value` for backward compatibility. Operators who want all records populated with `valueCents` should design and test a separate backup-aware migration; the application does not perform a silent bulk backfill.

The earlier optional `wonAt` behavior is unchanged: historic Won records without a close date remain in the all-time Won total but do not appear in a monthly chart bucket until a date is established by an operator-controlled migration or by re-saving their Won state.

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

Before starting the application container, apply the Prisma schema/index definitions once from a trusted host or one-off container with the production `DATABASE_URL`:

```bash
npm ci
npx prisma generate
npx prisma db push
```

Then build and run the image:

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

The browser audit and screenshot scripts need Chromium. Install Playwright's browser once, start the application (and seed only a dedicated demo database), then run the checks in a second terminal:

```bash
npx playwright install chromium
npm run audit:a11y
npm run audit:responsive
npm run screenshots
```

By default the scripts use `http://localhost:3000` and the documented demo credentials. Override `DEMO_URL`, `DEMO_EMAIL`, and `DEMO_PASSWORD` when needed. If you use an existing Chromium-family browser instead of Playwright's download, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to its executable path.

The monetary browser audit intentionally creates and removes four temporary client records. Run it only against a dedicated demo database and opt in explicitly:

```bash
CONFIRM_DEMO_MUTATION=1 npm run audit:money-browser
```

Run the monetary acceptance cases `0`, `0.01`, `1250.50`, and `$1,000,000,000.00` through both create and edit workflows. Confirm exact values after reload in cards, open/won/lost totals, overview metrics, and chart tooltips. Confirm that negative values, exponent notation, non-finite values, out-of-range values, and more than two decimal places are rejected.

Authorization policy in 1.2:

- `OWNER` and `ADMIN` may delete projects, tasks, and clients and rename the workspace.
- `MEMBER` may use authenticated create, edit, and status workflows but may not perform those destructive actions or rename the workspace.
- Every role may update its own profile name.

Before production, test that policy with two accounts in separate workspaces, including direct requests for project/task/client IDs belonging to the other workspace. This controlled two-account IDOR suite was `NOT TESTED` in the current audit. Login and registration rate limiting is not included; configure it at the edge or add a durable shared limiter before exposing a high-risk deployment.

The Docker route is documented but was `BLOCKED` in the current audit environment because the Docker CLI was unavailable. Test `docker build` and the running container on a Docker-capable host before claiming that route as verified.

See [Security Policy](SECURITY.md), [Release Audit](AUDIT_REPORT.md), [Correction Report](FIX_REPORT.md), and [Third-Party Software Notices](THIRD_PARTY_NOTICES.md) before release.

## Common issues

- `PrismaClientInitializationError`: verify the MongoDB URL and network allow-list.
- Login redirects back to login: confirm `NEXTAUTH_SECRET` and the exact HTTPS `NEXTAUTH_URL`.
- Empty dashboard: create data through the UI, or run `npm run seed:demo` only in a dedicated demo database.
