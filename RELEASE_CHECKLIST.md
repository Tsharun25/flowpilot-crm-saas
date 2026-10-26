# FlowPilot CRM 1.4.1 release checklist

## Automated gates

- [ ] `npm ci`
- [ ] `npx prisma validate` and `npx prisma db push` against an isolated/backup-protected database
- [ ] `npm run verify`
- [ ] `npm audit` and `npm audit --omit=dev`
- [ ] `CONFIRM_ISOLATED_MUTATION=1 npm run audit:workflow`
- [ ] `CONFIRM_ISOLATION_MUTATION=1 npm run audit:isolation`
- [ ] `npm run audit:demo-readonly`
- [ ] `npm run audit:a11y` and `npm run audit:responsive`
- [ ] Release archive inventory excludes `.env`, `.git`, `node_modules`, `.next`, logs, database dumps and private records

## Owner/submission gates

- [ ] Replace generic support destination and complete seller/business/legal identity
- [ ] Review Seller Agreement version shown at submission; current version 3.1 states 12 months of fixes/updates and 30 days of ticket replies within two business days
- [ ] Recheck current Vibe96 seller agreement and automated/human review requirements
- [ ] Keep the read-only demo online with synthetic data
- [ ] Confirm at least five current 1920×1080 screenshots and upload only after owner review
- [ ] Test Docker on a Docker-capable host or label it unverified
- [ ] Perform independent legal/license, screen-reader, Safari/Firefox and security review as appropriate

Do not label the product Vibe96-approved, fully audited, enterprise-ready, or guaranteed to generate income.
