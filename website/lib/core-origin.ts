export function corePlatformOrigin(): string | null {
  const configuredBackend = process.env.NODE_ENV === "development"
    ? process.env.DEVELOPMENT_BASEURL : process.env.PRODUCTION_BASEURL;
  let backendOrigin: string | undefined;
  try { backendOrigin = configuredBackend ? new URL(configuredBackend).origin : undefined; } catch { /* Invalid transport configuration stays unavailable. */ }
  const rawUrl = process.env.CORE_PLATFORM_API_URL || backendOrigin;
  const allowedOrigin = process.env.CORE_PLATFORM_ALLOWED_ORIGIN || backendOrigin;
  if (!rawUrl || !allowedOrigin) return null;

  try {
    const api = new URL(rawUrl);
    const allowed = new URL(allowedOrigin);
    const originOnly = (url: URL) =>
      url.pathname === "/" && !url.search && !url.hash && !url.username && !url.password;
    if (!originOnly(api) || !originOnly(allowed) || api.origin !== allowed.origin) return null;
    if (api.protocol === "https:") return api.origin;
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(api.hostname.toLowerCase());
    const allowLocalHttp = process.env.NODE_ENV !== "production" ||
      process.env.CORE_PLATFORM_ALLOW_LOOPBACK_HTTP === "true";
    if (api.protocol === "http:" && loopback && allowLocalHttp) return api.origin;
    return null;
  } catch {
    return null;
  }
}
