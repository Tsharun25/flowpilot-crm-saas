import { NextResponse } from "next/server";

import { emailDeliveryConfigured, sendAccountEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, requestAddress } from "@/lib/rate-limit";
import {
  createPasswordResetToken,
  PASSWORD_RESET_TTL_MS,
  passwordResetUrl,
  PasswordResetOriginError,
  RESET_PUBLIC_MESSAGE,
  resolvePasswordResetOrigin,
} from "@/lib/password-reset";
import { forgotPasswordSchema } from "@/lib/validators/auth";

const responseHeaders = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" };

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: RESET_PUBLIC_MESSAGE }, { status: 202, headers: responseHeaders });
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400, headers: responseHeaders });
  }

  const address = requestAddress(request.headers);
  const [ipRate, accountRate] = await Promise.all([
    checkRateLimit("password-reset-ip", address, 8, 60 * 60 * 1000),
    checkRateLimit("password-reset-account", parsed.data.email, 3, 60 * 60 * 1000),
  ]);
  if (!ipRate.allowed || !accountRate.allowed) {
    return NextResponse.json(
      { message: RESET_PUBLIC_MESSAGE },
      { status: 202, headers: { ...responseHeaders, "Retry-After": String(Math.max(ipRate.retryAfterSeconds, accountRate.retryAfterSeconds)) } },
    );
  }

  if (!emailDeliveryConfigured()) {
    return NextResponse.json(
      { message: "Password reset delivery is temporarily unavailable. Please use the support option." },
      { status: 503, headers: responseHeaders },
    );
  }

  let resetOrigin: string;
  try {
    resetOrigin = resolvePasswordResetOrigin();
  } catch (error) {
    if (!(error instanceof PasswordResetOriginError)) throw error;
    console.error("PASSWORD_RESET_ORIGIN_INVALID");
    return NextResponse.json(
      { message: "Password reset delivery is temporarily unavailable. Please use the support option." },
      { status: 503, headers: responseHeaders },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true, memberships: { select: { workspace: { select: { isDemo: true } } } } },
  });
  const eligible = user && !user.memberships.some((membership) => membership.workspace.isDemo);

  if (eligible) {
    const { token, tokenHash } = createPasswordResetToken();
    const record = await prisma.passwordResetToken.create({
      data: { tokenHash, userId: user.id, expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS) },
      select: { id: true },
    });
    try {
      await sendAccountEmail({ to: user.email, kind: "password-reset", resetUrl: passwordResetUrl(token, resetOrigin) });
    } catch (error) {
      await prisma.passwordResetToken.delete({ where: { id: record.id } }).catch(() => undefined);
      console.error("PASSWORD_RESET_EMAIL_DELIVERY_FAILED", error instanceof Error ? error.message : "unknown");
    }
  } else {
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  return NextResponse.json({ message: RESET_PUBLIC_MESSAGE }, { status: 202, headers: responseHeaders });
}
