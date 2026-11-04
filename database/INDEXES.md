# MongoDB schema and indexes

`prisma/schema.prisma` is the authoritative schema. From a configured clean database, run:

```bash
npx prisma generate
npx prisma db push
```

This creates the collections and declared unique/compound indexes. MongoDB must be a replica set because FlowPilot uses transactions. The guarded synthetic demo seed is available through `npm run seed:demo`; it must only target a dedicated demo database.
