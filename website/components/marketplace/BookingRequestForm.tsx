"use client";

import { useRef, useState, type FormEvent } from "react";
import { z } from "zod";
import type { MarketplaceCatalogItem } from "../../lib/marketplace";
import { bookingRequestSchema } from "../../lib/marketplace";
import { BookingTracker } from "./BookingTracker";
import { marketplaceRequest } from "./client";

type CollectionMethod = "in_facility" | "home";
type BookingRequest = {
  facilitySlug: string;
  itemIds: number[];
  idempotencyKey: string;
  patient: { name: string; phone: string; email: string | null };
  collectionMethod: CollectionMethod;
  collectionAddress: string | null;
};
const bookingResponseSchema = z.object({
  bookingId: z.string().uuid(),
  trackingToken: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  status: z.literal("requested"),
  totalAmount: z.number().finite().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  paymentInstructions: z.string().nullable(),
});

function newIdempotencyKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function BookingRequestForm({
  slug,
  items,
  currency,
  paymentInstructions,
  estimatedAmount,
  onRetryStateChange,
}: {
  slug: string;
  items: MarketplaceCatalogItem[];
  currency: string;
  paymentInstructions: string | null;
  estimatedAmount: number;
  onRetryStateChange: (locked: boolean) => void;
}) {
  const [collectionMethod, setCollectionMethod] = useState<CollectionMethod>("in_facility");
  const [state, setState] = useState<{ kind: "idle" | "sending" | "error" | "success"; message: string }>({ kind: "idle", message: "" });
  const [created, setCreated] = useState<z.infer<typeof bookingResponseSchema> | null>(null);
  const [retryAvailable, setRetryAvailable] = useState(false);
  const retryRef = useRef<{ request: BookingRequest } | null>(null);
  const commonMethods = items.length
    ? (["in_facility", "home"] as const).filter((method) => items.every((item) => item.collectionMethods.includes(method)))
    : [];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length) return;
    const form = event.currentTarget;
    let retry = retryRef.current;
    if (!retry) {
      const values = new FormData(form);
      const method = commonMethods.includes(collectionMethod) ? collectionMethod : commonMethods[0];
      if (!method) return;
      const bookingRequest = bookingRequestSchema.safeParse({
        facilitySlug: slug,
        itemIds: items.map((item) => item.id),
        idempotencyKey: newIdempotencyKey(),
        patient: {
          name: String(values.get("patientName") || "").trim(),
          phone: String(values.get("patientPhone") || "").trim(),
          email: String(values.get("patientEmail") || "").trim() || null,
        },
        collectionMethod: method,
        collectionAddress: method === "home" ? String(values.get("collectionAddress") || "").trim() : null,
      });
      if (!bookingRequest.success) {
        setState({ kind: "error", message: bookingRequest.error.issues.map((issue) => issue.message).join(" ") });
        return;
      }
      retry = { request: bookingRequest.data as BookingRequest };
      retryRef.current = retry;
      setRetryAvailable(true);
      onRetryStateChange(true);
    }
    setState({ kind: "sending", message: "Sending request securely…" });
    try {
      const result = await marketplaceRequest<unknown>("bookings", "POST", retry.request);
      const parsed = bookingResponseSchema.safeParse(result);
      if (!parsed.success) throw new Error("The facility service returned an unexpected booking response. Check status using the private code if one was provided.");
      setCreated(parsed.data);
      setState({ kind: "success", message: "Booking request received. The facility has not yet accepted an appointment or verified payment." });
      retryRef.current = null;
      setRetryAvailable(false);
      onRetryStateChange(false);
      form.reset();
    } catch (error) {
      if (error instanceof z.ZodError) {
        setState({ kind: "error", message: error.issues.map((issue) => issue.message).join(" ") });
        return;
      }
      setState({ kind: "error", message: error instanceof Error ? error.message : "Marketplace request failed. No confirmation was received." });
    }
  }

  if (created) {
    return <section className="booking-created" aria-live="polite">
      <span className="booking-state-pill">REQUESTED · AWAITING FACILITY REVIEW</span>
      <h3>Your booking request was submitted.</h3>
      <p>{state.message}</p>
      <dl><div><dt>Request reference</dt><dd>{created.bookingId}</dd></div><div><dt>Facility-priced total</dt><dd>{new Intl.NumberFormat("en", { style: "currency", currency: created.currency }).format(created.totalAmount)}</dd></div></dl>
      {created.paymentInstructions && <div className="booking-payment-instructions"><b>Facility payment instructions</b><p>{created.paymentInstructions}</p><small>A payment reference remains unverified until facility staff review it.</small></div>}
      <BookingTracker initialToken={created.trackingToken} paymentInstructions={created.paymentInstructions} />
    </section>;
  }

  return <section className="booking-request-section" id="booking-request">
    <div className="booking-request-heading"><span className="eyebrow">REQUEST A BOOKING</span><h3>{items.length ? `${items.length} ${items.length === 1 ? "item" : "items"} selected` : "Choose tests or panels to continue."}</h3>
      {items.length > 0 && <p>Estimated list price: <b>{new Intl.NumberFormat("en", { style: "currency", currency, minimumFractionDigits: 2 }).format(estimatedAmount)}</b>. The service rechecks the current facility catalog and calculates the submitted total.</p>}
    </div>
    {items.length > 0 && commonMethods.length === 0
      ? <div className="form-inline-error">The selected catalog items do not share a collection method. Select a different combination.</div>
      : items.length > 0 && <form className="marketplace-booking-form" onSubmit={submit}>
        <div className="form-grid">
          <label className="form-field"><span>Patient name <b>*</b></span><input name="patientName" required minLength={2} maxLength={200} autoComplete="name" disabled={retryAvailable} /></label>
          <label className="form-field"><span>Phone <b>*</b></span><input name="patientPhone" required maxLength={40} autoComplete="tel" disabled={retryAvailable} /></label>
          <label className="form-field"><span>Email <small>Optional</small></span><input name="patientEmail" type="email" maxLength={254} autoComplete="email" disabled={retryAvailable} /></label>
          <label className="form-field"><span>Collection method <b>*</b></span><select name="collectionMethod" value={collectionMethod} onChange={(event) => setCollectionMethod(event.target.value as CollectionMethod)} required disabled={retryAvailable}>
            {commonMethods.map((method) => <option key={method} value={method}>{method === "home" ? "Home collection" : "At the facility"}</option>)}
          </select></label>
          {collectionMethod === "home" && <label className="form-field form-message"><span>Collection address <b>*</b></span><textarea name="collectionAddress" required maxLength={500} rows={2} autoComplete="street-address" disabled={retryAvailable} /></label>}
        </div>
        <p className="booking-privacy-note">These details are sent to the marketplace service so the selected facility can review the request. Do not include medical history or other health details here. Request submission does not confirm an appointment, create a PLS order, or prove payment.</p>
        <div className="form-submit-row"><button className="button button-dark" type="submit" disabled={state.kind === "sending"}>{state.kind === "sending" ? "Submitting request…" : retryAvailable ? "Retry same request" : "Send booking request"} <span aria-hidden="true">↗</span></button><span>Selected items: {items.map((item) => item.name).join(", ")}</span></div>
        {state.kind === "error" && retryAvailable && <div className="booking-retry">
          <p>Your request’s result may be uncertain. Retry sends the exact same request and private key, not a second booking. The request details are locked so you cannot accidentally create a duplicate with a new key.</p>
        </div>}
        <p className={`form-status form-status-${state.kind}`} role="status" aria-live="polite">{state.message}</p>
      </form>}
    {!items.length && <p className="booking-selection-help">Select one or more available items above. The final amount is recalculated from the facility’s current approved catalog at submission.</p>}
    {items.length > 0 && !state.message && paymentInstructions && <div className="booking-public-payment"><b>Payment information published by the facility</b><span>{paymentInstructions}</span><small>Wait for the facility to review your request. If it accepts manual payment references, staff must verify the amount and reference.</small></div>}
  </section>;
}
