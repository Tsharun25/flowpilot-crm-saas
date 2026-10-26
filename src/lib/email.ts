type EmailKind = "password-reset" | "password-changed";

type EmailInput = {
  to: string;
  kind: EmailKind;
  resetUrl?: string;
};

export function emailDeliveryConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim());
}

export async function sendAccountEmail({ to, kind, resetUrl }: EmailInput) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!apiKey || !from) throw new Error("EMAIL_DELIVERY_NOT_CONFIGURED");

  const isReset = kind === "password-reset";
  if (isReset && !resetUrl) throw new Error("PASSWORD_RESET_URL_REQUIRED");

  const subject = isReset ? "Reset your FlowPilot password" : "Your FlowPilot password was changed";
  const text = isReset
    ? `A password reset was requested for your FlowPilot account. Use this link within 20 minutes:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`
    : "Your FlowPilot password was changed. If you did not make this change, contact your deployment administrator immediately.";
  const html = isReset
    ? `<p>A password reset was requested for your FlowPilot account.</p><p><a href="${escapeHtml(resetUrl!)}">Reset password</a></p><p>This link expires in 20 minutes. If you did not request this, you can ignore this email.</p>`
    : "<p>Your FlowPilot password was changed.</p><p>If you did not make this change, contact your deployment administrator immediately.</p>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, text, html }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`EMAIL_PROVIDER_ERROR_${response.status}`);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character] ?? character);
}
