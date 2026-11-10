# FlowPilot CRM v1.5.6 — resubmission note

Submission: `SUB-2026-1044`  
Audit: `B0070-61368`

## What changed

- Added a new premium 16:9 cover and nine matching 16:9 product screenshots.
- Added a separate square 1080×1080 listing image.
- Added one-click Owner, Admin, and Member demo access on the login screen.
- Demo buttons now authenticate through a server-validated demo-only provider; no shared demo password is shipped to the browser or source archive.
- Refined the landing page with a premium hero, real product previews, features, benefits, and clear Live Demo calls to action.
- Refined the login, dashboard, admin/navigation shell, typography, spacing, colors, focus states, and responsive navigation.
- Verified public and authenticated pages at mobile, tablet, laptop, and desktop widths.

## Verification

- `npm run verify` — passed
- `npm run audit:demo-roles` — Owner, Admin, and Member passed
- `npm run audit:responsive` — passed at 360, 390, 768, 1024, 1280, 1366, and 1440 px
- `npm run audit:a11y` — passed

Live demo: `https://flowpilot-crm-saas.vercel.app/`
