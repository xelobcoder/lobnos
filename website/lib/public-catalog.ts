import { z } from "zod";
import { approvedPortalUrl } from "./site";
import { corePlatformOrigin } from "./core-origin";

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100);
const facilitySchema = z.object({
  slug: slugSchema,
  name: z.string().min(1).max(200),
  region: z.string().max(120),
  locality: z.string().max(160),
  description: z.string().max(2000),
  website: z.string().max(500).optional(),
  facilityLoginUrl: z.string().max(1000).optional(),
  patientPortalUrl: z.string().max(1000).optional(),
});
const catalogItemSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1).max(200),
  description: z.string().max(4000).nullable(),
  price: z.number().finite().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/),
});
const catalogSchema = z.object({
  facility: facilitySchema,
  tests: z.array(catalogItemSchema).max(20_000),
  panels: z.array(catalogItemSchema).max(20_000).default([]),
  services: z.array(catalogItemSchema).max(20_000),
  currency: z.string().regex(/^[A-Z]{3}$/),
  pricingContext: z.string().min(1).max(1000),
  updatedAt: z.string().datetime(),
});

export type PublicFacility = Omit<z.infer<typeof facilitySchema>, "website" | "facilityLoginUrl" | "patientPortalUrl"> & {
  website: string | null;
  facilityLoginUrl: string | null;
  patientPortalUrl: string | null;
};

export type PublicCatalogItem = z.infer<typeof catalogItemSchema>;
export type PublicFacilityCatalog = Omit<z.infer<typeof catalogSchema>, "facility"> & {
  facility: PublicFacility;
};

export type PublicDataResult<T> =
  | { status: "ok"; data: T }
  | { status: "unavailable" }
  | { status: "not-found" };

const MAX_RESPONSE_BYTES = 2_000_000;

function coreOrigin(): string | null {
  return corePlatformOrigin();
}

function safePublicWebsite(raw?: string): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function sanitizeFacility(input: z.infer<typeof facilitySchema>): PublicFacility {
  return {
    ...input,
    website: safePublicWebsite(input.website),
    facilityLoginUrl: input.facilityLoginUrl ? approvedPortalUrl(input.facilityLoginUrl) : null,
    patientPortalUrl: input.patientPortalUrl ? approvedPortalUrl(input.patientPortalUrl) : null,
  };
}

async function readJson(response: Response): Promise<unknown> {
  if (!response.body) throw new Error("empty response");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw new Error("response too large");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
}

async function publicGet(path: string): Promise<Response> {
  const origin = coreOrigin();
  if (!origin) throw new Error("core API origin is unavailable");
  const url = new URL(path, `${origin}/`);
  if (url.origin !== origin || url.search || url.hash) throw new Error("invalid public API request");
  return fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    redirect: "manual",
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });
}

export async function getPublicFacilities(): Promise<PublicDataResult<PublicFacility[]>> {
  try {
    const response = await publicGet("/api/v1/public/facilities");
    if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) return { status: "unavailable" };
    const parsed = z.object({ facilities: z.array(facilitySchema).max(10_000) }).safeParse(await readJson(response));
    if (!parsed.success) return { status: "unavailable" };
    return { status: "ok", data: parsed.data.facilities.map(sanitizeFacility) };
  } catch {
    return { status: "unavailable" };
  }
}

export async function getPublicFacilityCatalog(slug: string): Promise<PublicDataResult<PublicFacilityCatalog>> {
  if (!slugSchema.safeParse(slug).success) return { status: "not-found" };
  try {
    const response = await publicGet(`/api/v1/public/facilities/${encodeURIComponent(slug)}/catalog`);
    if (response.status === 404) return { status: "not-found" };
    if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) return { status: "unavailable" };
    const parsed = catalogSchema.safeParse(await readJson(response));
    if (!parsed.success || parsed.data.facility.slug !== slug) return { status: "unavailable" };
    return {
      status: "ok",
      data: {
        ...parsed.data,
        facility: sanitizeFacility(parsed.data.facility),
      },
    };
  } catch {
    return { status: "unavailable" };
  }
}
