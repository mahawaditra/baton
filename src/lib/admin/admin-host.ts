export const ADMIN_HOST = process.env.NEXT_PUBLIC_ADMIN_HOST ?? "";

export function isAdminHost(rawHost: string | null | undefined): boolean {
  if (!ADMIN_HOST || !rawHost) return false;
  return rawHost.split(":")[0] === ADMIN_HOST;
}

function deriveAdminUrl(adminHost: string): string {
  const base = process.env.BETTER_AUTH_URL;
  if (!base) return `https://${adminHost}`;

  try {
    const url = new URL(base);
    url.hostname = adminHost;
    return url.origin;
  } catch {
    return `https://${adminHost}`;
  }
}

export const ADMIN_URL = ADMIN_HOST
  ? deriveAdminUrl(ADMIN_HOST)
  : process.env.BETTER_AUTH_URL;
