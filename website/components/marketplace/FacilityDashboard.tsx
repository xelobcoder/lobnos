"use client";
import NewPasswordInput from '../../../components/Auth/NewPasswordInput';

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { z } from "zod";
import { marketplaceRequest } from "./client";
import { marketplaceFacilitySchema } from "../../lib/marketplace";

const staffMeSchema = z.object({
  staff: z.object({ id: z.number(), email: z.string(), role: z.string() }),
  facility: z.object({ id: z.number(), slug: z.string(), name: z.string(), integrationState: z.string() }),
});
const bookingSchema = z.object({
  bookingId: z.string().uuid(),
  status: z.string(),
  patient: z.object({ name: z.string(), phone: z.string(), email: z.string().nullable() }),
  collectionMethod: z.string(),
  collectionAddress: z.string().nullable(),
  scheduledAt: z.string().nullable(),
  scheduleInstructions: z.string().nullable(),
  totalAmount: z.number(),
  currency: z.string(),
  createdAt: z.string(),
  paymentStatus: z.string(),
  items: z.array(z.object({ name: z.string(), price: z.number(), currency: z.string() })),
  paymentClaims: z.array(z.object({
    id: z.number(), reference: z.string().optional(), amount: z.number(), status: z.string(),
    decisionReason: z.string().nullable().optional(), createdAt: z.string(),
  })),
});
const catalogItemSchema = z.object({
  id: z.number().int().positive(), type: z.enum(["test", "panel"]), name: z.string(),
  description: z.string().nullable(), price: z.number(), sampleRequirements: z.array(z.string()),
  collectionMethods: z.array(z.enum(["in_facility", "home"])), available: z.boolean(),
  turnaroundHours: z.number().nullable(),
});
const userSchema = z.object({ id: z.number(), email: z.string(), role: z.string(), active: z.boolean(), createdAt: z.string() });
type Booking = z.infer<typeof bookingSchema>;
type CatalogItem = z.infer<typeof catalogItemSchema>;
type StaffUser = z.infer<typeof userSchema>;
type StaffContext = z.infer<typeof staffMeSchema>;

async function checkedArray<T>(path: string, key: string, schema: z.ZodType<T>) {
  const response = await marketplaceRequest<unknown>(path, "GET");
  const parsed = z.object({ [key]: z.array(schema) }).safeParse(response);
  if (!parsed.success) throw new Error("The facility dashboard received an unexpected response.");
  return parsed.data[key] as T[];
}

export function FacilityDashboard() {
  const [context, setContext] = useState<StaffContext | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [profile, setProfile] = useState<z.infer<typeof marketplaceFacilitySchema> | null>(null);
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const me = staffMeSchema.parse(await marketplaceRequest<unknown>("staff/me", "GET"));
      setContext(me);
      if (me.facility.integrationState !== "independent") {
        setBookings([]);
        setCatalog([]);
        setUsers([]);
        return;
      }
      const [bookingRows, catalogResponse, publicCatalogResponse] = await Promise.all([
        checkedArray("staff/bookings", "bookings", bookingSchema),
        marketplaceRequest<unknown>("staff/catalog", "GET"),
        marketplaceRequest<unknown>(`facilities/${me.facility.slug}/catalog`, "GET"),
      ]);
      const catalogParsed = z.object({ items: z.array(catalogItemSchema) }).safeParse(catalogResponse);
      const publicCatalogParsed = z.object({ facility: marketplaceFacilitySchema }).safeParse(publicCatalogResponse);
      if (!catalogParsed.success || !publicCatalogParsed.success) throw new Error("The facility dashboard received an unexpected catalog response.");
      setBookings(bookingRows);
      setCatalog(catalogParsed.data.items);
      setProfile(publicCatalogParsed.data.facility);
      if (me.staff.role === "admin") {
        setUsers(await checkedArray("staff/users", "staff", userSchema));
      } else setUsers([]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The facility dashboard could not be loaded.");
      setContext(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void reload(); }, 0);
    return () => window.clearTimeout(timer);
  }, [reload]);

  async function logout() {
    setBusy("logout");
    try {
      await marketplaceRequest<unknown>("staff/logout", "POST", {});
    } catch {
      // Clear local page state even if the session has already expired.
    }
    setContext(null);
    setBookings([]);
    setCatalog([]);
    setProfile(null);
    setUsers([]);
    setMessage("Signed out of the independent-facility dashboard.");
    setBusy("");
  }

  async function mutate(label: string, path: string, method: "POST" | "PATCH", body: unknown) {
    setBusy(label);
    setError("");
    setMessage("");
    try {
      await marketplaceRequest<unknown>(path, method, body);
      setMessage("Update accepted by the marketplace service.");
      await reload();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The update could not be completed.");
    } finally {
      setBusy("");
    }
  }

  if (loading) return <div className="dashboard-loading" role="status">Loading private facility workspace…</div>;
  if (!context) return <div className="dashboard-login-required"><span className="eyebrow">PRIVATE STAFF WORKSPACE</span><h2>Sign in to continue.</h2><p>{error || "Your private session is not active."}</p><Link className="button button-dark" href="/facility-dashboard/login">Facility staff login <span aria-hidden="true">→</span></Link></div>;
  if (context.facility.integrationState !== "independent") return <div className="dashboard-linked-boundary"><span className="eyebrow">PLS-CONNECTED FACILITY</span><h2>Use your authorized PLS facility workspace.</h2><p>This marketplace staff session is only for independent facilities. It does not authenticate or authorize a PLS facility user. Open your approved facility portal to manage PLS operations.</p><Link className="button button-dark" href="/facility-login">Find your facility portal <span aria-hidden="true">↗</span></Link><button className="text-button" type="button" onClick={logout}>Sign out of this marketplace session</button></div>;

  const isAdmin = context.staff.role === "admin";
  return <div className="facility-dashboard">
    <header className="facility-dashboard-head"><div><span className="eyebrow">INDEPENDENT FACILITY WORKSPACE</span><h1>{context.facility.name}</h1><p>{context.staff.email} · {context.staff.role}</p></div><div><Link className="button button-outline" href={`/facilities/${context.facility.slug}`}>View public profile <span aria-hidden="true">↗</span></Link><button className="text-button" type="button" disabled={busy === "logout"} onClick={logout}>Sign out</button></div></header>
    {error && <p className="form-status form-status-error" role="alert">{error}</p>}
    {message && <p className="form-status form-status-success" role="status">{message}</p>}
    <section className="dashboard-section"><div className="dashboard-section-heading"><div><span className="eyebrow">FACILITY REQUESTS</span><h2>Booking requests</h2></div><button className="text-button" type="button" onClick={() => void reload()}>Refresh</button></div>
      {bookings.length === 0 ? <p className="dashboard-empty">No booking requests are currently available.</p> : <div className="dashboard-bookings">{bookings.map((booking) => <BookingCard key={booking.bookingId} booking={booking} isAdmin={isAdmin} busy={busy} onMutate={mutate} />)}</div>}
    </section>
    {isAdmin && profile && <CatalogAdmin catalog={catalog} currency={profile.currency} busy={busy} onMutate={mutate} />}
    {isAdmin && profile && <ProfileAdmin profile={profile} busy={busy} onMutate={mutate} />}
    {isAdmin && <UsersAdmin users={users} busy={busy} onMutate={mutate} />}
    <p className="dashboard-boundary-note">This independent marketplace workspace does not access or change PLS tenant records, create PLS billing or lab orders, or execute external payments or refunds. Payment decisions and recorded refunds apply only to this marketplace facility workflow.</p>
  </div>;
}

function BookingCard({ booking, isAdmin, busy, onMutate }: { booking: Booking; isAdmin: boolean; busy: string; onMutate: (label: string, path: string, method: "POST" | "PATCH", body: unknown) => Promise<void> }) {
  const [reason, setReason] = useState("");
  const [scheduleAt, setScheduleAt] = useState("");
  const [scheduleInstructions, setScheduleInstructions] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReference, setRefundReference] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const canSchedule = booking.status === "accepted" && booking.paymentStatus === "verified";
  const canCancel = ["requested", "accepted", "scheduled"].includes(booking.status);
  const canRefund = isAdmin && booking.status === "cancelled" && booking.paymentStatus === "verified";
  const mutation = (action: string, extra: Record<string, unknown> = {}) => onMutate(`${booking.bookingId}-${action}`, `staff/bookings/${booking.bookingId}/decision`, "POST", { action, reason: reason.trim(), ...extra });

  return <article className="dashboard-booking-card">
    <div className="dashboard-booking-top"><div><b>Request {booking.bookingId}</b><span>Received {new Date(booking.createdAt).toLocaleString()}</span></div><span className="booking-state-pill">{booking.status.replaceAll("_", " ")} · {booking.paymentStatus.replaceAll("_", " ")}</span></div>
    <div className="dashboard-booking-body"><div><h3>{booking.patient.name}</h3><p>{booking.patient.phone}{booking.patient.email && <> · {booking.patient.email}</>}</p><p>{booking.collectionMethod === "home" ? `Home collection: ${booking.collectionAddress || "address not provided"}` : "In-facility collection"}</p>{booking.scheduledAt && <p>Scheduled {new Date(booking.scheduledAt).toLocaleString()}{booking.scheduleInstructions ? ` · ${booking.scheduleInstructions}` : ""}</p>}</div>
      <div className="dashboard-booking-items">{booking.items.map((item, index) => <div key={`${item.name}-${index}`}><span>{item.name}</span><b>{new Intl.NumberFormat("en", { style: "currency", currency: item.currency }).format(item.price)}</b></div>)}<div><b>Total</b><b>{new Intl.NumberFormat("en", { style: "currency", currency: booking.currency }).format(booking.totalAmount)}</b></div></div></div>
    {booking.paymentClaims.length > 0 && <div className="dashboard-claims"><b>Payment claims</b>{booking.paymentClaims.map((claim) => <div key={claim.id}><span>Claim #{claim.id} · {claim.status} · {new Intl.NumberFormat("en", { style: "currency", currency: booking.currency }).format(claim.amount)}{claim.reference ? ` · ${claim.reference}` : " · reference restricted by role"}</span>{isAdmin && claim.status === "pending_verification" && <div className="dashboard-inline-actions"><button type="button" disabled={Boolean(busy) || !reason.trim()} onClick={() => void onMutate(`${booking.bookingId}-claim-${claim.id}`, `staff/bookings/${booking.bookingId}/payment-claims/${claim.id}/decision`, "POST", { decision: "verified", reason: reason.trim() })}>Verify</button><button type="button" disabled={Boolean(busy) || !reason.trim()} onClick={() => void onMutate(`${booking.bookingId}-claim-${claim.id}`, `staff/bookings/${booking.bookingId}/payment-claims/${claim.id}/decision`, "POST", { decision: "rejected", reason: reason.trim() })}>Reject</button></div>}</div>)}</div>}
    <label className="form-field dashboard-reason"><span>Decision reason <small>Required for decisions</small></span><input value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1000} /></label>
    <div className="dashboard-actions">
      {booking.status === "requested" && <><button type="button" disabled={Boolean(busy) || !reason.trim()} onClick={() => void mutation("accept")}>Accept request</button><button type="button" disabled={Boolean(busy) || !reason.trim()} onClick={() => void mutation("reject")}>Reject request</button></>}
      {canSchedule && <div className="dashboard-schedule"><label className="form-field"><span>Scheduled time (your local time)</span><input type="datetime-local" value={scheduleAt} onChange={(event) => setScheduleAt(event.target.value)} /></label><label className="form-field"><span>Scheduling instructions</span><input value={scheduleInstructions} onChange={(event) => setScheduleInstructions(event.target.value)} maxLength={1000} /></label><button type="button" disabled={Boolean(busy) || !reason.trim() || !scheduleAt} onClick={() => void mutation("schedule", { scheduledAt: new Date(scheduleAt).toISOString(), scheduleInstructions: scheduleInstructions.trim() || undefined })}>Schedule request</button></div>}
      {booking.status === "scheduled" && booking.paymentStatus === "verified" && <button type="button" disabled={Boolean(busy) || !reason.trim()} onClick={() => void mutation("collect")}>Mark collected</button>}
      {booking.status === "collected" && booking.paymentStatus === "verified" && <button type="button" disabled={Boolean(busy) || !reason.trim()} onClick={() => void mutation("process")}>Mark processing</button>}
      {booking.status === "processing" && booking.paymentStatus === "verified" && <button type="button" disabled={Boolean(busy) || !reason.trim()} onClick={() => void mutation("complete")}>Mark complete</button>}
      {canCancel && <button type="button" className="dashboard-danger" disabled={Boolean(busy) || !reason.trim()} onClick={() => void mutation("cancel")}>Cancel request</button>}
    </div>
    {canRefund && <form className="dashboard-refund-form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void onMutate(`${booking.bookingId}-refund`, `staff/bookings/${booking.bookingId}/refunds`, "POST", { amount: Number(refundAmount), externalReference: refundReference.trim(), reason: refundReason.trim() }); }}>
      <b>Record a refund made outside this service</b><p>This records a staff-confirmed external transfer. It does not move money.</p>
      <div className="form-grid"><label className="form-field"><span>Amount</span><input type="number" min="0.01" max={booking.totalAmount} step="0.01" value={refundAmount} onChange={(event) => setRefundAmount(event.target.value)} required /></label><label className="form-field"><span>External transfer reference</span><input value={refundReference} onChange={(event) => setRefundReference(event.target.value)} maxLength={120} required /></label><label className="form-field form-message"><span>Reason</span><input value={refundReason} onChange={(event) => setRefundReason(event.target.value)} maxLength={1000} required /></label></div><button type="submit" disabled={Boolean(busy)}>Record external refund</button>
    </form>}
  </article>;
}

function CatalogAdmin({ catalog, currency, busy, onMutate }: { catalog: CatalogItem[]; currency: string; busy: string; onMutate: (label: string, path: string, method: "POST" | "PATCH", body: unknown) => Promise<void> }) {
  const [type, setType] = useState<"test" | "panel">("test");
  const [collectionMethods, setCollectionMethods] = useState<("in_facility" | "home")[]>(["in_facility"]);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void onMutate("catalog-create", "staff/catalog", "POST", {
      type, name: String(data.get("name") || "").trim(), description: String(data.get("description") || "").trim() || null,
      price: Number(data.get("price")), sampleRequirements: String(data.get("sampleRequirements") || "").split("\n").map((entry) => entry.trim()).filter(Boolean),
      collectionMethods, available: true, ...(data.get("turnaroundHours") ? { turnaroundHours: Number(data.get("turnaroundHours")) } : {}),
    });
  }
  function toggleMethod(method: "in_facility" | "home") {
    setCollectionMethods((current) => current.includes(method) ? current.filter((value) => value !== method) : [...current, method]);
  }
  return <section className="dashboard-section"><div className="dashboard-section-heading"><div><span className="eyebrow">ADMINISTRATOR ONLY</span><h2>Independent catalog</h2></div></div>
    <div className="dashboard-catalog-grid">{catalog.map((item) => <article key={item.id} className="dashboard-catalog-item"><div><span>{item.type}</span><h3>{item.name}</h3></div><b>{new Intl.NumberFormat("en", { style: "currency", currency }).format(item.price)}</b><p>{item.description || "No description supplied."}</p><span>{item.collectionMethods.join(" · ")} · {item.available ? "Available" : "Unavailable"}</span><button type="button" disabled={Boolean(busy)} onClick={() => void onMutate(`catalog-${item.id}`, `staff/catalog/${item.id}`, "PATCH", { available: !item.available })}>{item.available ? "Mark unavailable" : "Mark available"}</button><details className="catalog-edit-details"><summary>Edit details and price</summary><CatalogItemEditor item={item} busy={Boolean(busy)} onSave={(payload) => onMutate(`catalog-${item.id}`, `staff/catalog/${item.id}`, "PATCH", payload)} /></details></article>)}</div>
    <details className="dashboard-editor"><summary>Add catalog item</summary><form onSubmit={submit} className="form-grid">
      <label className="form-field"><span>Item type</span><select value={type} onChange={(event) => setType(event.target.value as "test" | "panel")}><option value="test">Test</option><option value="panel">Panel</option></select></label>
      <label className="form-field"><span>Name</span><input name="name" required maxLength={160} /></label>
      <label className="form-field"><span>Price</span><input name="price" type="number" min="0" step="0.01" required /></label>
      <label className="form-field"><span>Turnaround hours</span><input name="turnaroundHours" type="number" min="1" step="1" /></label>
      <label className="form-field form-message"><span>Description</span><textarea name="description" maxLength={3000} rows={2} /></label>
      <label className="form-field form-message"><span>Sample requirements <small>One per line</small></span><textarea name="sampleRequirements" rows={2} maxLength={3000} /></label>
      <fieldset className="form-field form-message"><legend>Collection methods</legend><label><input type="checkbox" checked={collectionMethods.includes("in_facility")} onChange={() => toggleMethod("in_facility")} /> At facility</label><label><input type="checkbox" checked={collectionMethods.includes("home")} onChange={() => toggleMethod("home")} /> Home collection</label></fieldset>
      <button type="submit" disabled={Boolean(busy) || collectionMethods.length === 0}>Add item</button>
    </form></details>
  </section>;
}

function CatalogItemEditor({ item, busy, onSave }: { item: CatalogItem; busy: boolean; onSave: (payload: Record<string, unknown>) => Promise<void> }) {
  const [methods, setMethods] = useState(item.collectionMethods);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      name: String(data.get("name") || "").trim(),
      description: String(data.get("description") || "").trim() || null,
      price: Number(data.get("price")),
      sampleRequirements: String(data.get("sampleRequirements") || "").split("\n").map((entry) => entry.trim()).filter(Boolean),
      collectionMethods: methods,
      ...(data.get("turnaroundHours") ? { turnaroundHours: Number(data.get("turnaroundHours")) } : {}),
    };
    void onSave(payload);
  }
  function toggle(method: "in_facility" | "home") {
    setMethods((current) => current.includes(method) ? current.filter((value) => value !== method) : [...current, method]);
  }
  return <form className="catalog-item-edit-form" onSubmit={submit}>
    <label className="form-field"><span>Name</span><input name="name" defaultValue={item.name} required maxLength={160} /></label>
    <label className="form-field"><span>Price</span><input name="price" defaultValue={item.price} type="number" min="0" step="0.01" required /></label>
    <label className="form-field"><span>Description</span><textarea name="description" defaultValue={item.description || ""} maxLength={3000} rows={2} /></label>
    <label className="form-field"><span>Sample requirements <small>One per line</small></span><textarea name="sampleRequirements" defaultValue={item.sampleRequirements.join("\n")} maxLength={3000} rows={2} /></label>
    <label className="form-field"><span>Turnaround hours</span><input name="turnaroundHours" defaultValue={item.turnaroundHours || ""} type="number" min="1" step="1" /></label>
    <fieldset className="form-field"><legend>Collection methods</legend><label><input type="checkbox" checked={methods.includes("in_facility")} onChange={() => toggle("in_facility")} /> At facility</label><label><input type="checkbox" checked={methods.includes("home")} onChange={() => toggle("home")} /> Home collection</label></fieldset>
    <button type="submit" disabled={busy || methods.length === 0}>Save catalog item</button>
  </form>;
}

function ProfileAdmin({ profile, busy, onMutate }: { profile: z.infer<typeof marketplaceFacilitySchema>; busy: string; onMutate: (label: string, path: string, method: "POST" | "PATCH", body: unknown) => Promise<void> }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const openingHours = Object.fromEntries(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => [day, String(data.get(`hours-${day}`) || "").trim()]));
    void onMutate("profile-update", "staff/profile", "PATCH", {
      phone: String(data.get("phone") || "").trim(),
      contactEmail: String(data.get("contactEmail") || "").trim(),
      description: String(data.get("description") || "").trim(),
      paymentInstructions: String(data.get("paymentInstructions") || "").trim(),
      openingHours,
    });
  }
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  return <section className="dashboard-section"><div className="dashboard-section-heading"><div><span className="eyebrow">ADMINISTRATOR ONLY</span><h2>Facility profile</h2></div></div><p>Changes update public contact, description, hours and payment instructions. Name, address and currency are not editable here. Do not include patient information.</p><form onSubmit={submit} className="form-grid dashboard-profile-form">
    <label className="form-field"><span>Public phone</span><input name="phone" defaultValue={profile.phone} maxLength={40} /></label>
    <label className="form-field"><span>Public contact email</span><input name="contactEmail" type="email" defaultValue={profile.contactEmail} maxLength={254} /></label>
    <label className="form-field form-message"><span>Description</span><textarea name="description" defaultValue={profile.description} maxLength={3000} rows={3} /></label>
    <label className="form-field form-message"><span>Payment instructions</span><textarea name="paymentInstructions" defaultValue={profile.paymentInstructions || ""} maxLength={1000} rows={2} /></label>
    <fieldset className="form-field form-message opening-hours-field"><legend>Opening hours</legend><div className="opening-hours-grid">{days.map((day) => <label key={day}><span>{day}</span><input name={`hours-${day}`} defaultValue={profile.openingHours[day] || ""} maxLength={80} /></label>)}</div></fieldset>
    <button type="submit" disabled={Boolean(busy)}>Save profile changes</button>
  </form><Link className="text-link" href={`/facilities/${profile.slug}`}>Open current public profile <span aria-hidden="true">↗</span></Link></section>;
}

function UsersAdmin({ users, busy, onMutate }: { users: StaffUser[]; busy: string; onMutate: (label: string, path: string, method: "POST" | "PATCH", body: unknown) => Promise<void> }) {
  const [passwordError, setPasswordError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const password = String(data.get("password") || "");
    if (new TextEncoder().encode(password).byteLength > 72) {
      setPasswordError("Password must be at most 72 UTF-8 bytes.");
      return;
    }
    setPasswordError("");
    void onMutate("staff-create", "staff/users", "POST", { email: String(data.get("email") || "").trim(), password });
    form.reset();
  }
  return <section className="dashboard-section"><div className="dashboard-section-heading"><div><span className="eyebrow">ADMINISTRATOR ONLY</span><h2>Staff accounts</h2></div></div><div className="dashboard-users">{users.map((user) => <div key={user.id}><span>{user.email}</span><span>{user.role} · {user.active ? "active" : "inactive"}</span>{user.role !== "admin" && <button type="button" disabled={Boolean(busy)} onClick={() => void onMutate(`user-${user.id}`, `staff/users/${user.id}`, "PATCH", { active: !user.active })}>{user.active ? "Deactivate" : "Reactivate"}</button>}</div>)}</div>
    <form className="dashboard-add-user" onSubmit={submit}><label className="form-field"><span>New staff email</span><input type="email" name="email" required maxLength={254} autoComplete="off" /></label><label className="form-field"><span>Temporary password <small>12+ characters, ≤72 UTF-8 bytes</small></span><NewPasswordInput type="password" name="password" required minLength={12} maxLength={72} autoComplete="new-password"  confirmation /></label><button type="submit" disabled={Boolean(busy)}>Create staff account</button>{passwordError && <p className="form-status form-status-error" role="alert">{passwordError}</p>}</form>
  </section>;
}
