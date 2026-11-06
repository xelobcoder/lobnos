import { NextResponse, type NextRequest } from "next/server";
import { leadSchema } from "../../../../website/lib/lead";

export const runtime = "nodejs";

type RateEntry = { count: number; resetAt: number };
const globalForRateLimit = globalThis as typeof globalThis & { __plsLeadLimit?: Map<string, RateEntry> };
const rateLimit = globalForRateLimit.__plsLeadLimit ??= new Map<string, RateEntry>();
const windowMs = 60 * 60 * 1000;
const maxPerWindow = 5;

function withinRateLimit(key: string, now = Date.now()): boolean {
  const existing = rateLimit.get(key);
  if (!existing || existing.resetAt <= now) {
    rateLimit.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (existing.count >= maxPerWindow) return false;
  existing.count += 1;
  if (rateLimit.size > 10_000) {
    for (const [entryKey, entry] of rateLimit) if (entry.resetAt <= now) rateLimit.delete(entryKey);
  }
  return true;
}

async function readBody(request: NextRequest): Promise<string | null> {
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 12_000) {
      await reader.cancel();
      throw new RangeError("request body too large");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 12_000) return NextResponse.json({ message: "This enquiry is too large." }, { status: 413 });

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return NextResponse.json({ message: "Request origin could not be verified." }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ message: "Request origin could not be verified." }, { status: 403 });
    }
  }

  let submitted: unknown;
  try {
    const raw = await readBody(request);
    if (!raw) return NextResponse.json({ message: "The enquiry could not be read. Please check the form and try again." }, { status: 400 });
    submitted = JSON.parse(raw);
  } catch (error) {
    if (error instanceof RangeError) return NextResponse.json({ message: "This enquiry is too large." }, { status: 413 });
    return NextResponse.json({ message: "The enquiry could not be read. Please check the form and try again." }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(submitted);
  if (!parsed.success) {
    return NextResponse.json({
      message: "Please review the highlighted details.",
      fields: parsed.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  if (parsed.data._website) {
    return NextResponse.json({ message: "This submission could not be verified." }, { status: 400 });
  }

  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  const webhookToken = process.env.LEAD_WEBHOOK_TOKEN;
  if (!webhookUrl || !webhookToken) {
    return NextResponse.json({ message: "Enquiry delivery is not configured yet. Your message was not sent; please contact PLS through your established channel." }, { status: 503 });
  }

  let destination: URL;
  try {
    destination = new URL(webhookUrl);
    const hostname = destination.hostname.toLowerCase();
    const loopback = ["localhost", "127.0.0.1", "::1"].includes(hostname);
    const allowedLoopbackHttp = loopback &&
      destination.protocol === "http:" &&
      process.env.LEAD_WEBHOOK_ALLOW_LOOPBACK_HTTP === "true";
    if (
      (destination.protocol !== "https:" && !allowedLoopbackHttp) ||
      !hostname ||
      destination.username ||
      destination.password ||
      (loopback && !allowedLoopbackHttp) ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal")
    ) {
      throw new Error("invalid destination");
    }
  } catch {
    return NextResponse.json({ message: "The enquiry delivery service is unavailable. Your message was not sent." }, { status: 503 });
  }

  // Count only validated requests with a configured, valid destination. Setup and
  // validation errors must not consume the visitor's delivery allowance.
  const clientIp = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!withinRateLimit(clientIp)) {
    return NextResponse.json({ message: "Too many enquiries from this connection. Please try again later." }, {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(windowMs / 1000)) },
    });
  }

  const { _website: _honeypot, ...lead } = parsed.data;
  void _honeypot;
  try {
    const delivery = await fetch(destination, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${webhookToken}` },
      body: JSON.stringify({ ...lead, submittedAt: new Date().toISOString(), source: "pls-corporate-website" }),
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    if (!delivery.ok) {
      return NextResponse.json({ message: "We couldn't confirm delivery of your enquiry. Your message was not sent; please try again later." }, { status: 502 });
    }
    return NextResponse.json({ message: "Your enquiry was successfully delivered. The PLS team can now follow up." }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "We couldn't reach the enquiry service. Your message was not sent; please try again later." }, { status: 502 });
  }
}
