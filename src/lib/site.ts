export const DEFAULT_SITE_URL = "https://flowpilot-crm-saas.vercel.app";

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) return DEFAULT_SITE_URL;

  try {
    const url = new URL(configured);
    return url.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function getSupportHref() {
  const configured = process.env.NEXT_PUBLIC_SUPPORT_URL?.trim();
  if (!configured) return "/support";

  try {
    const url = new URL(configured);
    return url.protocol === "https:" ? url.toString() : "/support";
  } catch {
    return "/support";
  }
}
