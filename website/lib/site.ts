const fallbackUrl = "https://primelabsys.com";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || fallbackUrl).replace(/\/+$/, "");
export const companyName = "Prime Laboratory Software";
export const shortName = "PLS";

export function absoluteUrl(path = "/"): string {
  return new URL(path, siteUrl).toString();
}

export function portalDestination(kind: "facility" | "patient"): string | null {
  const raw = kind === "facility"
    ? process.env.PLS_FACILITY_PORTAL_URL
    : process.env.PLS_PATIENT_PORTAL_URL;
  return raw ? approvedPortalUrl(raw) : null;
}

export function approvedPortalUrl(raw: string, allowedHosts?: string[]): string | null {
  try {
    const url = new URL(raw);
    const allowlist = allowedHosts ?? (process.env.PLS_PORTAL_ALLOWED_HOSTS || "")
      .split(",")
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean);
    const loopbackHttp = process.env.PLS_PORTAL_ALLOW_LOOPBACK_HTTP === "true" &&
      url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname.toLowerCase());
    if ((url.protocol !== "https:" && !loopbackHttp) || !allowlist.includes(url.hostname.toLowerCase())) return null;
    if (url.username || url.password || url.search || url.hash) return null;
    return url.toString();
  } catch {
    return null;
  }
}
