# FlowPilot CRM

FlowPilot CRM is a self-hosted CRM and project management starter for freelancers and small agencies. It keeps client opportunities, linked projects, tasks, notes, follow-ups, exports, and deal-value reporting in one workspace.

It includes authentication, protected dashboard routes, workspace-based architecture, client-linked projects, idempotent Won-deal conversion, dated follow-ups and tasks, client notes/activity, search and filters, safe CSV export, won-deal analytics, and a responsive premium UI.

FlowPilot is distributed as a self-hosted application starter. The public demo and included deployment guides demonstrate the shipped workflows; they do not certify a buyer's customized environment for production use.

---

## Live Demo

[https://flowpilot-crm-saas.vercel.app](https://flowpilot-crm-saas.vercel.app)

---

## Demo Login

```txt
Email: demo@flowpilot.com
Password: DemoFlow2026!
```

---

## Features

FlowPilot 1.4 ships the focused agency workflow described below. It remains a self-hosted starter.

- User registration and login
- Password hashing with bcryptjs
- Protected dashboard routes
- Workspace-based data isolation
- Project creation, editing, archiving, and deletion
- Task creation, editing, status management, and deletion
- Kanban task board
- CRM client pipeline
- Optional client-to-project links with safe unlinking on client deletion
- Idempotent Won-deal conversion to one linked project
- Editable UTC date-only follow-ups and task due dates with overdue states
- Timestamped client notes plus status/conversion activity
- Workspace-scoped client, project, and task search/filters
- Filtered CSV export with Unicode, quoting, newline, and spreadsheet-formula safeguards
- Shared MongoDB-backed login and registration rate limits
- Exact two-decimal USD deal values
- Live dashboard stats
- Analytics chart
- UTC year selector backed by recorded `wonAt` close timestamps
- Read-only public demo enforcement across all dashboard mutations
- Privacy, terms, support, canonical, Open Graph, Twitter, robots, and public-only sitemap routes
- Profile and workspace settings
- Toast notifications
- Loading skeletons
- Responsive dashboard UI
- Demo data seeding
- Responsive product landing page
- Mobile responsive sidebar
- Documented Vercel deployment and configuration checklist

### Role scope

- `OWNER` and `ADMIN`: authenticated create/edit/status workflows, destructive project/task/client actions, and workspace identity changes.
- `MEMBER`: authenticated create/edit/status workflows; destructive project/task/client actions and workspace identity changes are denied.
- Every role can update its own profile name in a normal workspace.
- The shared public demo is read-only even though its demo user has the `OWNER` role.

### Not included

Subscription billing, invoicing, invitations, advanced team collaboration, outbound password-reset email, automated campaigns/reminders, drag-and-drop, a mobile app, client portal, managed hosting/backups, or production security certification. Operator-assisted account recovery is documented in [HowToSetup.md](HowToSetup.md).

All application reads and writes are scoped through the signed-in user's resolved workspace context. A controlled two-account browser/database audit covers protected routes, cross-workspace reads, scoped export, client-link options, a scoped write, and a nested task read. It is useful evidence, not a penetration-test certification; see [Security Policy](SECURITY.md) and [Release Audit](AUDIT_REPORT.md).

---

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- MongoDB
- Prisma ORM
- NextAuth.js
- bcryptjs
- Recharts
- Sonner
- Lucide React

---

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/flowpilot?retryWrites=true&w=majority"

NEXTAUTH_SECRET="your-secret-key"

RATE_LIMIT_SALT="a-separate-long-random-secret"

NEXTAUTH_URL="http://localhost:3000"

NEXT_PUBLIC_SITE_URL="http://localhost:3000"

NEXT_PUBLIC_SUPPORT_URL="https://your-domain.com/support"
```

For production:

```env
DATABASE_URL="your-production-mongodb-url"

NEXTAUTH_SECRET="your-production-secret"

RATE_LIMIT_SALT="your-production-rate-limit-salt"

NEXTAUTH_URL="https://flowpilot-crm-saas.vercel.app"

NEXT_PUBLIC_SITE_URL="https://flowpilot-crm-saas.vercel.app"

NEXT_PUBLIC_SUPPORT_URL="https://your-domain.com/support"
```

---

## Installation

```bash
npm ci
npx prisma generate
npx prisma db push
npm run dev
```

Open the local app:

```txt
http://localhost:3000
```

---

## Seed Demo Data

Run:

```bash
npm run seed:demo
```

This explicitly resets a dedicated FlowPilot demo workspace and creates sample projects, tasks, clients, CRM pipeline data, and dashboard content. New demo workspaces receive a persistent `isDemo` marker; documented legacy demo slugs are recognized only for `demo@flowpilot.com` and are upgraded to that marker. It is destructive within that demo workspace; never run it against a workspace containing real data. Plain `npm run seed` refuses to proceed without the confirmation flag.

The public demo reset is not scheduled by the application. The operator must run it manually or configure a trusted external schedule, and must keep the demo database separate from real customer data.

---

## Upgrading to 1.4.1

Back up MongoDB, install the locked dependencies, regenerate Prisma Client, and apply the additive schema change:

```bash
npm ci
npx prisma generate
npx prisma db push
```

Version 1.3 keeps the 1.2 money compatibility behavior and adds optional project/client links, optional UTC date-only follow-up/due-date values, conversion records, notes, activity, and rate-limit collections/indexes. Existing internal projects and undated clients/tasks remain valid. Back up MongoDB before `npx prisma db push`; the application does not perform a destructive bulk backfill.

Historic Won records without `wonAt` remain in the all-time Won total but are not assigned to a monthly chart bucket until an operator supplies a date through an approved migration or the record's Won state is re-saved.

---

## Build

```bash
npm run build
```

---

## Deployment

The public demo is deployed on Vercel. The repository includes documented Vercel and Docker/VPS deployment routes; these are setup guides, not a claim that every buyer environment has been independently certified for production.

Live URL:

```txt
https://flowpilot-crm-saas.vercel.app
```

Required Vercel environment variables:

```env
DATABASE_URL
NEXTAUTH_SECRET
RATE_LIMIT_SALT
NEXTAUTH_URL
```

After changing environment variables in Vercel, redeploy the project.

Before processing real customer data, configure private production secrets, provision a supported MongoDB replica set, run the Prisma schema sync, replace the public demo credentials, and verify security, workspace isolation, accessibility, backups, and recovery in the target environment. FlowPilot is a self-hosted starter, not a security-audited or turnkey hosted service.

Docker/VPS instructions are included, but the 1.4.1 release candidate has not been built in Docker in the current audit environment because the Docker CLI was unavailable. Treat that route as `BLOCKED` until tested on a Docker-capable host.

---

## Project Highlights

FlowPilot CRM includes:

- Full-stack self-hosted architecture
- Real authentication system
- Protected dashboard experience
- MongoDB database integration
- Workspace-based data structure
- Server Actions
- Validated project, task, and client management
- Kanban workflow
- CRM pipeline management
- Analytics dashboard
- Working public demo deployment on Vercel
- Responsive premium UI/UX

---

## Author

Built by Harun as a commercial SaaS starter project.

---

## License

Copyright remains with the seller. Marketplace purchases are licensed under the Vibe96 Standard License supplied with the order. See `SUPPORT.md` for included support and updates.

## Security and third-party software

- [Security Policy](SECURITY.md)
- [Release Audit](AUDIT_REPORT.md)
- [Correction Report](FIX_REPORT.md)
- [Third-Party Software Notices](THIRD_PARTY_NOTICES.md)
- [Setup and Deployment Guide](HowToSetup.md)
