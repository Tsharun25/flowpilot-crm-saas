import { createHash, randomBytes } from "node:crypto";

export const PASSWORD_RESET_TTL_MS = 20 * 60 * 1000;
export const RESET_PUBLIC_MESSAGE =
  "If an eligible account exists for this email and delivery is available, password reset instructions will be sent.";

export class PasswordResetOriginError extends Error {
  constructor() {
    super("PASSWORD_RESET_TRUSTED_ORIGIN_INVALID");
  }
}

export function createPasswordResetToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashPasswordResetToken(token) };
}

export function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function resolvePasswordResetOrigin(
  configured = process.env.PASSWORD_RESET_ORIGIN,
  nodeEnv = process.env.NODE_ENV,
) {
  const value = configured?.trim();
  const isProduction = nodeEnv === "production";

  if (!value) {
    if (!isProduction) return "http://localhost:3000";
    throw new PasswordResetOriginError();
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new PasswordResetOriginError();
  }

  const isExactOrigin =
    !url.username &&
    !url.password &&
    url.pathname === "/" &&
    !url.search &&
    !url.hash &&
    Boolean(url.hostname) &&
    !url.hostname.endsWith(".");
  const isHttps = url.protocol === "https:";
  const isLocalHttp =
    !isProduction &&
    url.protocol === "http:" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);

  if (!isExactOrigin || (!isHttps && !isLocalHttp)) {
    throw new PasswordResetOriginError();
  }

  return url.origin;
}

export function passwordResetUrl(token: string, origin = resolvePasswordResetOrigin()) {
  const url = new URL("/reset-password", origin);
  url.searchParams.set("token", token);
  return url.toString();
}
