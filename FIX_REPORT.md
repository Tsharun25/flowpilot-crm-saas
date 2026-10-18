# FlowPilot Correction Report

Date: 2026-10-18 · Release target: 1.1.0

No production secret, password, or database value is included in this report.

## Confirmed findings

| ID | Status | Change and evidence | Remaining limitation |
|---|---|---|---|
| F01 | FIXED | Static chart and invented growth were removed. `src/lib/crm-metrics.ts`, `src/lib/analytics.ts`, overview and Analytics now use workspace-scoped won deals grouped by `wonAt` in UTC for the current calendar year. Empty workspaces show an empty state. `npm run test:metrics` passed. | Existing Won records without `wonAt` are included in the all-time Won total but not backdated into the chart. Toggle/re-save them after deployment or migrate with a chosen historical date. |
| F02 | FIXED | Shared definitions: Open Pipeline = Lead + Contacted; Won Deal Value = Won; Lost Deal Value = Lost; USD is displayed consistently. The `$1,000` status acceptance cases pass in `scripts/test-crm-metrics.ts`. | Currency is currently a documented single-currency USD product setting, not per-workspace multi-currency. |
| F03 | FIXED | Client creation and board are stacked; cards use two columns from tablet and four only on very wide screens. Email truncates with full text in `title`. Responsive audit checks page-wide overflow. | Horizontal board scrolling was unnecessary after the new layout. |
| F04 | FIXED | Client cards now expose a prefilled Edit Client form for name, company, email and amount. The server action validates input and scopes the update by authenticated workspace. Totals revalidate. | Browser persistence test must run after the deployed database/schema update. |
| F05 | FIXED | Project task cards now expose a prefilled editor for title, description and priority while retaining the keyboard-accessible status selector. Server mutation is project- and workspace-scoped. | No drag-and-drop is claimed or implemented. |
| F06 | FIXED | Landing copy now describes a self-hosted starter and deal-value workflows, not a hosted subscription platform. Seed data remains restricted to the explicit seed command. | Public demo reset scheduling remains an owner deployment task. |
| F07 | PARTIALLY FIXED | Singular/plural task/client labels corrected; status selectors now show success/error toasts; destructive project/task/client actions require confirmation. Existing submit controls prevent duplicate submission where `SubmitButton` is used. | Failure-state testing under forced network/database failure was not performed. Some legacy forms still use native pending navigation rather than an inline error state. |

## Required verification

| ID | Status | Evidence | Remaining limitation / owner action |
|---|---|---|---|
| V01 | VERIFIED IN SOURCE | NextAuth credential sessions, bcrypt cost 12, protected server layout, and authentication inside every mutation via `getCurrentUserWithWorkspace`. | Expired-session and sign-in abuse/rate-limit tests are NOT TESTED. Password recovery is not shipped. |
| V02 | VERIFIED IN SOURCE / NOT FULLY TESTED | Reads and writes derive workspace from the session; nested task operations check their parent project workspace; malformed IDs are rejected. | A controlled two-account IDOR suite was not run against an isolated staging database. |
| V03 | VERIFIED IN SOURCE | Zod schemas enforce IDs, trimmed lengths, enums, email, integer nonnegative deal values and allowlisted updates. Prisma operations are scoped. Metric edge cases pass. | Destructive and database-failure cases were not executed against production. |
| V04 | PARTIALLY VERIFIED | `.env` is ignored, `.env.example` contains placeholders, secret-pattern scan found no tracked live credentials, lockfile exists, patched Next/Auth releases are used. See `AUDIT_REPORT.md`. | Prisma 6 MongoDB-compatible CLI retains a development-tree advisory; Prisma 7 does not support MongoDB. Full repository-history secret scanning and a third-party asset/license inventory remain owner review items. |
| V05 | PARTIALLY VERIFIED | Automated Chromium screenshots and horizontal-overflow checks cover landing plus six dashboard routes at 360, 390, 768, 1024, 1280 and 1440 CSS pixels. | Second browser engine, touch hardware, keyboard-only full pass and 200% zoom are NOT TESTED in this environment. |
| V06 | PARTIALLY VERIFIED | ESLint, TypeScript production build, loading routes, 404 behavior in code, and security headers are present. | Forced database outage, slow-network retry behavior, centralized production monitoring and restore drill are NOT TESTED. |
| V07 | PARTIALLY VERIFIED | README, `HowToSetup.md`, AGENTS/CLAUDE guidance, `.env.example`, Dockerfile, Vercel route, seed, changelog and support policy exist. | A fresh empty test database, Docker runtime and both deployment routes were not independently provisioned in this environment. MongoDB must be a replica set (Atlas satisfies this) for Prisma nested writes. |
| V08 | READY LOCALLY | Six authentic 1920×1080 screenshots, listing copy, setup requirements, support policy and changelog are included. | Regenerate screenshots after production deployment if live demo data differs. Seller must supply a real support contact and accept Vibe96 obligations. |

## Commands and outcomes

- `npx prisma generate` — PASS
- `npx prisma validate` — PASS
- `npm run test:metrics` — PASS
- `npm run lint` — PASS, zero warnings
- `npm run build` — PASS
- `npm run audit:responsive` — PASS when run against the local production server

## Owner actions before submission

1. Back up the database, then apply the additive `wonAt` schema/index change with `npx prisma db push` in the intended environment.
2. Run the safe demo seed only against the dedicated demo workspace/database, then deploy.
3. Validate public demo credentials and schedule a restricted demo reset; do not expose production customer data.
4. Complete the two-account staging authorization suite and clean-install/Docker test before claiming those items as fully verified.
5. Review repository history and third-party license/asset rights, add the actual support contact, and submit the updated screenshots.
