# FlowPilot CRM 1.5 — Owner setup gate

These are the only owner-supplied values or external access still required. Do not paste secrets into source code, reports, marketplace messages, or ordinary chat.

| Required item | Configure here | Verification | Release blocker |
|---|---|---|---|
| Resend account, verified sender domain, production API key and sender identity | Vercel/server secrets: `RESEND_API_KEY`, `EMAIL_FROM`; DNS at the domain provider | Request a reset for a permitted test account, receive it, confirm the HTTPS link, complete reset, then receive the password-changed notice | Yes, for self-service recovery |
| Final trusted public origin | `NEXT_PUBLIC_SITE_URL` and `NEXTAUTH_URL` | Both equal the exact live HTTPS origin; received reset link uses it | Yes |
| Verified support/help-desk URL, handler and response-time commitment | `NEXT_PUBLIC_SUPPORT_URL`; operational details on the external help desk | Public Support CTA opens a functioning HTTPS channel and a test request reaches the responsible person | Yes |
| Operator identity/contact, jurisdiction, retention/deletion procedure, support/licensing commitments | Customize `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`, `SUPPORT.md`, and marketplace listing | Owner/legal review of rendered live pages and a test deletion request | Yes |
| Docker-capable test environment, if Docker/VPS is advertised as verified | Follow `DEPLOYMENT.md` | Build image, start container, check HTTP health/login/reset and record evidence | Yes only for a verified Docker claim |
| Vibe96 seller identity, payout, price and agreement decision | Vibe96 seller workflow | Owner reviews/signs the current agreement and completes marketplace checks | Yes for publication, not source build |

Optional follow-up: Safari/Firefox and physical-device checks, screen-reader/manual accessibility review, external penetration/load testing, and database-outage drills.
