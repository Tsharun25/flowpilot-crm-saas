import { createHash, randomBytes } from "node:crypto";

import { getSiteUrl } from "@/lib/site";

export const PASSWORD_RESET_TTL_MS = 20 * 60 * 1000;
export const RESET_PUBLIC_MESSAGE =
  "If an eligible account exists for this email and delivery is available, password reset instructions will be sent.";

export function createPasswordResetToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashPasswordResetToken(token) };
}

export function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function passwordResetUrl(token: string) {
  const origin = getSiteUrl();
  if (process.env.NODE_ENV === "production" && !origin.startsWith("https://")) {
    throw new Error("PASSWORD_RESET_TRUSTED_ORIGIN_INVALID");
  }
  const url = new URL("/reset-password", origin);
  url.searchParams.set("token", token);
  return url.toString();
}
