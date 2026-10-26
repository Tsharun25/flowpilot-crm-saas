import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { completePasswordResetWithClient } from "../src/lib/complete-password-reset-core";
import { createPasswordResetToken, hashPasswordResetToken } from "../src/lib/password-reset";
import { resetPasswordSchema } from "../src/lib/validators/auth";

async function main() {
  const prisma = new PrismaClient();
  const completePasswordReset = (token: string, password: string) => completePasswordResetWithClient(prisma, token, password);
  const marker = `reset-test-${Date.now()}`;
  let userId = ""; let workspaceId = "";

  try {
  const oldHash = await bcrypt.hash("OldPassword123!", 12);
  const user = await prisma.user.create({ data: { name: "Reset Test", email: `${marker}@example.invalid`, password: oldHash, sessionVersion: 4 } });
  userId = user.id;
  const workspace = await prisma.workspace.create({ data: { name: "Reset Test", slug: marker, members: { create: { userId, role: "OWNER" } } } });
  workspaceId = workspace.id;

  const first = createPasswordResetToken(); const outstanding = createPasswordResetToken();
  await prisma.passwordResetToken.createMany({ data: [
    { tokenHash: first.tokenHash, userId, expiresAt: new Date(Date.now() + 60_000) },
    { tokenHash: outstanding.tokenHash, userId, expiresAt: new Date(Date.now() + 60_000) },
  ] });
  await completePasswordReset(first.token, "NewPassword123!");
  const updated = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  assert.equal(updated.sessionVersion, 5); assert.equal(await bcrypt.compare("NewPassword123!", updated.password), true); assert.equal(await bcrypt.compare("OldPassword123!", updated.password), false);
  const invalidated = await prisma.passwordResetToken.count({ where: { userId, OR: [{ usedAt: null }, { usedAt: { isSet: false } }] } }); assert.equal(invalidated, 0);
  await assert.rejects(() => completePasswordReset(first.token, "AnotherPassword123!"));
  assert.equal(resetPasswordSchema.safeParse({ token: outstanding.token, password: "short", confirmPassword: "different" }).success, false);

  const expired = createPasswordResetToken();
  await prisma.passwordResetToken.create({ data: { tokenHash: expired.tokenHash, userId, expiresAt: new Date(Date.now() - 1_000) } });
  await assert.rejects(() => completePasswordReset(expired.token, "AnotherPassword123!"));
  await assert.rejects(() => completePasswordReset("altered-token-that-is-long-enough-for-a-direct-service-test", "AnotherPassword123!"));

  const demoToken = createPasswordResetToken();
  await prisma.passwordResetToken.create({ data: { tokenHash: demoToken.tokenHash, userId, expiresAt: new Date(Date.now() + 60_000) } });
  await prisma.workspace.update({ where: { id: workspaceId }, data: { isDemo: true } });
  await assert.rejects(() => completePasswordReset(demoToken.token, "AnotherPassword123!"));
  await prisma.workspace.update({ where: { id: workspaceId }, data: { isDemo: false } });

  const concurrent = createPasswordResetToken();
  await prisma.passwordResetToken.create({ data: { tokenHash: hashPasswordResetToken(concurrent.token), userId, expiresAt: new Date(Date.now() + 60_000) } });
  const results = await Promise.allSettled([completePasswordReset(concurrent.token, "ConcurrentPassword123!"), completePasswordReset(concurrent.token, "ConcurrentPassword123!")]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  console.log("Password reset tests passed: password/session update, single use, outstanding invalidation, expiry, alteration, demo denial, and concurrent reuse.");
  } finally {
  if (userId) await prisma.passwordResetToken.deleteMany({ where: { userId } });
  if (workspaceId) await prisma.membership.deleteMany({ where: { workspaceId } });
  if (workspaceId) await prisma.workspace.delete({ where: { id: workspaceId } }).catch(() => undefined);
  if (userId) await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
  await prisma.$disconnect();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
