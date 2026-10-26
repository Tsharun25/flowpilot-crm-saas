# FlowPilot 1.3.0 Remaining-Work Report

Date: 2026-10-26 · Branch: `main` · Starting revision: `08a345a`

This report separates implementation, testing, and deployment. `PASS` means the named scoped check ran; it is not a security, accessibility, or marketplace certification. No credential, token, connection string, or secret value is recorded.

| ID | Implemented? | Tested? | Deployed? | Files / commit | Actual evidence | Remaining blocker |
|---|---|---|---|---|---|---|
| F01 client-linked projects | Yes | PASS, scoped | Pending | `prisma/schema.prisma`, project/client pages and actions | Browser workflow created a client-linked project through Won conversion; project details displayed the client. Project create/edit selectors are populated only from the current workspace. Empty relation remains valid; client deletion unlinks projects before deleting client data. | Forged cross-workspace Server Action payload was source-reviewed and selector isolation was tested, but no external DAST/fuzzer certification. |
| F02 Won deal to project | Yes | PASS, scoped | Pending | `DealConversion`, client actions/pages | Unique `clientId` and `projectId` conversion records plus a transaction provide durable idempotency. Workflow retained `$1,234.56`, created one linked project, and exposed the existing-project control afterward. | Concurrent production load test not run; MongoDB replica set is mandatory. |
| F03 follow-up/due dates | Yes | PASS | Pending | schema, validators, client/project/task UI | Workflow created/reloaded a `2026-11-01` follow-up and a past due task, observed overdue, then observed completed-not-overdue. Unit check confirmed date-only storage at `00:00:00 UTC`; fields support blank clearing. | Email reminders are intentionally absent. Full global timezone matrix beyond UTC boundary logic is not a browser suite. |
| F04 notes/activity | Yes | PASS, scoped | Pending | `ClientNote`, `ClientActivity`, client detail/actions | Unicode multiline note persisted with authenticated author; status and conversion events are server-generated and ordered by timestamp/id. Unique request/event keys and conditional status updates prevent ordinary retry duplicates. React escapes note text. | Forged-author payload is impossible in shipped form/action API but no external penetration test. |
| F05 search/filters | Yes | PASS, scoped | Pending | client/project/task pages | Clients search name/company/email and filter status; projects search name and filter status/client/internal; tasks search title and filter project/status/priority/overdue. Workflow combined client search+Won filter and reset/no-results states are present. Inputs are bounded and every query carries workspace scope. | Performance tuning for very large workspaces is buyer-specific. |
| F06 CSV export | Yes | PASS | Pending | `/api/export/[resource]`, `src/lib/csv.ts` | Authenticated filtered exports cover clients/projects/tasks, cap at 5,000, emit UTF-8 BOM, quote commas/quotes/newlines, and prefix formula-like values. Workflow verified Unicode and `=2+2` safety; second-workspace export excluded the first workspace. | Spreadsheet behavior can vary by vendor; no XLSX format is shipped. |
| AUTH | Yes | PASS, scoped | Pending | auth configuration and isolation audit | Fresh sessions succeeded; anonymous protected-route access redirected to login; logout/protected-route behavior remains covered by the UI path. Password recovery is not advertised or shipped. | Artificial JWT expiry/time-travel was not tested. |
| ISOLATION | Yes | PASS, scoped | Pending | current-user helper, scoped actions/pages/export, isolation audit | Two temporary accounts/workspaces verified own access, cross-workspace client/project 404s, export exclusion, link-selector exclusion, zero-row scoped write, and nested task exclusion. All synthetic records were removed. | Opaque Server Action IDs were not externally fuzzed; this is not a penetration test. |
| RATE LIMITS | Yes | PASS, controlled | Pending | `RateLimit`, `rate-limit.ts`, login/register handlers | Atomic MongoDB `findAndModify` test observed counts `1,2,3` and rejection threshold metadata. Login uses hashed IP+email; registration uses hashed IP and returns `429` with `Retry-After`. | Edge/WAF controls remain recommended; sustained production attack testing was intentionally not run. |
| FAILURES | Partial | PASS for validation/retry cases; otherwise NOT TESTED | Pending | validators, pending buttons, actions | Invalid money/date/ID paths, duplicate note/conversion keys, repeated priority save, and rate-limit rejection have automated coverage. | Controlled database outage, transaction rollback injection, and every-form slow-network testing remain open. |
| RESPONSIVE | Yes | PASS, automated | Pending | responsive UI and audit script | No horizontal overflow across 9 routes at 360, 390, 768, 1024, 1280, 1366, and 1440 px: 63/63 combinations. Workflow also ran at 1366 px. | Physical touch devices, Safari/Firefox, and a formal 200% browser-zoom/manual usability certification remain open. |
| ACCESSIBILITY | Partial | PASS, automated scope | Pending | UI semantics and accessibility audit | 135/135 checks passed for titles, language, headings, landmarks, names, labels, IDs, image alternatives, noindex, basic focus visibility, and mobile drawer focus/Escape. | Axe/contrast tooling, screen reader, full keyboard-only, and manual 200% zoom remain open. |
| INSTALL | Yes | PASS, local | Pending | lockfile, setup guide, Dockerfile | Prisma validation/generation, schema sync, production build, standalone preparation/start, and authenticated workflow ran against a real MongoDB replica-set deployment. | Independent buyer-machine walkthrough not performed. |
| DOCKER | Documented | BLOCKED | No | `Dockerfile`, `HowToSetup.md` | Route and schema-sync commands are documented. | Docker CLI is unavailable on this machine; no build/run claim is made. |
| DATABASE | Yes | PASS, scoped | Pending | schema and setup docs | `npx prisma db push` applied four new collections and required indexes without deleting or rewriting existing records. Backup/restore and replica-set requirements are documented. | Backup restoration is an operator responsibility and was not exercised. |
| SECRETS/DEPENDENCIES | Partial | PASS for current dependency audit; partial otherwise | Pending | `.env.example`, security and third-party docs | Delivery excludes `.env`; both full and production-only `npm audit` reported zero known vulnerabilities on 2026-10-26 after updating Zod to 4.6.7. Direct dependencies remain pinned. | Independent full-history secret scan and legal/license review remain owner actions. |
| DEMO/BUYER MEDIA | In progress | NOT YET FINAL | Pending | seed, README, setup, listing, media scripts | Guarded seed now creates linked clients/projects plus dated synthetic records while retaining the sample-data disclosure. | Screenshots and release ZIP must be refreshed after deployment. |

## Commands and observed outcomes

- `npx prisma db push` — PASS; added `DealConversion`, `ClientNote`, `ClientActivity`, and `RateLimit` plus indexes. No destructive warning or record rewrite.
- `npm run build` — PASS with Next.js 16.4.2, TypeScript, 11 UI routes and 3 API route groups.
- `npm run test:workflow-utils` — PASS; UTC date parsing and safe CSV escaping.
- `npm run test:rate-limit` — PASS; atomic shared limit count/rejection behavior.
- `CONFIRM_DEMO_MUTATION=1 npm run audit:workflow` — PASS; complete synthetic agency workflow and cleanup.
- `CONFIRM_ISOLATION_MUTATION=1 npm run audit:isolation` — PASS; scoped two-account checks and cleanup.
- `CONFIRM_DEMO_MUTATION=1 npm run audit:task-priority` — PASS; High → Urgent → save → unchanged save → reload on both boards and cleanup.
- `npm run audit:a11y` — PASS 135/135 automated checks.
- `npm run audit:responsive` — PASS 63/63 route/viewport overflow combinations.

## Data and migration requirements

Back up MongoDB and test restoration before upgrading. Run `npm ci`, `npx prisma generate`, then `npx prisma db push` before routing 1.3 traffic. MongoDB must support replica-set transactions. Follow-up and due-date inputs are UTC calendar dates stored at UTC midnight. Existing projects without clients and records without dates remain valid. Set a private `RATE_LIMIT_SALT` consistently across application instances.

## Synthetic records changed

The workflow audit temporarily created one client, note, status/conversion activity, converted project, and dated task; cleanup removed them. The isolation audit temporarily created two users/workspaces and private resources; cleanup removed all of them. The atomic rate-limit test removed its test record. No QA-name wildcard deletion was used.

## Honest limitations

Docker remains blocked, manual screen-reader/cross-browser/200%-zoom work is open, artificial expired-session and database-failure injection are not complete, and no external penetration test, legal review, marketplace approval, sales, or income guarantee is claimed.
