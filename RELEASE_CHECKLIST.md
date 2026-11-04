# FlowPilot CRM 1.5.2 release checklist

## Automated gates

- [x] `npm ci`
- [x] `npx prisma validate` and `npx prisma db push` against an isolated/backup-protected database
- [x] `npm run verify`
- [x] `npm audit` and `npm audit --omit=dev`
- [x] `CONFIRM_ISOLATED_MUTATION=1 npm run audit:workflow`
- [x] `CONFIRM_ISOLATION_MUTATION=1 npm run audit:isolation`
- [x] `npm run audit:demo-readonly`
- [x] `npm run audit:a11y` and `npm run audit:responsive`
- [ ] Rebuild the final archive from the S3/S4 correction revision; verify it excludes `.env`, `.git`, `node_modules`, `.next`, logs, database dumps and private records

## Owner/submission gates

- [ ] Replace generic support destination and complete seller/business/legal identity
- [ ] Review Seller Agreement version shown at submission; current version 3.1 states 12 months of fixes/updates and 30 days of ticket replies within two business days
- [x] Recheck current Vibe96 seller agreement and automated/human review requirements (2026-11-03; agreement 3.1, score 75+, no failing check, 65% seller share)
- [x] Live demo observed reachable and read-only with synthetic data on 2026-11-03; keep it online throughout review/listing
- [x] Eleven repository screenshots confirmed as 1920×1080; owner still chooses/uploads the final media set
- [x] Docker/VPS route is explicitly labelled documented but runtime-unverified; test it before making a verified claim
- [ ] Configure Resend/sender DNS/trusted origin and complete an owner-controlled real-inbox reset journey before advertising live recovery
- [ ] Perform independent legal/license, screen-reader, Safari/Firefox and security review as appropriate

Do not label the product Vibe96-approved, fully audited, enterprise-ready, or guaranteed to generate income.
