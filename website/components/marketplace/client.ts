export type MarketplaceEnvelope<T> = { status: "success"; result: T };

export async function marketplaceRequest<T>(
  path: string,
  method: "GET" | "POST" | "PATCH",
  body?: unknown,
): Promise<T> {
  const response = await fetch(`/api/site/marketplace/${path}`, {
    method,
    credentials: "same-origin",
    cache: "no-store",
    headers: body === undefined ? { Accept: "application/json" } : {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const payload = await response.json() as Partial<MarketplaceEnvelope<T>> & { status?: string; message?: string };
  if (!response.ok || payload.status !== "success" || !("result" in payload)) {
    throw new Error(payload.message || "The marketplace service could not complete that request.");
  }
  return payload.result as T;
}
