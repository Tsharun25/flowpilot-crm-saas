import "server-only";
import { completePasswordResetWithClient, InvalidPasswordResetTokenError } from "@/lib/complete-password-reset-core";
import { prisma } from "@/lib/prisma";

export { InvalidPasswordResetTokenError };

export function completePasswordReset(rawToken: string, newPassword: string) {
  return completePasswordResetWithClient(prisma, rawToken, newPassword);
}
