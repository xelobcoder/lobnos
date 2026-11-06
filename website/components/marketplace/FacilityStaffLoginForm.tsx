"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { marketplaceRequest } from "./client";
import { independentStaffLoginRequestSchema } from "../../lib/marketplace";

const loginResponseSchema = z.object({
  expiresAt: z.string(),
  facility: z.object({ slug: z.string(), name: z.string() }),
  staff: z.object({ id: z.number(), email: z.string(), role: z.string() }),
});

export function FacilityStaffLoginForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setError("");
    try {
      const loginRequest = independentStaffLoginRequestSchema.parse({
        facilitySlug: String(data.get("facilitySlug") || "").trim(),
        email: String(data.get("email") || "").trim(),
        password: String(data.get("password") || ""),
      });
      const result = await marketplaceRequest<unknown>("staff/login", "POST", loginRequest);
      const parsed = loginResponseSchema.safeParse(result);
      if (!parsed.success) throw new Error("The marketplace did not confirm a valid staff session.");
      form.reset();
      router.replace("/facility-dashboard");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof z.ZodError ? "Enter a valid listing slug, work email and password." : caught instanceof Error ? caught.message : "Sign in failed. Verify your details and try again.");
    } finally {
      setBusy(false);
    }
  }

  return <form className="facility-staff-login-form" onSubmit={submit}>
    <label className="form-field"><span>Facility listing slug <b>*</b></span><input name="facilitySlug" required minLength={2} maxLength={80} pattern="[a-z0-9]+(-[a-z0-9]+)*" autoComplete="organization" /></label>
    <label className="form-field"><span>Work email <b>*</b></span><input name="email" required type="email" maxLength={254} autoComplete="username" /></label>
    <label className="form-field"><span>Password <b>*</b></span><input name="password" required type="password" maxLength={72} autoComplete="current-password" /></label>
    <p className="booking-privacy-note">This login is only for approved independent marketplace facilities. Your session is an HTTP-only secure cookie; the website does not place it in local storage. It cannot sign in to PLS or another facility.</p>
    {error && <p className="form-status form-status-error" role="alert">{error}</p>}
    <button className="button button-dark" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in securely"} <span aria-hidden="true">→</span></button>
  </form>;
}
