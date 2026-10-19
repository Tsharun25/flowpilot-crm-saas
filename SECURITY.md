# Security Policy

## Supported version

Security fixes are applied to the latest published FlowPilot release. Buyers receive updates according to the support and update period recorded with their Vibe96 purchase.

## Reporting a vulnerability

Buyers should open a private Vibe96 support ticket and include the affected FlowPilot version, reproduction steps, and impact. Do not include passwords, database connection strings, API keys, session tokens, production customer data, or public proof-of-concept details.

## Deployment responsibilities

FlowPilot is a self-hosted starter. Before processing real customer data, the operator must:

- replace the public demo account and use unique production secrets;
- restrict MongoDB network access and maintain tested backups;
- serve the application over HTTPS;
- apply schema changes and dependency updates in a staging environment first;
- verify workspace isolation and role permissions after customization;
- configure monitoring, rate limiting, recovery procedures, and any jurisdiction-specific privacy controls required by the deployment.

The repository intentionally contains no telemetry, analytics tracker, hidden outbound service, licensing lock, or production credential.
