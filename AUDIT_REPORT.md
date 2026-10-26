# FlowPilot 1.3.0 Release Audit

Audit snapshot: 2026-10-26

## Summary

FlowPilot 1.3 implements the scoped agency workflow: client/project linking, idempotent Won conversion, follow-up and task dates, client notes/activity, combined search/filter controls, safe filtered CSV export, and shared authentication rate limits. Local production-build, business-workflow, two-account isolation, responsive, accessibility, schema-sync, and utility tests passed within the scopes below. Deployment and refreshed marketplace media are recorded only after the final commit reaches Vercel.

## Verification status

| Check | Status | Evidence / limitation |
|---|---|---|
| Prisma schema sync | PASS | `npx prisma db push` added four collections and indexes without a destructive warning or rewrite. Existing optional fields remain compatible. |
| Production build | PASS | Prisma generation, Next.js 16.4.2 compilation, TypeScript, route generation, and standalone preparation completed. |
| Agency workflow | PASS, SCOPED | Guarded browser run completed decimal lead → follow-up → note → Won → one linked project → overdue task → priority double-save → completion → search/filter → safe CSV; temporary records were removed. |
| Conversion idempotency | IMPLEMENTED / PASS, SCOPED | Unique client/project conversion indexes plus one transaction prevent durable duplicates; the UI returned the existing converted project. A concurrent production load test was not run. |
| Two-account isolation | PASS, SCOPED | Two temporary workspaces confirmed anonymous redirect, cross-workspace client/project 404, export exclusion, link-option exclusion, zero-row scoped write, and nested task exclusion. Opaque-action fuzzing/external penetration testing was not performed. |
| Rate limits | PASS, CONTROLLED | Shared MongoDB atomic counter produced `1,2,3` and threshold rejection metadata. Login keys hash IP+email; registration keys hash IP and returns `429`/`Retry-After`. Edge/WAF remains recommended. |
| Money/analytics regressions | PASS | Existing exact-cent validation and browser/unit coverage remain; workflow retained `$1,234.56`. Lost exclusion and Won analytics logic are unchanged. |
| Priority repeated-save | PASS | High → Urgent → save → unchanged save → reload remained Urgent on project and workspace boards. |
| Accessibility automation | PASS, SCOPED | 135/135 checks across public/authenticated/list/detail routes plus mobile drawer focus. This is not axe/contrast, screen-reader, or full manual keyboard certification. |
| Responsive automation | PASS, SCOPED | 63/63 route/viewport overflow checks across 360, 390, 768, 1024, 1280, 1366, and 1440 px. Physical devices, Safari/Firefox, and formal 200% zoom remain open. |
| Clean install/package | PASS LOCALLY | Locked install/build workflow and real MongoDB schema sync are documented. Independent buyer-machine execution remains open. |
| Docker | BLOCKED | Docker CLI is unavailable on this machine. Documentation exists; no container-runtime pass is claimed. |
| Production dependency audit | PASS | `npm audit --omit=dev` reported zero known vulnerabilities on 2026-10-26. |
| Full dependency audit | PASS | `npm audit` reported zero known vulnerabilities on 2026-10-26 after updating Zod to the patched 4.6.7 release. |
| Secrets/history/legal | PARTIAL | `.env` is excluded and environment examples contain placeholders. Independent full-history scanning and legal/license review remain owner actions. |

## Date and export semantics

Follow-up and due-date inputs are UTC calendar dates stored at `00:00:00 UTC`. Incomplete tasks earlier than today's UTC date are overdue; completed tasks are never presented as overdue. Exports contain the current filtered result, are capped at 5,000 rows, emit a UTF-8 BOM, quote all cells, and prefix cells beginning with spreadsheet formula characters.

## Release boundaries

FlowPilot remains a self-hosted starter. It does not include billing, invoicing, subscriptions, invitations, password recovery, outbound email/reminder automation, drag-and-drop, a client portal, managed backups, a reset scheduler, or hosted operations. Operators own secrets, HTTPS, MongoDB network/replica-set configuration, backups/restoration, monitoring, edge abuse controls, privacy compliance, and re-testing after customization. This audit does not guarantee defect-free operation, security certification, marketplace approval, sales, or income.
