import { NextRequest, NextResponse } from "next/server";
import { marketplaceCoreOrigin } from "../../../../../website/lib/marketplace";

const maxRequestBytes = 64_000;
const maxResponseBytes = 4_000_000;
const noStoreHeaders = {
  "Cache-Control": "no-store, private, max-age=0",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
};
type Context = { params: Promise<{ path: string[] }> };

function allowedPath(method: string, segments: string[]) {
  const path = segments.join("/");
  if (method === "GET") {
    return path === "facilities" ||
      /^facilities\/[a-z0-9]+(?:-[a-z0-9]+)*\/catalog$/.test(path) ||
      ["staff/me", "staff/users", "staff/bookings", "staff/catalog"].includes(path);
  }
  if (method === "POST") {
    return [
      "registrations",
      "bookings",
      "bookings/track",
      "bookings/payment-claims",
      "staff/login",
      "staff/logout",
      "staff/users",
      "staff/catalog",
    ].includes(path) ||
      /^staff\/bookings\/[0-9a-f-]{36}\/decision$/i.test(path) ||
      /^staff\/bookings\/[0-9a-f-]{36}\/refunds$/i.test(path) ||
      /^staff\/bookings\/[0-9a-f-]{36}\/payment-claims\/[0-9]+\/decision$/i.test(path);
  }
  if (method === "PATCH") {
    return path === "staff/profile" ||
      /^staff\/users\/[0-9]+$/.test(path) ||
      /^staff\/catalog\/[0-9]+$/.test(path);
  }
  return false;
}

function error(message: string, status: number) {
  return NextResponse.json({ status: "error", message }, { status, headers: noStoreHeaders });
}

function marketplaceSessionCookie(request: NextRequest) {
  const cookie = request.cookies.get("pls-marketplace-session")?.value;
  return cookie && /^[A-Za-z0-9_-]{40,60}$/.test(cookie)
    ? `pls-marketplace-session=${cookie}`
    : null;
}

function shouldForwardSession(segments: string[]) {
  return segments[0] === "staff" &&
    !(segments.length === 2 && segments[1] === "login");
}

async function readLimitedBody(body: ReadableStream<Uint8Array> | null, limit: number) {
  if (!body) return new Uint8Array();
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new Error("Body too large");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

function rewriteSessionCookie(setCookie: string | null, allowCleared = false) {
  if (!setCookie) return null;
  const attributes = setCookie.split(";").map((part) => part.trim());
  const cookieValue = attributes[0];
  if (!cookieValue?.startsWith("pls-marketplace-session=")) return null;
  const value = cookieValue.slice("pls-marketplace-session=".length);
  if (!(allowCleared && value === "") && !/^[A-Za-z0-9_-]{40,60}$/.test(value)) return null;
  const normalized = attributes.slice(1).map((attribute) => attribute.toLowerCase());
  if (!normalized.includes("httponly") || !normalized.includes("secure") || !normalized.includes("samesite=strict")) return null;
  if (normalized.some((attribute) => attribute.startsWith("domain="))) return null;
  const pathIndex = attributes.findIndex((attribute) => attribute.toLowerCase() === "path=/api/v1/marketplace/staff");
  if (pathIndex === -1) return null;
  attributes[pathIndex] = "Path=/api/site/marketplace/staff";
  return attributes.join("; ");
}

export async function GET(request: NextRequest, context: Context) {
  return proxy(request, context, "GET");
}

export async function POST(request: NextRequest, context: Context) {
  return proxy(request, context, "POST");
}

export async function PATCH(request: NextRequest, context: Context) {
  return proxy(request, context, "PATCH");
}

async function proxy(request: NextRequest, context: Context, method: string) {
  const { path: segments } = await context.params;
  if (!segments.length || segments.some((segment) => !/^[A-Za-z0-9_-]{1,100}$/.test(segment))) {
    return error("Invalid marketplace path", 400);
  }
  if (!allowedPath(method, segments)) return error("Marketplace endpoint not found", 404);
  const path = segments.join("/");
  const searchParams = request.nextUrl.searchParams;
  let query = "";
  if (method === "GET" && path === "facilities") {
    if ([...searchParams.keys()].some((key) => key !== "q") || searchParams.getAll("q").length > 1) {
      return error("Unexpected query parameters", 400);
    }
    const search = searchParams.get("q");
    if (search !== null) {
      if (search.length > 120) return error("Search is too long", 400);
      query = `?q=${encodeURIComponent(search)}`;
    }
  } else if ([...searchParams.keys()].length) {
    return error("Unexpected query parameters", 400);
  }

  const origin = marketplaceCoreOrigin();
  if (!origin) return error("Marketplace service is not configured", 503);
  const upstreamUrl = `${origin}/api/v1/marketplace/${segments.map(encodeURIComponent).join("/")}${query}`;
  const headers = new Headers({ Accept: "application/json" });
  if (shouldForwardSession(segments)) {
    const sessionCookie = marketplaceSessionCookie(request);
    if (sessionCookie) headers.set("Cookie", sessionCookie);
  }

  let body: string | undefined;
  if (method !== "GET") {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) return error("JSON request body required", 415);
    if (Number(request.headers.get("content-length")) > maxRequestBytes) return error("Request is too large", 413);
    let rawBody: string;
    try {
      rawBody = new TextDecoder().decode(await readLimitedBody(request.body, maxRequestBytes));
    } catch {
      return error("Request is too large", 413);
    }
    try {
      const parsed = JSON.parse(rawBody) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && "tenantId" in parsed) {
        return error("Tenant identifiers are not accepted", 400);
      }
      body = JSON.stringify(parsed);
    } catch {
      return error("Invalid JSON request body", 400);
    }
    headers.set("Content-Type", "application/json");

    const isStaffMutation = segments[0] === "staff";
    if (isStaffMutation && request.headers.get("origin") !== request.nextUrl.origin) {
      return error("Same-origin staff request required", 403);
    }
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      method,
      headers,
      ...(body === undefined ? {} : { body }),
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });
    if (upstream.status >= 300 && upstream.status < 400) return error("Marketplace service returned an unexpected redirect", 502);
    if (!upstream.headers.get("content-type")?.toLowerCase().includes("application/json")) {
      return error("Marketplace service returned an unexpected response", 502);
    }
    let responseBytes: Uint8Array;
    try {
      responseBytes = await readLimitedBody(upstream.body, maxResponseBytes);
    } catch {
      return error("Marketplace response is too large", 502);
    }
    const responseBody = new TextDecoder().decode(responseBytes);
    try {
      JSON.parse(responseBody);
    } catch {
      return error("Marketplace service returned invalid JSON", 502);
    }
    const responseHeaders = new Headers(noStoreHeaders);
    responseHeaders.set("Content-Type", "application/json; charset=utf-8");

    if (segments[0] === "staff" && segments[1] === "login" && upstream.ok) {
      const cookie = rewriteSessionCookie(upstream.headers.get("set-cookie"));
      if (!cookie) return error("Facility session could not be established securely", 502);
      responseHeaders.set("Set-Cookie", cookie);
    }
    if (segments[0] === "staff" && segments[1] === "logout") {
      const upstreamCookie = upstream.headers.get("set-cookie");
      if (upstreamCookie) {
        const cookie = rewriteSessionCookie(upstreamCookie, true);
        if (!cookie) return error("Facility session could not be cleared securely", 502);
        responseHeaders.set("Set-Cookie", cookie);
      }
    }
    return new NextResponse(responseBody, { status: upstream.status, headers: responseHeaders });
  } catch {
    return error("Marketplace service is temporarily unavailable", 503);
  }
}
