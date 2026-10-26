import bcrypt from "bcryptjs";
import type { Prisma, PrismaClient } from "@prisma/client";
import { hashPasswordResetToken } from "@/lib/password-reset";

export class InvalidPasswordResetTokenError extends Error {
  constructor() { super("INVALID_RESET_TOKEN"); }
}

export async function completePasswordResetWithClient(prisma: PrismaClient, rawToken: string, newPassword: string) {
  const tokenHash = hashPasswordResetToken(rawToken);
  const password = await bcrypt.hash(newPassword, 12);
  const now = new Date();
  return prisma.$transaction(async (tx) => {
    const token = await tx.passwordResetToken.findUnique({ where: { tokenHash }, select: { id: true, userId: true, expiresAt: true, usedAt: true, user: { select: { email: true, memberships: { select: { workspace: { select: { isDemo: true } } } } } } } });
    if (!token || token.usedAt || token.expiresAt <= now || token.user.memberships.some((membership) => membership.workspace.isDemo)) throw new InvalidPasswordResetTokenError();
    const unused: Prisma.PasswordResetTokenWhereInput = { OR: [{ usedAt: null }, { usedAt: { isSet: false } }] };
    const claimed = await tx.passwordResetToken.updateMany({ where: { id: token.id, expiresAt: { gt: now }, ...unused }, data: { usedAt: now } });
    if (claimed.count !== 1) throw new InvalidPasswordResetTokenError();
    await tx.user.update({ where: { id: token.userId }, data: { password, sessionVersion: { increment: 1 } } });
    await tx.passwordResetToken.updateMany({ where: { userId: token.userId, ...unused }, data: { usedAt: now } });
    return { email: token.user.email };
  });
}
