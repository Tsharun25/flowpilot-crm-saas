import { NextResponse } from "next/server";

import { completePasswordReset, InvalidPasswordResetTokenError } from "@/lib/complete-password-reset";
import { sendAccountEmail } from "@/lib/email";
import { checkRateLimit, requestAddress } from "@/lib/rate-limit";
import { resetPasswordSchema } from "@/lib/validators/auth";

const headers = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" };
const invalidMessage = "This reset link is invalid, expired, or has already been used.";

export async function POST(request: Request) {
  const rate = await checkRateLimit("password-reset-complete", requestAddress(request.headers), 10, 60 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json({ message: "Too many attempts. Please request a new link later." }, { status: 429, headers: { ...headers, "Retry-After": String(rate.retryAfterSeconds) } });
  }

  let body: unknown;
  try { body = await request.json(); } catch { body = null; }
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400, headers });
  }

  try {
    const { email } = await completePasswordReset(parsed.data.token, parsed.data.password);

    try {
      await sendAccountEmail({ to: email, kind: "password-changed" });
    } catch (error) {
      console.error("PASSWORD_CHANGED_EMAIL_DELIVERY_FAILED", error instanceof Error ? error.message : "unknown");
    }
    return NextResponse.json({ message: "Password changed successfully. Sign in with your new password." }, { status: 200, headers });
  } catch (error) {
    if (error instanceof InvalidPasswordResetTokenError || (error instanceof Error && error.message === "INVALID_RESET_TOKEN")) {
      return NextResponse.json({ message: invalidMessage }, { status: 400, headers });
    }
    console.error("PASSWORD_RESET_FAILED", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ message: "Unable to reset the password right now. Please try again." }, { status: 500, headers });
  }
}
