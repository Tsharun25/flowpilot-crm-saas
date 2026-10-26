import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { createRateLimitCommand } from "@/lib/rate-limit-command";

type CommandResult = { value?: { count?: number; windowStart?: { $date?: string } } };

function keyFor(scope: string, identifier: string) {
  const salt = process.env.RATE_LIMIT_SALT || process.env.NEXTAUTH_SECRET || process.env.DATABASE_URL;
  if (!salt) throw new Error("A rate-limit hashing secret is required");
  return createHash("sha256").update(`${salt}:${scope}:${identifier.toLowerCase()}`).digest("hex");
}

export async function checkRateLimit(scope: string, identifier: string, limit: number, windowMs: number) {
  const now = new Date();
  const result = await prisma.$runCommandRaw(createRateLimitCommand(keyFor(scope, identifier), now, windowMs)) as CommandResult;
  const count = Number(result.value?.count ?? 1);
  return { allowed: count <= limit, remaining: Math.max(0, limit - count), retryAfterSeconds: Math.ceil(windowMs / 1000) };
}

export function requestAddress(headers: Headers) {
  return (headers.get("x-forwarded-for")?.split(",")[0] || headers.get("x-real-ip") || "unknown").trim();
}
