# FlowPilot CRM — Vibe96 Listing Copy

## Short description

A polished, workspace-scoped CRM and project management SaaS starter with projects, Kanban tasks, sales pipeline, analytics, authentication, demo data, and responsive UI.

## Buyer value

FlowPilot gives agencies, consultancies, and small teams a credible starting point for launching a branded CRM or internal operations portal. Buyers receive readable TypeScript source, a working demo, sample data, and documented Vercel and Docker deployment routes.

## Core features

- Credential authentication with hashed passwords and protected dashboard routes
- Workspace-scoped data model with owner, admin, and member roles
- Project creation, editing, progress tracking, completion, and archiving
- Four-stage Kanban task workflow with priorities
- CRM lead pipeline, deal values, and status tracking
- Exact two-decimal USD amounts backed by integer-cent storage for new and edited records
- Dashboard KPIs and UTC monthly won-deal analytics (USD)
- Profile and workspace settings
- Pending submit states, error recovery, toast feedback, responsive sidebar, and mobile layout
- MongoDB seed data and demo account
- Documented Vercel and Docker/VPS deployment routes
- Setup, security, correction, audit, support, changelog, and third-party notice documents

## Technical details

- Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 4
- MongoDB with Prisma ORM
- NextAuth.js credential sessions and bcrypt password hashing
- Recharts, Lucide React, Sonner, and Zod
- 10 UI routes, 2 API routes, 6 database models, and 3 workspace roles
- Recommended server: Node.js 20+, 1 shared vCPU, 1 GB RAM for a small deployment

## Production-use scope

The public demo demonstrates the currently deployed workflows and a Vercel deployment; it does not independently certify every source feature or a buyer's configured environment. FlowPilot is supplied as a self-hosted starter, not as a security-audited or turnkey hosted service. Before using real customer data, the operator must configure private environment variables, provision a supported MongoDB replica set, synchronize the Prisma schema, replace the public demo credentials, and complete security, workspace-isolation, accessibility, backup, and deployment checks for their own environment.

In the shipped authorization policy, `OWNER` and `ADMIN` may delete projects, tasks, and clients and change workspace identity. `MEMBER` users may create, edit, and change statuses but may not perform those destructive actions or rename the workspace. A controlled two-account IDOR suite has not been completed, login/registration rate limiting is not included, and the Docker route remains unverified in the current audit environment because Docker was unavailable.

### Upgrade compatibility

Version 1.2 adds optional `Client.valueCents` as Prisma `BigInt`/MongoDB `long` for exact integer-cent amounts and a persistent `Workspace.isDemo` marker for the guarded shared-demo reset. Records without `valueCents` remain readable through the legacy whole-dollar `value` fallback; creating or re-saving a client writes `valueCents`. Existing operators must back up MongoDB and run `npx prisma db push` as documented—no silent destructive money backfill is included.

Buyers should review the [Security Policy](SECURITY.md), [Release Audit](AUDIT_REPORT.md), [Correction Report](FIX_REPORT.md), and [Third-Party Software Notices](THIRD_PARTY_NOTICES.md) before deployment.

## Suggested listing

- Category: Business & Operations / CRM
- Suggested launch price: $149–$199
- Live demo: https://flowpilot-crm-saas.vercel.app
- Demo login: `demo@flowpilot.com` / `DemoFlow2026!`

Keep the demo online throughout review and while listed. Use this account only with non-sensitive sample data.

The shipped product is a self-hosted CRM/project-management starter, not a hosted subscription service. Billing, subscriptions, invitations, password recovery, email automation, and drag-and-drop are not included. Operators should reset the dedicated demo workspace on a schedule and never connect it to production customer data.

The application does not schedule the demo reset itself; that remains a manual or operator-configured infrastructure task.

## Screenshot plan (1920 × 1080 PNG/JPG)

1. Landing page hero and product preview
2. Main dashboard with KPI cards and recent projects
3. Projects overview
4. Project details and four-column Kanban board
5. CRM pipeline with lead cards and deal values
6. Analytics dashboard with chart
7. Workspace settings and team roles

Use only real screens from the live product; do not include browser extensions, personal bookmarks, credentials, or customer data. The landing-page preview contains illustrative sample figures and an in-frame disclosure; keep that disclosure visible and do not present those figures as customer results, adoption, or earnings.
