# FlowPilot CRM architecture guide

Read `AGENTS.md` first; its security and data invariants are authoritative.

## Application layout

- `src/app`: Next.js App Router pages, layouts, route handlers, server actions, loading/error boundaries, and public metadata routes.
- `src/components`: shared interactive form and confirmation components.
- `src/lib/prisma.ts`: the shared Prisma client.
- `src/lib/auth.ts` and `src/lib/current-user.ts`: authentication and server-derived workspace context.
- `src/lib/crm-metrics.ts`: USD cents conversion and CRM/deal analytics.
- `src/lib/csv.ts`: spreadsheet-safe CSV serialization.
- `prisma/schema.prisma`: MongoDB models and indexes.
- `prisma/seed.ts`: guarded synthetic demo seed; `database/seed.ts` is the audit-friendly entry wrapper.
- `scripts`: unit/regression, browser, isolation, screenshot, and release helpers.

## Conventions and invariants

- Use TypeScript and App Router conventions; read the installed Next.js documentation before changing framework APIs.
- Derive user, role, and workspace on the server. Never trust workspace IDs or roles from forms or query strings.
- Scope every CRM read/write to the authenticated workspace and call `assertWorkspaceWritable` before dashboard mutations.
- Store deal values as integer USD cents and date-only values at UTC midnight.
- Preserve the read-only public demo policy and transactional/idempotent Won conversion.

## Verification

Run `npm run verify` for Prisma validation, unit/regression tests, lint, TypeScript, production build, and standalone assets. CSV behavior is covered by `npm run test:csv`; deal aggregation by `npm run test:metrics`; authorization/isolation by `CONFIRM_ISOLATION_MUTATION=1 npm run audit:isolation` against an isolated test database.
