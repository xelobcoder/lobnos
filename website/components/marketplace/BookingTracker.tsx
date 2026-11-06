"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";
import { marketplaceRequest } from "./client";
import { bookingTrackingRequestSchema, paymentClaimRequestSchema, trackingTokenHtmlPattern } from "../../lib/marketplace";

const bookingStatusSchema = z.object({
  bookingId: z.string().uuid(),
  status: z.enum(["requested", "accepted", "rejected", "scheduled", "collected", "processing", "completed", "cancelled"]),
  paymentStatus: z.enum(["unpaid", "pending_verification", "verified", "rejected", "refund_pending", "refunded"]),
  totalAmount: z.number().finite().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  collectionMethod: z.enum(["in_facility", "home"]),
  scheduledAt: z.string().nullable(),
  scheduleInstructions: z.string().nullable(),
  items: z.array(z.object({
    type: z.string().optional(),
    name: z.string(),
    price: z.number().finite().nonnegative(),
    currency: z.string().regex(/^[A-Z]{3}$/),
  })),
});
const claimResponseSchema = z.object({ claimId: z.number().int().positive(), status: z.literal("pending_verification") });
type BookingStatus = z.infer<typeof bookingStatusSchema>;

const statusLabels: Record<BookingStatus["status"], string> = {
  requested: "Awaiting facility review",
  accepted: "Accepted by facility",
  rejected: "Request rejected",
  scheduled: "Scheduled",
  collected: "Collection recorded",
  processing: "Processing",
  completed: "Completed",
  cancelled: "Cancelled",
};
const paymentLabels: Record<BookingStatus["paymentStatus"], string> = {
  unpaid: "No payment claim",
  pending_verification: "Claim pending facility verification",
  verified: "Verified by facility staff",
  rejected: "Payment claim rejected",
  refund_pending: "Refund record pending",
  refunded: "Refund recorded",
};

export function BookingTracker({ initialToken, paymentInstructions }: { initialToken?: string; paymentInstructions?: string | null }) {
  const [token, setToken] = useState(initialToken || "");
  const [booking, setBooking] = useState<BookingStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [messageKind, setMessageKind] = useState<"success" | "error" | null>(null);
  const [claimReference, setClaimReference] = useState("");
  const [claimAmount, setClaimAmount] = useState("");
  const [claimBusy, setClaimBusy] = useState(false);

  async function loadStatus(credential: string) {
    const validated = bookingTrackingRequestSchema.safeParse({ trackingToken: credential });
    if (!validated.success) {
      setMessage("Enter a valid private tracking code.");
      setMessageKind("error");
      return false;
    }
    setBusy(true);
    setMessage("");
    setMessageKind(null);
    setBooking(null);
    try {
      const response = await marketplaceRequest<unknown>("bookings/track", "POST", validated.data);
      const parsed = bookingStatusSchema.safeParse(response);
      if (!parsed.success) throw new Error("The tracking service returned an unexpected status response.");
      setBooking(parsed.data);
      setClaimAmount(parsed.data.totalAmount.toFixed(2));
      return true;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Request status is unavailable.");
      setMessageKind("error");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function check(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token.trim()) return;
    await loadStatus(token.trim());
  }

  async function submitClaim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!booking || !token.trim()) return;
    setClaimBusy(true);
    setMessage("");
    try {
      const claimRequest = paymentClaimRequestSchema.parse({
        trackingToken: token.trim(),
        reference: claimReference.trim(),
        amount: Number(claimAmount),
      });
      const response = await marketplaceRequest<unknown>("bookings/payment-claims", "POST", claimRequest);
      const claim = claimResponseSchema.safeParse(response);
      if (!claim.success) throw new Error("The payment claim response could not be confirmed.");
      setClaimReference("");
      const statusRefreshed = await loadStatus(token.trim());
      setMessage(statusRefreshed
        ? "Payment reference submitted as a claim and is pending facility verification. It is not marked paid."
        : "Payment claim was submitted, but the status refresh failed. The facility must still verify the claim.");
      setMessageKind(statusRefreshed ? "success" : "error");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Payment claim could not be submitted.");
      setMessageKind("error");
    } finally {
      setClaimBusy(false);
    }
  }

  async function copyToken() {
    try {
      await navigator.clipboard.writeText(token);
      setMessage("Private tracking code copied. Keep it somewhere secure; it is not stored by this page.");
      setMessageKind("success");
    } catch {
      setMessage("Copy was unavailable. Select the private tracking code and keep it somewhere secure.");
      setMessageKind("error");
    }
  }

  const canSubmitClaim = booking && ["unpaid", "rejected"].includes(booking.paymentStatus) &&
    !["cancelled", "rejected", "completed"].includes(booking.status);

  return (
    <section className="booking-tracker">
      {initialToken ? <div className="tracking-credential">
        <details><summary>Show private tracking code</summary><code>{token}</code><button type="button" className="text-button" onClick={copyToken}>Copy code</button><small>This is a bearer credential. Do not share it with anyone you do not trust. It is held only in this page’s memory.</small></details><button type="button" className="button button-dark" disabled={busy} onClick={() => void loadStatus(token)}>Refresh private request status</button>
      </div> : <form className="tracking-form" onSubmit={check}>
        <label className="form-field"><span>Private tracking code <b>*</b></span><input name="trackingToken" value={token} onChange={(event) => setToken(event.target.value)} required minLength={43} maxLength={43} pattern={trackingTokenHtmlPattern} autoComplete="off" /></label>
        <p className="booking-privacy-note">Enter the private code you received when you submitted the request. It is sent in a POST body, never a URL. This lookup does not ask for your name, phone or medical details.</p>
        <button className="button button-dark" type="submit" disabled={busy}>{busy ? "Checking…" : "Check request status"} <span aria-hidden="true">→</span></button>
      </form>}
      {busy && initialToken && <p className="form-status form-status-sending" role="status">Checking private request status…</p>}
      {booking && <div className="booking-status-card">
        <div className="booking-status-heading"><div><span className="eyebrow">REQUEST STATUS</span><h4>{statusLabels[booking.status]}</h4></div><span className={`booking-state-pill booking-state-${booking.status}`}>{booking.status.replaceAll("_", " ")}</span></div>
        <dl>
          <div><dt>Request reference</dt><dd>{booking.bookingId}</dd></div>
          <div><dt>Payment status</dt><dd>{paymentLabels[booking.paymentStatus]}</dd></div>
          <div><dt>Collection method</dt><dd>{booking.collectionMethod === "home" ? "Home collection" : "At the facility"}</dd></div>
          <div><dt>Scheduled time</dt><dd>{booking.scheduledAt ? new Date(booking.scheduledAt).toLocaleString() : "Not scheduled"}</dd></div>
        </dl>
        {booking.scheduleInstructions && <p className="booking-schedule-note">{booking.scheduleInstructions}</p>}
        <div className="booking-snapshot"><b>Facility-priced request snapshot</b>{booking.items.map((item, index) => <div key={`${item.name}-${index}`}><span>{item.name}</span><span>{new Intl.NumberFormat("en", { style: "currency", currency: item.currency }).format(item.price)}</span></div>)}<div className="booking-total"><b>Request total</b><b>{new Intl.NumberFormat("en", { style: "currency", currency: booking.currency }).format(booking.totalAmount)}</b></div></div>
        {canSubmitClaim && <form className="payment-claim-form" onSubmit={submitClaim}>
          <span className="eyebrow">OPTIONAL PAYMENT REFERENCE</span>
          <h4>Submit a reference for facility review.</h4>
          {paymentInstructions && <p className="booking-payment-instructions-copy">{paymentInstructions}</p>}
          <label className="form-field"><span>External payment reference <b>*</b></span><input value={claimReference} onChange={(event) => setClaimReference(event.target.value)} required maxLength={120} autoComplete="off" /></label>
          <label className="form-field"><span>Amount claimed <b>*</b></span><input value={claimAmount} onChange={(event) => setClaimAmount(event.target.value)} type="number" min="0" step="0.01" required /></label>
          <p className="booking-privacy-note">This creates a pending claim only. Facility staff must verify the exact catalog-priced amount. A reference alone never proves payment, confirms an appointment or creates a laboratory order.</p>
          <button className="button button-dark" type="submit" disabled={claimBusy}>{claimBusy ? "Submitting claim…" : "Submit payment claim"} <span aria-hidden="true">↗</span></button>
        </form>}
      </div>}
      {message && <p className={`form-status ${messageKind === "error" ? "form-status-error" : "form-status-success"}`} role="status" aria-live="polite">{message}</p>}
    </section>
  );
}
