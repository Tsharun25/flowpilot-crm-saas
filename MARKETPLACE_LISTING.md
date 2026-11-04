# FlowPilot CRM — Self-hosted CRM & Project Management Starter

FlowPilot helps freelancers and small agencies track client opportunities, turn won work into linked projects, manage due tasks, record client notes, and review USD deal-value reporting from one responsive workspace.

## Included

- Next.js 16, React 19, TypeScript, Tailwind CSS, MongoDB/Prisma, NextAuth credentials authentication
- Workspace-scoped clients, projects, tasks, notes, activity and filtered CSV exports
- Idempotent Won-deal conversion, UTC follow-up/due dates, overdue states and inline task status updates
- Filter-consistent CRM totals and year-selectable won-value chart based on `wonAt`
- Read-only synthetic public demo, authentication rate limits, responsive navigation and accessible loading/error states
- Configurable email password reset with hashed 20-minute single-use tokens and prior-session invalidation; delivery requires the buyer/operator to configure Resend, a verified sender domain and the trusted HTTPS origin
- Vercel and Docker/VPS instructions, guarded seed, audit scripts, and eleven 1920×1080 synthetic screenshots

## Not included

Billing, subscriptions, invoices, invitations, advanced team collaboration, automated campaigns/reminders, drag-and-drop, a mobile app, client portal, managed hosting/backups, transactional-email provider account/domain verification/fees, or production security certification.

## Requirements

Node.js 20+, npm 10+, a MongoDB replica set, private environment values, schema synchronization, and buyer-operated hosting. Password-reset email additionally needs buyer-owned Resend credentials, a verified sender domain and an exact trusted HTTPS application origin. The Docker route is documented but was not runtime-tested on the current audit machine. Seller identity, support URL and price remain owner fields; review the current Vibe96 Standard License and Seller Agreement before signing.

## Demo and screenshots

Live reference: `https://flowpilot-crm-saas.vercel.app/`. The shared demo is read-only and contains synthetic data. Transactional email is not configured on that reference deployment, so its Forgot Password screen demonstrates the shipped UI and honest unavailable fallback rather than real inbox delivery.

Eleven 1920×1080 screenshots are under `marketplace-assets/screenshots/`: landing page, overview, projects, project details, CRM pipeline, client details, tasks/filters, analytics, settings, Forgot Password, and Reset Password.

The purchase is source code and documentation, not the sale of a hosted business. Marketplace approval, automated score, income and sales are not guaranteed.
