# FlowPilot CRM 1.5.2 — Owner setup gate

These are the only owner-supplied values or external access still required. Do not paste secrets into source code, reports, marketplace messages, or ordinary chat.

| Required item | Configure here | Verification | Release blocker |
|---|---|---|---|
| Resend account, verified sender domain, production API key, sender identity and owner-controlled disposable test inbox | Vercel/server secrets: `RESEND_API_KEY`, `EMAIL_FROM`; DNS at the domain provider; test account created only for verification | Receive the reset message, confirm its HTTPS link without recording the token, complete reset, receive the password-changed notice, confirm the old password/sessions fail and fresh login succeeds | Yes, for claiming working self-service recovery |
| Final trusted origins | `NEXT_PUBLIC_SITE_URL`, `NEXTAUTH_URL`, and server-only `PASSWORD_RESET_ORIGIN` | All equal the exact live HTTPS origin; invalid/missing reset origin fails closed before token issuance; a permitted inbox receives a link on that exact origin | Yes, before enabling reset email |
| Verified support/help-desk URL, handler and response-time commitment | `NEXT_PUBLIC_SUPPORT_URL`; operational details on the external help desk | Public Support CTA opens a functioning HTTPS channel and a test request reaches the responsible person | Yes |
| Operator identity/contact, jurisdiction, retention/deletion procedure, support/licensing commitments | Customize `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`, `SUPPORT.md`, and marketplace listing | Owner/legal review of rendered live pages and a test deletion request | Yes |
| Docker-capable test environment, only if Docker/VPS is advertised as runtime-verified | Follow `DEPLOYMENT.md` | Build image, start container, check HTTP health/login/reset and record evidence | No while the listing accurately says documented but unverified |
| Vibe96 seller identity, payout, price and agreement decision | Vibe96 seller workflow | Owner reviews/signs the current agreement and completes marketplace checks | Yes for publication, not source build |

Optional follow-up: Safari/Firefox and physical-device checks, screen-reader/manual accessibility review, external penetration/load testing, and database-outage drills.
