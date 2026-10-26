# Changelog

## 1.3.0 — 2026-10-26

- Added optional workspace-validated client links to project create/edit and linked-project context on client/project details.
- Added durable one-time Won-deal conversion backed by unique conversion records and MongoDB transactions.
- Added editable/clearable UTC date-only client follow-ups and task due dates with overdue, today, future, and completed states.
- Added timestamped plain-text client notes with author attribution and server-generated status/conversion activity.
- Added bounded workspace-scoped search and combined filters for clients, projects, and tasks.
- Added authorized filtered CSV exports with UTF-8, quoting/newline handling, a 5,000-row cap, and spreadsheet-formula safeguards.
- Added shared MongoDB-backed login and registration abuse limits with hashed identifiers.
- Added guarded end-to-end workflow, two-account isolation, rate-limit, date/CSV, responsive, and accessibility verification.
- Updated the synthetic demo seed, buyer documentation, marketplace listing, schema-sync instructions, and release evidence.

### Final audit corrections — 2026-10-20

- Fixed stale uncontrolled edit-form state after Server Action refreshes; task priority now remains synchronized after a save and an unchanged repeated save. Client, project, profile, and workspace edit forms use the same saved-value reset strategy.
- Added a guarded browser regression for `HIGH` to `URGENT` repeated saves across the project and workspace task boards.
- Recorded the earlier audit boundary that treated client-linked projects, won-deal conversion, dated activity, search/filter, CSV export, and due-date UI as roadmap scope; version 1.3 now ships those features.

## 1.2.0 — 2026-10-20

- Added exact two-decimal USD handling across client create/edit forms, cards, totals, analytics, and chart tooltips.
- Added optional MongoDB `Client.valueCents` storage using integer cents while preserving the legacy whole-dollar `value` field as a read fallback for existing records.
- Added server-side money validation for nonnegative amounts up to `$1,000,000,000.00`; exponent notation, non-finite values, and amounts with more than two decimal places are rejected.
- Labeled landing-page preview figures as illustrative sample data and replaced broad production-readiness claims with documented self-hosting prerequisites and limitations.
- Restricted project, task, and client deletion plus workspace identity changes to `OWNER` and `ADMIN`; regular `MEMBER` users retain authenticated create, edit, and status workflows.
- Made project deletion transactional and added scoped not-found checks to project, task, and client mutations.
- Hardened authentication failure recovery and made the destructive demo reset require the explicit `seed:demo` command against a persistently marked dedicated demo workspace.
- Locked the shared demo workspace identity, preserved safe legacy-demo upgrades, and added automated demo-safety tests.
- Added duplicate-submit pending states, a dashboard recovery boundary, and a standalone asset preparation step for reproducible local/VPS startup.
- Added route metadata, dashboard `noindex`, keyboard focus styles, form labels, mobile-dialog keyboard handling, an accessible chart summary, and an automated accessibility audit script.
- Pinned direct dependencies, patched the `deepmerge-ts` advisory through an override, and added security and third-party notice documentation.
- Documented the 1.2 schema upgrade, authorization scope, audit limitations, and marketplace disclosure requirements.

## 1.1.0 — 2026-10-18

- Replaced illustrative revenue data with workspace-scoped won-deal analytics.
- Defined Open Pipeline, Won Deal Value, and Lost Deal Value consistently in USD.
- Added client and task detail editing with scoped server validation.
- Improved populated CRM board layouts at desktop and tablet widths.
- Added singular/plural copy, status feedback, and destructive-action confirmations.
- Added six-viewport responsive auditing and focused CRM metric acceptance tests.

## 1.0.0 — 2026-10-18

- Initial commercial release.
- Workspace-scoped authentication and authorization.
- Project, task, Kanban, CRM pipeline, analytics, and settings modules.
- Vercel and Docker deployment paths.
- Validated Server Action inputs and workspace-scoped mutations.
- Security headers and reproducible setup documentation.
