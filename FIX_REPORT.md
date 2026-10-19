# FlowPilot 1.2.0 Correction Report

Date: 2026-10-20 · Source target: FlowPilot 1.2.0

This report records what is implemented in the current source tree and separates it from checks that have actually run. `IMPLEMENTED` is not the same as independently verified in a deployed environment. No production secret, password, session token, or database connection value is included.

## Re-audit findings R01–R03

| ID | Current status | Changes in 1.2.0 | Verification still required |
|---|---|---|---|
| R01: decimal USD values | IMPLEMENTED; AUTOMATED UNIT AND LOCAL BROWSER/DB ACCEPTANCE PASSED | Client create and edit inputs accept `0.01` increments and use decimal input hints. Server validation accepts ordinary nonnegative decimal strings with at most two fractional digits through `$1,000,000,000.00` and rejects exponent notation, non-finite values, negatives, extra precision, and out-of-range values. Exact amounts are stored in optional `Client.valueCents` as `BigInt`; cards, totals, overview metrics, analytics, and chart tooltips read integer cents and display two decimals. Existing documents without `valueCents` fall back to the legacy whole-dollar `value`. The guarded browser audit created, edited, reloaded, and then removed temporary `0`, `0.01`, `1250.50`, and upper-bound records; exact card values persisted. Native invalid cases and the 360px upper-bound card check passed. | The automated metric suite covers total/chart logic and server rejection cases. A human hover check of the final deployed chart tooltip remains part of final live review. |
| R02: illustrative homepage figures | IMPLEMENTED; LIVE RESPONSIVE CHECKS PASSED | The preview carries prominent `Illustrative dashboard` and `Sample data — not customer results` disclosures. `$750k`, growth, project/task/client counts, pipeline figures, and stage data are described as sample values rather than adoption, earnings, or customer outcomes. The disclosure remained visible in the scoped live responsive audit, and marketplace screenshots were recaptured from the deployed build. | Retain these disclosures in future marketing changes. |
| R03: production-readiness claim | IMPLEMENTED; LIVE DEPLOYMENT VERIFIED | Broad `Production-ready`/`Business-ready` wording was removed. Landing, README, setup guide, and listing describe a self-hosted starter, verified workflow scope, operator responsibilities, and deployment prerequisites. No billing, invitation, automation, or security-certification claim was added. | Recheck claims after future feature or listing changes. |

## R04 verification matrix

R04 was a request for evidence, not a confirmed defect list. The statuses below deliberately avoid turning source inspection into an end-to-end pass.

| Area | Status | Current evidence | Limitation / next check |
|---|---|---|---|
| Authentication and sessions | REVIEWED IN SOURCE / PARTIALLY TESTED | Dashboard routes and mutations derive the user and workspace from the server session; password hashes use bcrypt; registration handles malformed JSON and duplicate identities without a pre-query that discloses account existence. | Expired-session behavior, cookie behavior in the final deployment, sustained sign-in abuse, and forced authentication failures are `NOT TESTED`. Login and registration rate limiting is not implemented in the application; add a durable shared or edge limiter for exposed production use. |
| Workspace isolation / IDOR | REVIEWED IN SOURCE / NOT INDEPENDENTLY VERIFIED | Project, task, client, settings, and analytics queries are scoped through the authenticated workspace; nested task writes include the parent project/workspace relationship; malformed object IDs are rejected. | A controlled two-account suite covering reads, writes, nested IDs, deletes, and analytics is `NOT TESTED`. Do not describe workspace isolation as independently penetration-tested. |
| Input validation and deletion | REVIEWED IN SOURCE / FAILURE PATHS NOT TESTED | Zod schemas validate identifiers, enums, text, email, and money. `OWNER`/`ADMIN` are required to delete projects, tasks, and clients or change workspace identity. Project deletion checks workspace ownership and deletes its tasks/project in one Prisma transaction. Mutations check zero-row results. | Database outage, transaction rollback, stale concurrent writes, and retry behavior are `NOT TESTED`. |
| Dependencies, secrets, licenses, and assets | PARTIALLY VERIFIED | Exact direct versions and the lockfile are present. `npm audit --omit=dev --json` reported zero production vulnerabilities. The vulnerable `deepmerge-ts` path is overridden to 8.0.2. Direct licenses and bundled-asset provenance are recorded in `THIRD_PARTY_NOTICES.md`; environment files are excluded from delivery patterns. | Full `npm audit` still reports five high-severity development-only findings through `eslint-config-next -> fast-glob -> micromatch -> braces`; `braces` has no patched release beyond the currently resolved line, so this is disclosed rather than hidden. Full Git-history secret scanning and an independent legal/license review are `NOT TESTED`. |
| Responsive and accessibility | AUTOMATED CHECKS PASSED / MANUAL SCOPE OPEN | The source includes responsive layouts, a keyboard-operable mobile navigation dialog, visible focus styling, explicit form labels, progressbar semantics, a screen-reader chart summary, route metadata, dashboard `noindex`, and an automated accessibility audit script. The completed-tree accessibility audit passed 123/123 checks; the responsive audit passed 42/42 route/viewport combinations from 360px through 1440px, and the maximum money card also passed a 360px overflow check. | Safari/Firefox, physical touch devices, a full keyboard-only walkthrough, screen-reader use, automated contrast tooling, and 200% zoom are `NOT TESTED`. |
| Loading, failure, and duplicate submission | IMPLEMENTED / CONTROLLED FAILURE SUITE OPEN | Loading routes, toast feedback, confirmation controls, pending-state submit components, authentication network-error recovery, and a dashboard retry boundary exist. | Controlled database outage/rollback, stale-write, slow-network, and repeated-submit testing across every form are `NOT TESTED`. |
| Clean install and deployment | VERIFIED LOCALLY / VERCEL READY / DOCKER BLOCKED | A full `npm ci`, Prisma validation, unit tests, lint, production build, standalone asset preparation, server startup, and HTML/static-asset HTTP smoke test passed. The pushed 1.2 commit reached Vercel `Ready`, and live accessibility/responsive audits passed. Vercel/Docker prerequisites and schema-sync steps are documented. | Docker build/runtime is `BLOCKED` because the Docker CLI is unavailable in the audit environment. A MongoDB replica set is required for the transaction used by project deletion. |
| Listing, media, support, and demo operations | READY WITH DISCLOSED LIMITATIONS | Listing copy, setup, changelog, security policy, Vibe96-ticket support policy, third-party notices, and seven live 1920x1080 screenshot slots are present. The seed requires explicit destructive confirmation, uses a persistent demo marker, recognizes only the documented legacy demo identity, and refuses an unrelated workspace. A direct safety test passed, and plain `npm run seed` refused as designed. | Public-demo reset is a manual/operator-scheduled task; no scheduler is shipped. Final marketplace acceptance remains Vibe96's decision. |

## Final live UI finding A01

The reported task-priority repeated-save defect was confirmed in source. React preserved the uncontrolled editor state across the Server Action refresh, so the task card could show the saved priority while the still-mounted editor retained its previous value. Task edit forms now remount from the task's saved `updatedAt` version. Client and project editors use the same record-version strategy; profile and workspace editors reset from their saved identity values. A guarded live browser regression passed `HIGH -> URGENT -> save -> unchanged save -> reload`, verified both project and workspace task boards remained `URGENT`, and removed its temporary project.

## Monetary migration behavior

FlowPilot 1.2 uses a non-destructive compatibility strategy:

1. `valueCents` is optional so older MongoDB documents remain readable.
2. If `valueCents` exists, it is the authoritative exact USD amount in cents.
3. If it is absent, the legacy integer `value` is treated as whole USD and multiplied by 100 at read time.
4. Creating or re-saving a client writes exact `valueCents` and also keeps a truncated legacy `value` for backward compatibility.
5. Operators apply the additive schema/index change with `npx prisma db push`; no silent bulk backfill is performed.

Back up the database before applying the release. See `HowToSetup.md` for the complete sequence.

## Command evidence at report update

| Command / check | Result |
|---|---|
| `npm ci` | PASS — 451 packages installed from the lockfile and audited on a clean dependency restore. |
| `npm audit --omit=dev --json` | PASS — zero production vulnerabilities reported. |
| `npm audit` | DISCLOSED — five high-severity development-only findings in the ESLint toolchain path described above; no patched `braces` release is currently available. |
| `npm run verify` | PASS — Prisma validation, money tests, demo-safety tests, ESLint, TypeScript compilation, production build, and standalone asset preparation completed. |
| `npm run audit:money-browser` | PASS — four valid create/edit/reload cases, three native invalid cases, exact display, 360px overflow check, and cleanup completed against the dedicated demo. |
| `npm run audit:a11y` | PASS — 123/123 scoped automated checks. This is not a full manual accessibility certification. |
| `npm run audit:responsive` | PASS — 42/42 route/viewport overflow checks at six widths from 360px to 1440px. |
| Standalone server smoke test | PASS — root HTML and a generated static asset both returned HTTP 200. |
| Docker image build and container smoke test | BLOCKED — Docker CLI unavailable. |

## Owner actions before Vibe96 submission

1. Back up the intended database and run `npx prisma db push` before directing production traffic to 1.2.
2. Run an isolated two-account authorization/IDOR suite and add deployment-appropriate login/registration rate limiting.
3. Schedule a restricted reset of the dedicated demo workspace without connecting it to customer data.
4. Keep the seven live 1920×1080 marketplace screenshots and all sample-data disclosures current.
5. Test Docker on a capable host and complete an independent repository-history secret scan.

No marketplace approval score, income estimate, security certification, or sales guarantee is asserted.
