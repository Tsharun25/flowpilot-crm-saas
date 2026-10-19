# FlowPilot 1.2.0 Release Audit

Audit snapshot: 2026-10-20

## Summary

The 1.2 source candidate addresses the re-audit's decimal-money, illustrative-figure, and marketing-scope findings. The clean install, production build, scoped browser audits, and production dependency audit passed. The release is not presented as fully security-certified or deployment-certified: controlled two-account authorization testing, full manual accessibility/cross-browser testing, rate limiting, and a Docker run remain open as described below.

## Source evidence

- Deal values use exact integer-cent logic for new and edited records. Optional `Client.valueCents` preserves compatibility with existing MongoDB documents, which fall back to the legacy whole-dollar `value`.
- Money input is validated server-side for ordinary decimal syntax, nonnegative range, and at most two fractional digits. UI controls use a `0.01` step and display two decimal places.
- Landing-page preview figures are expressly labeled as illustrative sample data and not customer results.
- Marketing and setup documents consistently describe FlowPilot as a self-hosted starter with operator-owned production checks.
- Server actions obtain the current workspace from the authenticated server session. Project, task, client, settings, and analytics operations include workspace or parent-workspace constraints.
- `OWNER` and `ADMIN` are required for project/task/client deletion and workspace identity changes. Regular `MEMBER` users retain create/edit/status access but cannot perform those destructive operations.
- Project deletion verifies the scoped project and deletes child tasks and the project in a Prisma transaction. MongoDB therefore needs replica-set transaction support.
- The demo seed requires an explicit confirmation flag, persists an `isDemo` marker, safely upgrades only the documented legacy demo identity, and refuses to reset an unrelated non-demo workspace. The public demo workspace identity is locked; scheduling resets remains an operator task.
- Accessibility-oriented source changes include explicit labels, focus-visible styles, semantic progress output, an equivalent screen-reader chart summary, route metadata, dashboard `noindex`, and keyboard/focus handling for the mobile navigation dialog.
- Pending submit controls reduce accidental duplicate form submissions, authentication network failures recover in context, and the dashboard has a route-level retry boundary for unexpected failures.
- Edit forms remount from saved record versions after mutations, preventing stale uncontrolled values from overwriting newly saved task, client, project, profile, or workspace data on a repeated save.
- Security and third-party disclosures are available in `SECURITY.md` and `THIRD_PARTY_NOTICES.md`.

Source review supports these statements, but it is not a substitute for the open runtime checks below.

## Dependency audit

`npm audit --omit=dev --json` reported **zero production vulnerabilities** for the current lockfile.

The previously identified `deepmerge-ts` issue is resolved in the installed tree through the package override to version 8.0.2. Prisma remains pinned to the MongoDB-compatible 6.19.3 release line; Prisma 7 is not used for this MongoDB application.

Full `npm audit` still reports **five high-severity development-only advisories** in the lint/build tooling path:

```text
eslint-config-next -> fast-glob -> micromatch -> braces
```

The affected path is not imported by the application runtime, but the full audit is not clean. There is no patched `braces` release available beyond the currently resolved release line, so the limitation is recorded rather than suppressed or repaired through an incompatible dependency downgrade. Reassess it when the upstream toolchain publishes a compatible fix.

## Verification status

| Check | Status | Evidence / limitation |
|---|---|---|
| Production dependency audit | PASS | `npm audit --omit=dev --json`: zero vulnerabilities. |
| Full dependency audit | OPEN, DEVELOPMENT ONLY | Five high findings through the ESLint toolchain path above; no current patched `braces` release. |
| Clean dependency install | PASS | Full `npm ci` restored 451 packages from the lockfile. |
| Decimal-money unit/browser checks | PASS, SCOPED | Unit/server validation tests passed. A guarded local browser/DB audit created, edited, reloaded, verified, and removed temporary `0`, `0.01`, `1250.50`, and `$1,000,000,000.00` records; invalid native cases and the 360px upper-bound card check passed. |
| Task-priority repeated-save regression | PASS, LIVE AND SCOPED | The guarded live browser test passed `HIGH -> URGENT -> save -> unchanged save -> reload`, confirmed both project and workspace task boards remained `URGENT`, and removed its temporary project. The source fix resets uncontrolled editors from the saved record version. |
| Prisma validation, lint, TypeScript, and production build | PASS | `npm run verify` completed on the final source candidate, including standalone static/public asset preparation. |
| Accessibility and responsive browser audits | PASS, SCOPED | Accessibility automation passed 123/123 checks. Responsive automation passed 42/42 route/viewport overflow checks at 360, 390, 768, 1024, 1280, and 1440px. Cross-browser, screen-reader, hardware-touch, automated contrast, full keyboard-only, and 200% zoom testing are not complete. |
| Standalone server smoke test | PASS | The production server started and returned HTTP 200 for the landing HTML and a generated static asset. |
| Controlled two-account workspace/IDOR suite | NOT TESTED | Source scoping was reviewed, but isolated accounts must attempt cross-workspace reads, writes, nested-resource actions, deletes, and analytics requests. |
| Login/registration rate limiting | NOT IMPLEMENTED / NOT TESTED | Configure a durable edge/shared limiter or implement one appropriate to the hosting topology before a high-risk public deployment. |
| Forced failure/retry and duplicate-submit suite | PARTIALLY IMPLEMENTED / NOT FULLY TESTED | Pending submit controls, auth network-error recovery, and a dashboard retry boundary are implemented. Database outage, rollback, stale-write, slow-network, and repeated-submit behavior across every form still require controlled testing. |
| Current 1.2 Vercel deployment | PASS | Corrective commit `4d0d9a2` reached Vercel `Ready`; the earlier live accessibility audit passed 123/123 checks and the live responsive audit passed 42/42 route/viewport combinations. |
| Docker build and container smoke test | BLOCKED | Docker CLI is unavailable in the current audit environment. The documented route must be tested on a Docker-capable host. |
| Demo login and reset operations | PASS, GUARDED / MANUAL | Fresh login initially exposed stale demo credentials. The guarded reset succeeded only against the dedicated demo workspace, restored the documented credentials and clean sample records, and fresh authentication then completed the live regression. The application includes no scheduler; the owner must run or schedule resets safely. |
| Repository-history secret scan | NOT TESTED | Delivery ignores environment files and no production credentials are intentionally included; an independent full-history scan remains an owner action. |
| Third-party/legal review | PARTIALLY DOCUMENTED | Direct package licenses and bundled-asset provenance are listed. Independent legal review is outside this audit. |

## Release boundaries

FlowPilot is a self-hosted CRM/project-management starter. It does not include hosted billing, subscriptions, invitations, password recovery, outbound email automation, drag-and-drop, client-linked projects, won-deal conversion, dated client activity, search/filter, CSV export, a due-date/overdue UI, a managed backup service, a demo-reset scheduler, or an application-level distributed rate limiter. Deployment operators are responsible for private secrets, HTTPS, MongoDB network policy, replica-set availability, backups and restoration, monitoring, abuse controls, privacy requirements, and re-testing after customization.

This audit records evidence and limitations; it does not guarantee defect-free operation, marketplace acceptance, sales, income, or security certification.
