import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "../src/lib/demo-accounts";
import { DEMO_ACCOUNT_EMAIL } from "../src/lib/demo-workspace";

const prisma = new PrismaClient();
const confirmed = process.argv.includes("--confirm");

async function main() {
  const owner = await prisma.user.findUnique({
    where: { email: DEMO_ACCOUNT_EMAIL },
    include: { memberships: { include: { workspace: true } } },
  });
  const membership = owner?.memberships.find(({ workspace }) => workspace.isDemo);

  if (!owner || !membership) {
    throw new Error("A dedicated demo workspace and owner account must exist first.");
  }

  if (!confirmed) {
    const present = await prisma.user.findMany({
      where: { email: { in: DEMO_ACCOUNTS.map(({ email }) => email) } },
      select: { email: true, memberships: { where: { workspaceId: membership.workspaceId }, select: { role: true } } },
    });
    console.log(JSON.stringify({ workspace: membership.workspace.slug, accounts: present }, null, 2));
    console.log("Read-only check complete. Add --confirm to provision the public demo roles.");
    return;
  }

  const password = await bcrypt.hash(DEMO_PASSWORD, 12);
  for (const account of DEMO_ACCOUNTS) {
    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: { name: account.label, password },
      create: { name: account.label, email: account.email, password },
    });
    await prisma.membership.upsert({
      where: { userId_workspaceId: { userId: user.id, workspaceId: membership.workspaceId } },
      update: { role: account.role },
      create: { userId: user.id, workspaceId: membership.workspaceId, role: account.role },
    });
  }

  console.log(`Provisioned ${DEMO_ACCOUNTS.length} read-only role demos in ${membership.workspace.slug}.`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Demo role provisioning failed.");
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
