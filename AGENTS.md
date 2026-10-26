<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## FlowPilot code map

- `src/app`: App Router pages, Route Handlers, Server Actions, loading/error boundaries, and public metadata routes.
- `src/lib`: authentication context, Prisma access, validation, CRM calculations, CSV safety, rate limiting, and demo policy.
- `prisma`: MongoDB schema and guarded synthetic demo seed.
- `scripts`: repeatable unit, browser, isolation, packaging, and audit helpers.

## Safe development invariants

- Authenticate and derive workspace identity on the server. Never accept a workspace ID or role from form/query input.
- Every client/project/task/note/conversion read and write must be scoped to the authenticated workspace.
- Call `assertWorkspaceWritable(workspace, user.email)` before every dashboard mutation. The public demo is browse/export only.
- Deal values use USD integer cents; date-only values use UTC midnight. `wonAt` is the close timestamp used for yearly/monthly won reporting.
- Won conversion is transactional and idempotent. Project deletion removes its tasks and conversion record; client deletion unlinks projects rather than deleting them.
- Use `npm run verify` before release. Mutation browser suites must use their explicit confirmation variables and isolated test data.
