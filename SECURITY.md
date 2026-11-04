# Security Policy

## Supported version

Security fixes are applied to the latest published FlowPilot release. Buyers receive updates according to the support and update period recorded with their Vibe96 purchase.

## Reporting a vulnerability

Buyers should open a private Vibe96 support ticket and include the affected FlowPilot version, reproduction steps, and impact. Do not include passwords, database connection strings, API keys, session tokens, production customer data, or public proof-of-concept details.

## Deployment responsibilities

FlowPilot is a self-hosted starter. Before processing real customer data, the operator must:

- replace the public demo account and use unique production secrets;
- keep the public demo `isDemo` marker intact while it is published; all shipped dashboard mutations reject marked demo workspaces server-side;
- restrict MongoDB network access and maintain tested backups;
- serve the application over HTTPS;
- apply schema changes and dependency updates in a staging environment first;
- verify workspace isolation and role permissions after customization;
- keep `RATE_LIMIT_SALT` private and consistent across instances, monitor the included MongoDB-backed authentication limits, add edge/WAF controls where appropriate, and configure recovery procedures plus any jurisdiction-specific privacy controls required by the deployment.

The repository intentionally contains no telemetry, analytics tracker, hidden outbound service, licensing lock, or production credential.

Self-service recovery uses owner-configured Resend delivery, hashed 20-minute single-use tokens, shared MongoDB rate limits, transactional consumption and `sessionVersion` invalidation. Keep `RESEND_API_KEY` and `PASSWORD_RESET_ORIGIN` server-only, verify the sender domain and exact trusted HTTPS origin, and test a permitted inbox before launch. Production fails closed before token issuance when the reset origin is missing or malformed. The guarded operator-assisted fallback remains documented in `HowToSetup.md` and never logs the new password.
