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
  return getConfiguredSupportUrl() ?? "/support";
}

export function getConfiguredSupportUrl() {
  const configured = process.env.NEXT_PUBLIC_SUPPORT_URL?.trim();
  if (!configured) return null;

  try {
    const url = new URL(configured);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}
