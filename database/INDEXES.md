# MongoDB schema and indexes

`prisma/schema.prisma` is the authoritative schema. From a configured clean database, run:

```bash
npx prisma generate
npx prisma db push
```

This creates the collections and declared unique/compound indexes. MongoDB must be a replica set because FlowPilot uses transactions. The guarded synthetic demo seed is available through `npm run seed:demo`; it must only target a dedicated demo database.

FlowPilot's CRM pipeline is intentionally represented by the `ClientStatus` enum (`LEAD`, `CONTACTED`, `WON`, `LOST`) rather than separate configurable Pipeline/Stage collections. The UI groups clients by this status, and conversion records make Won conversion idempotent.

Project deletion manually removes its tasks and conversion record in one transaction; client deletion unlinks projects and removes conversion, note, and activity records before deleting the client. These explicit application transactions are deliberate for MongoDB and are covered by isolated workflow tests instead of relying on implicit relation cascades.
