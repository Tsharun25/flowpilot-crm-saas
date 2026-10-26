import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { createRateLimitCommand } from "../src/lib/rate-limit-command";

async function main() {
  const prisma = new PrismaClient();
  const identifier = `test-${Date.now()}-${Math.random()}`;
  const key = createHash("sha256").update(identifier).digest("hex");
  const counts: number[] = [];
  try {
    for (let index = 0; index < 3; index += 1) {
      const result = await prisma.$runCommandRaw(createRateLimitCommand(key, new Date(), 60_000)) as { value?: { count?: number } };
      counts.push(Number(result.value?.count));
    }
    assert.deepEqual(counts, [1, 2, 3]);
    assert.equal(counts[2] <= 2, false);
    await prisma.rateLimit.delete({ where: { id: key } });
  } finally {
    await prisma.$disconnect();
  }
  console.log("Shared MongoDB rate-limit rejection and recovery-window metadata passed.");
}

main().catch((error) => { console.error(error); process.exit(1); });
