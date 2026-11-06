"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";
import { marketplaceRequest } from "./client";
import { facilityRegistrationRequestSchema } from "../../lib/marketplace";

const registrationResponseSchema = z.object({
  facility: z.object({ slug: z.string(), status: z.literal("pending_approval") }),
});
const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

function slugify(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

export function FacilityRegistrationForm() {
  const [state, setState] = useState<"idle" | "sending" | "error" | "success">("idle");
  const [error, setError] = useState("");
  const [submittedSlug, setSubmittedSlug] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const adminPassword = String(data.get("adminPassword") || "");
    if (new TextEncoder().encode(adminPassword).byteLength > 72) {
      setState("error");
      setError("Password must be no more than 72 UTF-8 bytes.");
      return;
    }
    const openingHours = Object.fromEntries(weekdays.map((day) => [day, String(data.get(`hours-${day}`) || "").trim()]));
    const payload = {
      name: String(data.get("name") || "").trim(),
      slug: String(data.get("slug") || "").trim(),
      region: String(data.get("region") || "").trim(),
      locality: String(data.get("locality") || "").trim(),
      address: String(data.get("address") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      contactEmail: String(data.get("contactEmail") || "").trim(),
      description: String(data.get("description") || "").trim(),
      openingHours,
      paymentInstructions: String(data.get("paymentInstructions") || "").trim(),
      currency: String(data.get("currency") || "").trim().toUpperCase(),
      adminEmail: String(data.get("adminEmail") || "").trim(),
      adminPassword,
    };
    setState("sending");
    setError("");
    try {
      const validatedPayload = facilityRegistrationRequestSchema.parse(payload);
      const response = await marketplaceRequest<unknown>("registrations", "POST", validatedPayload);
      const parsed = registrationResponseSchema.safeParse(response);
      if (!parsed.success) throw new Error("The service response could not be confirmed. Contact support before submitting again.");
      setSubmittedSlug(parsed.data.facility.slug);
      setState("success");
      form.reset();
    } catch (caught) {
      setState("error");
      setError(caught instanceof z.ZodError ? caught.issues.map((issue) => issue.message).join(" ") : caught instanceof Error ? caught.message : "Registration could not be submitted.");
    }
  }

  if (state === "success") return <div className="registration-success" role="status" aria-live="polite">
    <span aria-hidden="true">✓</span><div><h3>Application submitted for review.</h3>
      <p>Facility reference: <b>{submittedSlug}</b>. The facility remains unpublished and staff login is unavailable until platform review and approval. This form does not create a public listing.</p>
    </div>
  </div>;

  return <form className="facility-registration-form" onSubmit={submit}>
    <div className="registration-form-intro"><span className="eyebrow">INDEPENDENT FACILITY APPLICATION</span><h2>Request marketplace participation.</h2><p>Provide public facility details and create an initial administrator account. This application is reviewed before any facility or catalog is published.</p></div>
    <div className="form-grid">
      <label className="form-field"><span>Facility name <b>*</b></span><input name="name" required minLength={2} maxLength={160} onChange={(event) => {
        const form = event.currentTarget.form;
        const slug = form?.elements.namedItem("slug") as HTMLInputElement | null;
        if (slug && !slug.dataset.edited) slug.value = slugify(event.currentTarget.value);
      }} /></label>
      <label className="form-field"><span>Public listing slug <b>*</b></span><input name="slug" required minLength={2} maxLength={80} pattern="[a-z0-9]+(-[a-z0-9]+)*" onInput={(event) => { (event.currentTarget as HTMLInputElement).dataset.edited = "true"; }} /><small>Lowercase letters, numbers and single hyphens.</small></label>
      <label className="form-field"><span>Region <b>*</b></span><input name="region" required maxLength={120} /></label>
      <label className="form-field"><span>Town or locality <b>*</b></span><input name="locality" required maxLength={160} /></label>
      <label className="form-field form-message"><span>Public address <b>*</b></span><input name="address" required maxLength={500} /></label>
      <label className="form-field"><span>Facility phone <b>*</b></span><input name="phone" required maxLength={40} autoComplete="tel" /></label>
      <label className="form-field"><span>Public contact email <b>*</b></span><input name="contactEmail" type="email" required maxLength={254} autoComplete="email" /></label>
      <label className="form-field"><span>Currency <b>*</b></span><input name="currency" required minLength={3} maxLength={3} pattern="[A-Za-z]{3}" placeholder="GHS" /><small>Three-letter ISO currency code.</small></label>
      <label className="form-field form-message"><span>Public facility description <b>*</b></span><textarea name="description" required minLength={10} maxLength={3000} rows={3} /></label>
      <fieldset className="form-field form-message opening-hours-field"><legend>Opening hours <b>*</b></legend><p>Use local times (for example, 08:00-17:00). Leave a day blank if closed.</p><div className="opening-hours-grid">{weekdays.map((day) => <label key={day}><span>{day}</span><input name={`hours-${day}`} maxLength={80} placeholder="Closed" /></label>)}</div></fieldset>
      <label className="form-field form-message"><span>Payment instructions <small>Optional; shown publicly</small></span><textarea name="paymentInstructions" maxLength={1000} rows={2} /></label>
    </div>
    <div className="registration-admin-fields"><span className="eyebrow">INITIAL FACILITY ADMINISTRATOR</span><div className="form-grid">
      <label className="form-field"><span>Administrator email <b>*</b></span><input name="adminEmail" type="email" required maxLength={254} autoComplete="username" /></label>
      <label className="form-field"><span>Password <b>*</b></span><input name="adminPassword" type="password" required minLength={12} maxLength={72} autoComplete="new-password" /><small>At least 12 characters and at most 72 UTF-8 bytes.</small></label>
    </div><p>Password is sent only to the registration endpoint over HTTPS and is never displayed or retained by this page.</p></div>
    <p className="booking-privacy-note">Submitting confirms that you are authorized to provide these facility details for review. Public contact and payment instructions may be displayed only after approval. Do not include patient information.</p>
    {state === "error" && <p className="form-status form-status-error" role="alert">{error}</p>}
    <button className="button button-dark" type="submit" disabled={state === "sending"}>{state === "sending" ? "Submitting application…" : "Submit facility application"} <span aria-hidden="true">↗</span></button>
  </form>;
}
