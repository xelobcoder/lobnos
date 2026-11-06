import { z } from "zod";
import { corePlatformOrigin } from "./core-origin";
import { approvedPortalUrl } from "./site";

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80);
export const trackingTokenHtmlPattern = "(?:[A-Za-z0-9_]|-){43}";
export const facilityRegistrationRequestSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: slugSchema,
  region: z.string().trim().min(1).max(120),
  locality: z.string().trim().min(1).max(160),
  address: z.string().trim().min(1).max(500),
  phone: z.string().trim().min(1).max(40),
  contactEmail: z.string().email().max(254),
  description: z.string().trim().min(10).max(3000),
  openingHours: z.record(z.string().max(20), z.string().max(80)).refine((hours) => Object.keys(hours).length <= 7),
  paymentInstructions: z.string().max(1000),
  currency: z.string().regex(/^[A-Z]{3}$/),
  adminEmail: z.string().email().max(254),
  adminPassword: z.string().min(12).refine((password) => new TextEncoder().encode(password).byteLength <= 72, "Password must be at most 72 UTF-8 bytes"),
});
export const bookingRequestSchema = z.object({
  facilitySlug: slugSchema,
  itemIds: z.array(z.number().int().positive()).min(1).max(20).refine((ids) => new Set(ids).size === ids.length),
  idempotencyKey: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  patient: z.object({ name: z.string().trim().min(2).max(200), phone: z.string().trim().min(1).max(40), email: z.string().email().max(254).nullable() }),
  collectionMethod: z.enum(["in_facility", "home"]),
  collectionAddress: z.string().max(500).nullable(),
}).superRefine((booking, context) => {
  if (booking.collectionMethod === "home" && !booking.collectionAddress?.trim()) {
    context.addIssue({ code: "custom", path: ["collectionAddress"], message: "Collection address is required for home collection" });
  }
});
export const bookingTrackingRequestSchema = z.object({ trackingToken: z.string().regex(/^[A-Za-z0-9_-]{43}$/) });
export const paymentClaimRequestSchema = z.object({
  trackingToken: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  reference: z.string().trim().min(1).max(120),
  amount: z.number().finite().positive(),
});
export const independentStaffLoginRequestSchema = z.object({
  facilitySlug: slugSchema,
  email: z.string().email().max(254),
  password: z.string().min(1).max(72),
});

export const marketplaceFacilitySchema = z.object({
  slug: slugSchema,
  name: z.string().min(1).max(160),
  region: z.string().max(120),
  locality: z.string().max(160),
  address: z.string().max(500),
  phone: z.string().max(40),
  contactEmail: z.string().max(254),
  description: z.string().max(3000),
  openingHours: z.record(z.string(), z.string().max(80)),
  paymentInstructions: z.string().max(1000).nullable(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  facilityType: z.enum(["independent", "pls-integrated"]),
  bookingSupported: z.boolean().default(true),
  facilityLoginUrl: z.string().max(2048).optional().transform(value => value ? approvedPortalUrl(value) : null),
});

export const marketplaceCatalogItemSchema = z.object({
  id: z.number().int().positive(),
  type: z.enum(["test", "panel"]),
  name: z.string().min(1).max(160),
  description: z.string().max(3000).nullable(),
  price: z.number().finite().nonnegative(),
  sampleRequirements: z.array(z.string().max(300)).max(10),
  collectionMethods: z.array(z.enum(["in_facility", "home"])).min(1).max(2),
  available: z.boolean(),
  turnaroundHours: z.number().int().positive().nullable(),
});

const facilitiesResponseSchema = z.object({ facilities: z.array(marketplaceFacilitySchema).max(200) });
const catalogResponseSchema = z.object({
  facility: marketplaceFacilitySchema,
  currency: z.string().regex(/^[A-Z]{3}$/),
  tests: z.array(marketplaceCatalogItemSchema).max(20_000),
  source: z.enum(["marketplace", "pls-live"]),
});

export type MarketplaceFacility = z.infer<typeof marketplaceFacilitySchema>;
export type MarketplaceCatalogItem = z.infer<typeof marketplaceCatalogItemSchema>;
export type MarketplaceCatalog = z.infer<typeof catalogResponseSchema>;
export type MarketplaceResult<T> =
  | { status: "ok"; data: T }
  | { status: "unavailable" }
  | { status: "not-found" };

const maxResponseBytes = 2_000_000;

export function marketplaceCoreOrigin(): string | null {
  return corePlatformOrigin();
}

async function readLimitedJson(response: Response): Promise<unknown> {
  if (!response.body) throw new Error("Empty marketplace response");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxResponseBytes) {
      await reader.cancel();
      throw new Error("Marketplace response is too large");
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

async function getPublicMarketplaceData<S extends z.ZodTypeAny>(
  path: string,
  schema: S,
): Promise<MarketplaceResult<z.output<S>>> {
  const origin = marketplaceCoreOrigin();
  if (!origin) return { status: "unavailable" };
  try {
    const url = new URL(path, `${origin}/api/v1/marketplace/`);
    if (url.origin !== origin || url.searchParams.has("tenantId")) return { status: "unavailable" };
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(5_000),
    });
    if (response.status === 404) return { status: "not-found" };
    if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
      return { status: "unavailable" };
    }
    const envelope = z.object({ status: z.literal("success"), result: z.unknown() }).safeParse(await readLimitedJson(response));
    if (!envelope.success) return { status: "unavailable" };
    const parsed = schema.safeParse(envelope.data.result);
    if (!parsed.success) return { status: "unavailable" };
    return { status: "ok", data: parsed.data };
  } catch {
    return { status: "unavailable" };
  }
}

export function getMarketplaceFacilities(query?: string): Promise<MarketplaceResult<MarketplaceFacility[]>> {
  const search = new URLSearchParams();
  if (query?.trim()) search.set("q", query.trim().slice(0, 120));
  return getPublicMarketplaceData(
    `facilities${search.size ? `?${search.toString()}` : ""}`,
    facilitiesResponseSchema,
  ).then((result) => result.status === "ok"
    ? { status: "ok", data: result.data.facilities }
    : result);
}

export function getMarketplaceCatalog(slug: string): Promise<MarketplaceResult<MarketplaceCatalog>> {
  if (!slugSchema.safeParse(slug).success) return Promise.resolve({ status: "not-found" });
  return getPublicMarketplaceData(
    `facilities/${encodeURIComponent(slug)}/catalog`,
    catalogResponseSchema,
  );
}
