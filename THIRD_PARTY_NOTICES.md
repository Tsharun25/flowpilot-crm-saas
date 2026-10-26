# Third-Party Software Notices

FlowPilot 1.4.1 uses the following direct open-source dependencies. Each dependency remains subject to its own license; this project does not relicense third-party code. Exact resolved versions, including transitive packages, are recorded in `package-lock.json`, and installed packages include their own license files and package metadata.

## Runtime dependencies

| Package | Version | License |
|---|---:|---|
| `@prisma/client` | 6.19.3 | Apache-2.0 |
| `bcryptjs` | 3.0.3 | BSD-3-Clause |
| `lucide-react` | 1.16.0 | ISC |
| `next` | 16.4.2 | MIT |
| `next-auth` | 4.24.15 | ISC |
| `react` | 19.2.4 | MIT |
| `react-dom` | 19.2.4 | MIT |
| `recharts` | 3.8.1 | MIT |
| `sonner` | 2.0.7 | MIT |
| `zod` | 4.6.7 | MIT |

## Development dependencies

| Package | Version | License |
|---|---:|---|
| `@tailwindcss/postcss` | 4.3.0 | MIT |
| `@types/node` | 20.19.41 | MIT |
| `@types/react` | 19.2.14 | MIT |
| `@types/react-dom` | 19.2.3 | MIT |
| `eslint` | 9.39.4 | MIT |
| `eslint-config-next` | 16.4.2 | MIT |
| `playwright` | 1.64.1 | Apache-2.0 |
| `prisma` | 6.19.3 | Apache-2.0 |
| `tailwindcss` | 4.3.0 | MIT |
| `tsx` | 4.22.0 | MIT |
| `typescript` | 5.9.3 | Apache-2.0 |

The `deepmerge-ts` transitive dependency is overridden to patched version 8.0.2 for CVE-2026-40345. Remove the override only after Prisma's MongoDB-compatible release depends on `deepmerge-ts` 8 or newer and the dependency audit remains clean.

The application UI uses Lucide icons and CSS-rendered shapes. No stock photos, customer logos, testimonials, or third-party marketing artwork are bundled. Marketplace screenshots are captures of this application using synthetic demo data.

FlowPilot's commercial distribution terms are provided through the Vibe96 Standard License supplied with a purchase. See the license files shipped by each dependency for its complete terms.

