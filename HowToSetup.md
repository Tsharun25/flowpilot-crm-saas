# FlowPilot CRM — Setup Guide

This guide starts FlowPilot CRM on a clean machine. No production credentials are included in the source archive.

FlowPilot is provided as a self-hosted starter. The documented deployment routes describe the required setup, but they are not a security or production certification for every environment. Before processing real customer data, replace the public demo credentials and verify authentication, workspace isolation, accessibility, backups, recovery, monitoring, and infrastructure security in the target environment.

## Requirements

- Node.js 20 LTS or newer
- npm 10 or newer
- MongoDB Atlas or a MongoDB replica set

MongoDB must run as a replica set because Prisma transactions are used for controlled project deletion, status activity, Won-deal conversion, and password reset. MongoDB Atlas clusters meet this requirement. FlowPilot 1.5 uses USD as its single display currency, stores new or edited deal amounts as exact integer cents, and groups won deals into calendar months using UTC.

## Local installation

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`, `NEXTAUTH_SECRET`, `RATE_LIMIT_SALT`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`, `PASSWORD_RESET_ORIGIN`, `NEXT_PUBLIC_SUPPORT_URL`, `RESEND_API_KEY`, and `EMAIL_FROM`.
3. Install and prepare the application:

```bash
npm ci
npx prisma generate
npx prisma db push
npm run seed:demo
npm run dev
```

Open `http://localhost:3000`. The explicit `seed:demo` command creates `demo@flowpilot.com` with password `DemoFlow2026!` and marks its workspace with the persistent `isDemo` flag. For upgrades, the seed recognizes the documented legacy demo slug patterns once and then persists that marker. It deletes that demo workspace's existing projects, tasks, and clients, so run it only against a dedicated demo database. The public demo is read-only across project, task, client, note, conversion, profile, and workspace mutations; the server enforces this from the persisted workspace marker. Change or remove this account before accepting real users. Plain `npm run seed` intentionally refuses to delete data without the confirmation flag.

Demo reset scheduling is not built in. Run the reset manually or through infrastructure you control, and never reuse the demo database for real customer data.

## Upgrade an existing installation to 1.5.5

1. Back up the MongoDB database and verify that the backup can be restored.
2. Install the release lockfile and regenerate Prisma Client.
3. Apply the additive schema update before accepting writes from the new application version.

```bash
npm ci
npx prisma generate
npx prisma db push
```

The 1.5 update adds the `PasswordResetToken` collection and indexes. Existing users and workspaces are unchanged. Successful password reset increments `User.sessionVersion`, invalidating earlier JWT sessions on their next protected request.

The earlier optional `wonAt` behavior is unchanged: historic Won records without a close date remain in the all-time Won total but do not appear in a monthly chart bucket until a date is established by an operator-controlled migration or by re-saving their Won state.

## Production build

```bash
npm ci
npx prisma generate
npx prisma db push
npm run build
npm start
```

Set `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`, and `PASSWORD_RESET_ORIGIN` to the final HTTPS origin. Use a unique secret generated with `openssl rand -base64 32`.

## Deployment route 1: Vercel

1. Import the Git repository into Vercel.
2. Add every variable from `.env.example` with production values.
3. Keep the standard Next.js build command (`npm run build`).
4. Run `npx prisma db push` once against the production database before first use.
5. Deploy, then set `NEXTAUTH_URL` to the final domain and redeploy.

## Deployment route 2: Docker / VPS

For a one-command local self-hosted stack, copy `.env.example` to `.env`, replace every placeholder, and run:

```bash
docker compose up --build -d
docker compose exec app npx prisma db push
```

The included Compose file starts MongoDB as a single-node `rs0` replica set for evaluation/self-hosting and connects the application to it. Do not expose MongoDB publicly. Production operators must add authentication, encrypted transport, backups, monitoring, and an appropriate multi-node/managed replica set.

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

## First owner login and branding

For a normal installation, open `/register` and create the first account; it receives an `OWNER` membership in its new workspace. Do not use the shared demo account for production. After login, use **Settings** to change the profile and workspace name.

Branding text and public metadata live in `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/opengraph-image.tsx`, and `src/lib/version.ts`. The icon is `src/app/icon.svg`; global colors and layout tokens are in `src/app/globals.css`. Rebuild and recheck responsive layouts after changing them.

## Verification

```bash
npm run lint
npm run build
npm audit --omit=dev
```

Test registration, login/logout, project CRUD, task status changes, client pipeline changes, settings, mobile navigation, and workspace isolation before launch.

FlowPilot treats follow-up and due-date inputs as calendar dates stored at `00:00:00 UTC`. A non-completed task is overdue only when its date is earlier than the current UTC calendar date; completed tasks are labeled completed rather than overdue. CSV downloads contain the currently filtered rows, are capped at 5,000 records, include a UTF-8 BOM, quote all cells, and prefix formula-like cells.

The browser audit and screenshot scripts need Chromium. Install Playwright's browser once, start the application (and seed only a dedicated demo database), then run the checks in a second terminal:

```bash
npx playwright install chromium
npm run audit:a11y
npm run audit:responsive
npm run audit:demo-readonly
npm run audit:isolation
npm run screenshots
```

By default the scripts use `http://localhost:3000`. The demo-readonly and screenshot scripts use the documented demo credentials; workflow and isolation checks create temporary non-demo workspaces and remove them afterward. Override `DEMO_URL`, `DEMO_EMAIL`, and `DEMO_PASSWORD` when needed. If you use an existing Chromium-family browser instead of Playwright's download, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to its executable path.

Run mutation suites only against an isolated test database and opt in explicitly:

```bash
CONFIRM_ISOLATED_MUTATION=1 npm run audit:workflow
CONFIRM_ISOLATION_MUTATION=1 npm run audit:isolation
```

The legacy money and task-priority entry points now delegate to the isolated workflow so they never mutate the shared demo. Use the isolated opt-in flag:

```bash
CONFIRM_ISOLATED_MUTATION=1 npm run audit:money-browser
CONFIRM_ISOLATED_MUTATION=1 npm run audit:task-priority
```

Run the monetary acceptance cases `0`, `0.01`, `1250.50`, and `$1,000,000,000.00` through both create and edit workflows. Confirm exact values after reload in cards, open/won/lost totals, overview metrics, and chart tooltips. Confirm that negative values, exponent notation, non-finite values, out-of-range values, and more than two decimal places are rejected.

Authorization policy in 1.4:

- `OWNER` and `ADMIN` may delete projects, tasks, and clients and rename the workspace.
- `MEMBER` may use authenticated create, edit, and status workflows but may not perform those destructive actions or rename the workspace.
- Every role may update its own profile name in a normal workspace.
- The persisted public demo workspace is read-only for every role; direct server-action requests are rejected.

## Email password reset

FlowPilot sends transactional email through the Resend HTTPS API. Create a Resend account, verify the sender domain, publish the DNS records Resend provides, create a restricted production API key, and set `RESEND_API_KEY` plus `EMAIL_FROM`. Set the server-only `PASSWORD_RESET_ORIGIN` to the exact trusted HTTPS origin; reset links are never built from request headers or the public metadata fallback. Production rejects a missing value, HTTP, credentials, paths, queries, fragments, and malformed URLs before account lookup or token issuance. `next dev` may use the documented `http://localhost:3000` default or another explicit localhost origin; a production server always requires HTTPS. Do not expose the API key through a `NEXT_PUBLIC_` variable.

Reset tokens use 32 cryptographically random bytes, are stored only as SHA-256 hashes, expire after 20 minutes, and are single-use. Successful reset changes the bcrypt password, increments `sessionVersion`, and consumes every other active reset token in one MongoDB transaction. Request limits are stored in the shared MongoDB `RateLimit` collection: 8 requests per IP and 3 per account per hour. Completion is limited to 10 attempts per IP per hour. The public demo is denied server-side while keeping the request response neutral.

Production never prints reset links. When email configuration is absent, the endpoint reports that delivery is unavailable and directs the user to support. Provider delivery failures are logged without tokens, URLs, message bodies, credentials, or recipients. Verify delivery to a permitted inbox, link origin, expiry, and password-change notification before opening registration. Provider acceptance is not proof of inbox delivery.

## Operator-assisted recovery fallback

If the user no longer controls their email or delivery is unavailable, an operator may use this guarded fallback only after privately verifying the account owner and taking a backup. Keep the password out of shell history where possible and clear the environment values afterward:

```bash
CONFIRM_OPERATOR_PASSWORD_RESET=1 RECOVERY_EMAIL="owner@example.com" RECOVERY_PASSWORD="NewPrivatePass123" npm run operator:reset-password
```

The command requires a 12–128 character password containing uppercase, lowercase, and a digit, hashes it with bcrypt, increments `sessionVersion`, and never prints the credential. Existing JWT sessions become invalid on their next authenticated request; a fresh login with the new password receives the new version.

The guarded two-account audit tests fresh sessions, anonymous route protection, cross-workspace client/project reads, filtered export isolation, client-link selector isolation, one scoped write, and a nested task lookup. Run it only in an isolated test environment with `CONFIRM_ISOLATION_MUTATION=1`. Login attempts are limited per hashed IP/email pair and registration attempts per hashed IP through the shared MongoDB `RateLimit` collection. `RATE_LIMIT_SALT` must be private and consistent across instances. Add edge/WAF protection as an additional layer for high-risk deployments.

The Docker route is documented but was `BLOCKED` in the current audit environment because the Docker CLI was unavailable. Test `docker build` and the running container on a Docker-capable host before claiming that route as verified.

See [Security Policy](SECURITY.md), [Release Audit](AUDIT_REPORT.md), [Correction Report](FIX_REPORT.md), and [Third-Party Software Notices](THIRD_PARTY_NOTICES.md) before release.

## Common issues

- `PrismaClientInitializationError`: verify the MongoDB URL and network allow-list.
- Login redirects back to login: confirm `NEXTAUTH_SECRET` and the exact HTTPS `NEXTAUTH_URL`.
- Empty dashboard: create data through the UI, or run `npm run seed:demo` only in a dedicated demo database.
