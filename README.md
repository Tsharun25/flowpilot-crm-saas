# FlowPilot CRM SaaS

FlowPilot CRM SaaS is a premium full-stack SaaS CRM and project management application built with Next.js, TypeScript, Tailwind CSS, MongoDB, Prisma, NextAuth.js, Recharts, Sonner, and Lucide React.

It includes authentication, protected dashboard routes, workspace-based architecture, project management, Kanban tasks, CRM pipeline, won-deal analytics, profile/workspace settings, toast notifications, loading skeletons, demo data seeding, and a responsive premium UI.

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

FlowPilot 1.2 intentionally ships as a focused CRM/project-management starter. It does not include client-linked projects, won-deal conversion, dated client activity, search/filter, CSV export, or a due-date/overdue UI. The optional task `dueDate` database field is reserved for buyer customization. Do not advertise these roadmap items as included features.

- User registration and login
- Password hashing with bcryptjs
- Protected dashboard routes
- Workspace-based SaaS structure
- Project creation, editing, archiving, and deletion
- Task creation, editing, status management, and deletion
- Kanban task board
- CRM client pipeline
- Exact two-decimal USD deal values
- Live dashboard stats
- Analytics chart
- Profile and workspace settings
- Toast notifications
- Loading skeletons
- Responsive dashboard UI
- Demo data seeding
- Premium SaaS landing page
- Mobile responsive sidebar
- Documented Vercel deployment and configuration checklist

### Role scope

- `OWNER` and `ADMIN`: authenticated create/edit/status workflows, destructive project/task/client actions, and workspace identity changes.
- `MEMBER`: authenticated create/edit/status workflows; destructive project/task/client actions and workspace identity changes are denied.
- Every role can update its own profile name.
- The shared public demo workspace identity is locked even though its demo user has the `OWNER` role.

All application reads and writes are scoped through the signed-in user's resolved workspace context. A controlled two-account authorization/IDOR test is still required before treating a customized deployment as independently security-verified; see [Security Policy](SECURITY.md) and [Release Audit](AUDIT_REPORT.md).

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

NEXTAUTH_URL="http://localhost:3000"
```

For production:

```env
DATABASE_URL="your-production-mongodb-url"

NEXTAUTH_SECRET="your-production-secret"

NEXTAUTH_URL="https://flowpilot-crm-saas.vercel.app"
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

## Upgrading to 1.2.0

Back up MongoDB, install the locked dependencies, regenerate Prisma Client, and apply the additive schema change:

```bash
npm ci
npx prisma generate
npx prisma db push
```

Version 1.2 adds optional `Client.valueCents` storage as a MongoDB `long`/Prisma `BigInt` and a persistent `Workspace.isDemo` marker. Existing records remain readable: when `valueCents` is absent, FlowPilot interprets the legacy integer `value` as whole USD and converts it to cents at read time. Creating or re-saving a client writes the exact amount to `valueCents` while retaining a truncated legacy `value` for backward compatibility. No automatic destructive money backfill is performed.

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
NEXTAUTH_URL
```

After changing environment variables in Vercel, redeploy the project.

Before processing real customer data, configure private production secrets, provision a supported MongoDB replica set, run the Prisma schema sync, replace the public demo credentials, and verify security, workspace isolation, accessibility, backups, and recovery in the target environment. FlowPilot is a self-hosted starter, not a security-audited or turnkey hosted service.

Docker/VPS instructions are included, but the 1.2 release candidate has not been built in Docker in the current audit environment because the Docker CLI was unavailable. Treat that route as `BLOCKED` until tested on a Docker-capable host.

---

## Project Highlights

FlowPilot CRM SaaS demonstrates:

- Full-stack SaaS architecture
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
