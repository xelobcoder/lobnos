"use client";

import { useState, type FormEvent } from "react";
import { demoInterests } from "../../data/content";

export function LeadForm({ type, initialContext }: { type: "demo" | "contact"; initialContext?: string }) {
  const [status, setStatus] = useState<{ kind: "idle" | "sending" | "success" | "error"; message: string }>({ kind: "idle", message: "" });
  const [fieldError, setFieldError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setFieldError("");
    setStatus({ kind: "sending", message: "Sending your enquiry securely…" });
    const formData = new FormData(event.currentTarget);
    const interests = formData.getAll("interests").map(String);
    const payload = Object.fromEntries(formData.entries());
    try {
      const response = await fetch("/api/site/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, formType: type, interests }),
      });
      const result = await response.json() as { message?: string; fields?: Record<string, string[]> };
      if (!response.ok) {
        const firstError = result.fields ? Object.values(result.fields).flat()[0] : undefined;
        setFieldError(firstError || "");
        setStatus({ kind: "error", message: result.message || "We couldn't send this enquiry. Please try again later." });
        return;
      }
      setStatus({ kind: "success", message: result.message || "Your enquiry was accepted for delivery." });
      form.reset();
    } catch {
      setStatus({ kind: "error", message: "We couldn't reach the enquiry service. Your message was not sent." });
    }
  }

  const demo = type === "demo";
  return (
    <form className="lead-form" onSubmit={submit}>
      <div className="form-grid">
        <label className="form-field"><span>Full name <b>*</b></span><input name="fullName" autoComplete="name" required minLength={2} maxLength={120} placeholder="Your name" /></label>
        <label className="form-field"><span>Work email <b>*</b></span><input name="workEmail" type="email" autoComplete="email" required maxLength={254} placeholder="you@organization.com" /></label>
        <label className="form-field"><span>Telephone <small>Optional</small></span><input name="phone" type="tel" autoComplete="tel" maxLength={40} placeholder="+233 …" /></label>
        <label className="form-field"><span>Facility or organization {demo && <b>*</b>}</span><input name="organization" autoComplete="organization" maxLength={160} placeholder="Organization name" required={demo} /></label>
        {demo && <>
          <label className="form-field"><span>Country</span><input name="country" autoComplete="country-name" maxLength={80} placeholder="Country" /></label>
          <label className="form-field"><span>Facility type</span><select name="facilityType" defaultValue=""><option value="">Select one</option><option>Diagnostic laboratory</option><option>Hospital laboratory</option><option>Diagnostic centre</option><option>Laboratory group</option><option>Corporate health</option><option>Other</option></select></label>
          <label className="form-field"><span>Number of facilities</span><select name="facilitiesCount" defaultValue=""><option value="">Select one</option><option>1</option><option>2–5</option><option>6–10</option><option>11+</option></select></label>
          <fieldset className="form-field form-interests"><legend>What would you like to explore?</legend><div className="checkbox-grid">{demoInterests.map((interest) => <label key={interest}><input type="checkbox" name="interests" value={interest} /><span>{interest}</span></label>)}</div></fieldset>
        </>}
        {!demo && <label className="form-field"><span>Subject</span><input name="subject" maxLength={160} placeholder="How can we help?" /></label>}
        <label className="form-field form-message"><span>{demo ? "A little about your needs" : "Message"} <b>*</b></span><textarea name="message" required minLength={10} maxLength={4000} rows={5} defaultValue={initialContext ? `I would like to discuss: ${initialContext}.\n\n` : undefined} placeholder={demo ? "Tell us about your facility and the workflows you want to discuss." : "Share a little context so we can direct your enquiry."} /></label>
      </div>
      <label className="honeypot" aria-hidden="true">Leave this field empty<input name="_website" tabIndex={-1} autoComplete="off" /></label>
      <p className="form-privacy">We’ll use these details only to respond to your enquiry. Do not include patient information or sensitive identifiers. See our <a href="/privacy-policy">privacy notice</a>.</p>
      {fieldError && <p className="form-inline-error" role="alert">{fieldError}</p>}
      <div className="form-submit-row"><button className="button button-dark" type="submit" disabled={status.kind === "sending"}>{status.kind === "sending" ? "Sending…" : demo ? "Request a conversation" : "Send enquiry"} <span aria-hidden="true">↗</span></button><span>No obligation. No patient data.</span></div>
      <p className={`form-status form-status-${status.kind}`} role="status" aria-live="polite">{status.message}</p>
    </form>
  );
}
