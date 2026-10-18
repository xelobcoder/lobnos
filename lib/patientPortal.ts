/**
 * Shared, framework-free helpers for the PLS Patient Portal pages.
 * Validation rules mirror the backend so users get immediate feedback;
 * the backend remains the authority.
 */

export type ResultStage = 'registered' | 'collected' | 'processing' | 'completed' | 'verified';
export type ResultPending = 'in_progress' | 'awaiting_verification' | 'awaiting_payment' | 'awaiting_release' | null;

export interface PortalTest {
     ascensionid: number;
     testid: number;
     billingid: number;
     testname: string;
     requestedOn: string | null;
     stage: ResultStage;
     released: boolean;
     pending: ResultPending;
     completedOn: string | null;
}

export interface PortalAppointment {
     refid: string;
     appointment_date: string;
     appointment_time: string | null;
     duration?: number | null;
     status: string;
     title?: string | null;
     purpose?: string | null;
     location?: string | null;
     preference?: string | null;
     appointment_type?: string | null;
     practitioner?: string | null;
     upcoming: boolean;
}

export interface PortalResponse<T> {
     status?: string;
     statusCode?: number;
     code?: string;
     message?: string;
     data?: T;
     error?: string;
}

const STAGE_LABELS: Record<string, string> = {
     registered: 'Registered',
     collected: 'Sample collected',
     processing: 'Processing',
     completed: 'Completed',
     verified: 'Verified',
};

const PENDING_LABELS: Record<string, string> = {
     in_progress: 'In progress',
     awaiting_verification: 'Awaiting verification',
     awaiting_payment: 'Awaiting payment',
     awaiting_release: 'Awaiting release',
};

export const stageLabel = (stage: string | null | undefined) => STAGE_LABELS[String(stage)] || 'Registered';

/** Label and react-bootstrap badge variant describing what the patient can do with a test. */
export function resultStatus(test: Pick<PortalTest, 'released' | 'pending'>): { label: string; variant: string } {
     if (test.released) return { label: 'Ready', variant: 'success' };
     if (test.pending === 'awaiting_payment') return { label: PENDING_LABELS.awaiting_payment, variant: 'warning' };
     if (test.pending && PENDING_LABELS[test.pending]) return { label: PENDING_LABELS[test.pending], variant: 'secondary' };
     return { label: 'In progress', variant: 'secondary' };
}

/** Groups tests by billing (visit) id, newest visit first. */
export function groupTestsByVisit(tests: PortalTest[]): { billingid: number; requestedOn: string | null; tests: PortalTest[]; released: number }[] {
     const groups = new Map<number, { billingid: number; requestedOn: string | null; tests: PortalTest[]; released: number }>();
     for (const test of tests || []) {
          const group = groups.get(test.billingid) || { billingid: test.billingid, requestedOn: test.requestedOn, tests: [], released: 0 };
          group.tests.push(test);
          if (test.released) group.released += 1;
          groups.set(test.billingid, group);
     }
     return [...groups.values()].sort((a, b) => b.billingid - a.billingid);
}

export function formatMoney(value: unknown): string {
     const amount = Number(value);
     return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 })
          .format(Number.isFinite(amount) ? amount : 0);
}

export function formatDate(value: unknown, withTime = false): string {
     if (!value) return '-';
     const date = new Date(String(value));
     if (Number.isNaN(date.getTime())) return '-';
     return withTime
          ? date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
          : date.toLocaleDateString(undefined, { dateStyle: 'medium' });
}

/** Mirrors the backend password policy: 8-128 characters with at least one letter and one digit. */
export function passwordProblem(password: string, confirmation?: string): string | null {
     const value = String(password || '');
     if (value.length < 8) return 'Password must be at least 8 characters.';
     if (value.length > 128) return 'Password must be at most 128 characters.';
     if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return 'Password must contain at least one letter and one number.';
     if (confirmation !== undefined && confirmation !== value) return 'Passwords do not match.';
     return null;
}

/** Client-side checks for the self-registration form; the backend re-validates and never reveals matches. */
export function registrationProblem(input: { facility: string; patientNumber: string; dateOfBirth: string; email: string }): string | null {
     if (!/^[A-Za-z0-9]{3,32}$/.test(String(input.facility || '').trim())) return 'Enter your facility code (letters and numbers only).';
     if (!String(input.patientNumber || '').trim()) return 'Enter your patient ID.';
     if (!/^\d{4}-\d{2}-\d{2}$/.test(String(input.dateOfBirth || ''))) return 'Enter your date of birth.';
     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(input.email || '').trim())) return 'Enter a valid email address.';
     return null;
}

/** Invitation tokens are `FACILITYID.<43 base64url characters>`. */
export const INVITATION_TOKEN_PATTERN = /^[A-Za-z0-9]{3,32}\.[A-Za-z0-9_-]{43}$/;
export const isInvitationToken = (token: unknown) => INVITATION_TOKEN_PATTERN.test(String(token || '').trim());

/** Returns the `data` of a successful portal response, or throws with the server's message. */
export function unwrap<T>(response: PortalResponse<T> | null | undefined, fallback = 'Something went wrong. Please try again.'): T {
     if (!response) throw new Error(fallback);
     if (response.status === 'success') return response.data as T;
     throw new Error(response.message || response.error || fallback);
}

export const errorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.') =>
     error instanceof Error && error.message ? error.message : fallback;

export const flagVariant = (flag: string | null | undefined) => {
     const value = String(flag || '').toUpperCase();
     if (value === 'H' || value === 'HIGH') return 'danger';
     if (value === 'L' || value === 'LOW') return 'warning';
     return '';
};

/** Paid when nothing is outstanding; otherwise partly paid or unpaid. */
export function billStatus(bill: { paid?: unknown; outstanding?: unknown }): { label: string; variant: string } {
     const outstanding = Number(bill.outstanding) || 0;
     if (outstanding <= 0) return { label: 'Paid', variant: 'success' };
     return (Number(bill.paid) || 0) > 0 ? { label: 'Part paid', variant: 'warning' } : { label: 'Unpaid', variant: 'danger' };
}

/** Which release control staff can use for a test; payment and verification gates cannot be bypassed. */
export function staffReleaseAction(test: Pick<PortalTest, 'released' | 'pending' | 'stage'>): 'release' | 'withdraw' | null {
     if (test.released) return 'withdraw';
     if (test.stage === 'verified' && test.pending === 'awaiting_release') return 'release';
     return null;
}

export const accountStateLabel = (account: { status?: string | null } | null | undefined): { label: string; variant: string } => {
     if (!account) return { label: 'Not activated', variant: 'secondary' };
     if (account.status === 'disabled') return { label: 'Disabled', variant: 'danger' };
     if (account.status === 'active') return { label: 'Active', variant: 'success' };
     return { label: String(account.status || 'Unknown'), variant: 'secondary' };
};

/** Mirrors the backend APPOINTMENT_TYPES list. */
export const APPOINTMENT_TYPES = [
     { value: 'laboratory', label: 'Laboratory test' },
     { value: 'consultation', label: 'Consultation' },
     { value: 'ultrasound', label: 'Ultrasound' },
     { value: 'follow_up', label: 'Follow-up' },
] as const;

/** Local calendar date as YYYY-MM-DD. */
export function todayIso(now = new Date()): string {
     return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function formatTime(value: unknown): string {
     const match = /^(\d{2}):(\d{2})/.exec(String(value || ''));
     return match ? `${match[1]}:${match[2]}` : '-';
}

/** Same date/time rules the backend applies to appointment requests and reschedules. */
export function appointmentSlotProblem(date: string, time: string, today = todayIso()): string | null {
     if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || Number.isNaN(new Date(`${date}T00:00:00`).getTime()) || date < today) {
          return 'Choose a valid date from today onwards.';
     }
     if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time || '')) return 'Choose a valid time.';
     return null;
}

export function appointmentRequestProblem(input: { date: string; time: string; type: string; reason: string }, today = todayIso()): string | null {
     const slot = appointmentSlotProblem(input.date, input.time, today);
     if (slot) return slot;
     if (!APPOINTMENT_TYPES.some((type) => type.value === input.type)) return 'Choose a valid appointment type.';
     const reason = String(input.reason || '').trim();
     if (reason.length < 3 || reason.length > 500) return 'Describe the reason in 3-500 characters.';
     return null;
}

export interface PortalSettings {
     portal_enabled: boolean;
     self_registration_enabled: boolean;
     staff_invitations_enabled: boolean;
     result_release_policy: 'approved' | 'manual';
     require_payment_for_results: boolean;
     appointment_requests_enabled: boolean;
     appointment_request_practitioner: number | null;
     billing_enabled: boolean;
     email_notifications_enabled: boolean;
     sms_notifications_enabled: boolean;
     invitation_expiry_hours: number;
     result_notifications_enabled: boolean;
     appointment_slot_capacity: number;
     booking_start_hour: number;
     booking_end_hour: number;
     home_collection_enabled: boolean;
     home_collection_slot_capacity: number;
     home_collection_note: string;
     payment_instructions: string;
     help_contact: string;
}

export interface BookingSlot { time: string; booked: number; capacity: number; available: boolean }

export interface BillingSummary {
     bills: number;
     payable: number;
     paid: number;
     outstanding: number;
     unpaidBills: number;
     paymentInstructions: string;
}

export interface FacilityContact { name: string; phone: string; email: string; address: string; website: string; help: string }

export type HomeCollectionStatus = 'Pending' | 'Confirmed' | 'Assigned' | 'EnRoute' | 'Collected' | 'Received' | 'Completed' | 'Cancelled';

export interface HomeCollection {
     id: number;
     reference: string;
     date: string;
     time: string;
     area: string;
     address: string;
     landmark: string;
     contactPhone: string;
     note: string;
     status: HomeCollectionStatus;
     statusLabel: string;
     collectorAssigned: boolean;
     cancellable: boolean;
     cancelledAt: string | null;
     fee: number;
     tests: { name: string; price: number }[];
     estimatedTotal: number;
     billingid: number | null;
     createdAt: string;
     timeline: { status: HomeCollectionStatus; label: string; done: boolean; current: boolean; at: string | null }[];
}

export interface HomeCollectionOptions {
     areas: { id: number; name: string; fee: number }[];
     note: string;
     hours: { start: number; end: number };
     maxDaysAhead: number;
     testsAvailable: boolean;
     defaultPhone: string;
}

/** Badge variant for a home collection status. */
export function homeCollectionVariant(status: string): string {
     if (status === 'Cancelled') return 'secondary';
     if (status === 'Completed' || status === 'Received' || status === 'Collected') return 'success';
     if (status === 'Pending') return 'warning';
     return 'info';
}

/** Mirrors the backend booking validation so patients get immediate feedback. */
export function homeCollectionProblem(input: { areaId: string; date: string; time: string; address: string; contactPhone: string }, today = todayIso()): string | null {
     if (!Number(input.areaId)) return 'Choose your collection area.';
     if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date || '') || input.date < today) return 'Choose a collection date from today onwards.';
     if (!/^([01]\d|2[0-3]):00$/.test(input.time || '')) return 'Choose one of the available time slots.';
     const address = String(input.address || '').trim();
     if (address.length < 10 || address.length > 500) return 'Enter the collection address in 10-500 characters.';
     if (String(input.contactPhone || '').replace(/\D/g, '').length < 9) return 'Enter a valid contact phone number.';
     return null;
}

/** Last date a patient can book, as YYYY-MM-DD. */
export function bookingMaxDate(days: number, now = new Date()): string {
     return todayIso(new Date(now.getFullYear(), now.getMonth(), now.getDate() + days));
}

export const AUDIT_ACTIONS: Record<string, string> = {
     'login.success': 'Signed in',
     'logout': 'Signed out',
     'account.activated.invitation': 'Activated account (invitation)',
     'account.activated.self_registration': 'Activated account (online registration)',
     'account.enabled': 'Portal access enabled',
     'account.disabled': 'Portal access disabled',
     'registration.started': 'Online registration started',
     'invitation.created': 'Invitation created',
     'invitation.revoked': 'Invitation revoked',
     'settings.updated': 'Portal settings changed',
     'results.list': 'Viewed results list',
     'results.report.view': 'Viewed result report',
     'result.released': 'Result released',
     'result.withdrawn': 'Result withdrawn',
     'billing.view': 'Viewed bill',
     'appointment.requested': 'Requested appointment',
     'appointment.cancel_requested': 'Requested cancellation',
     'appointment.reschedule_requested': 'Requested reschedule',
     'preferences.updated': 'Updated notification preferences',
     'password.changed': 'Changed password',
     'password.reset.requested': 'Password reset requested',
     'password.reset.completed': 'Password reset completed',
     'home_collection.requested': 'Booked home collection',
     'home_collection.cancelled': 'Cancelled home collection',
};

export function auditActionLabel(action: string): string {
     const value = String(action || '');
     if (AUDIT_ACTIONS[value]) return AUDIT_ACTIONS[value];
     if (value.startsWith('login.failed')) {
          const reason = value.slice('login.failed'.length).replace(/^\./, '').replace(/[._]/g, ' ');
          return reason ? `Failed sign-in (${reason})` : 'Failed sign-in';
     }
     return value ? value.replace(/[._]/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase()) : '-';
}

export const fullName = (person: { firstname?: string | null; middlename?: string | null; lastname?: string | null } | null | undefined) =>
     [person?.firstname, person?.middlename, person?.lastname].filter(Boolean).join(' ');

export interface QuickResultRow { name: string; value: string; units: string; reference: string; flag: 'H' | 'L' | ''; rich: boolean }

const hasMarkup = (value: string) => /<\/?[a-z][^>]*>/i.test(value);

/**
 * Plain, phone-friendly rows built from the same records the laboratory report renders. Flags come from
 * the recorded flag or, for numeric limits, the same high/low rule as the report; rich-text findings
 * are not reproduced and point the patient to the full report instead.
 */
export function quickResultRows(records: unknown): QuickResultRow[] {
     if (!Array.isArray(records)) return [];
     return records.filter(record => record && typeof record === 'object').map((record: any) => {
          const value = record.value === null || record.value === undefined ? '' : String(record.value).trim();
          const rich = hasMarkup(value);
          const lower = Number.parseFloat(record.lowerlimit);
          const upper = Number.parseFloat(record.upperlimit);
          const limits = record.plan === 'limits' && Number.isFinite(lower) && Number.isFinite(upper);
          let flag: QuickResultRow['flag'] = '';
          const recorded = String(record.flag ?? record.indicator ?? '').toUpperCase();
          if (recorded === 'H' || recorded === 'L') flag = recorded;
          else if (limits && !rich) {
               const numeric = Number.parseFloat(value.replace(/^[<>]=?/, ''));
               if (Number.isFinite(numeric)) flag = numeric > upper ? 'H' : numeric < lower ? 'L' : '';
          }
          const textReference = typeof record.textReference === 'string' && !hasMarkup(record.textReference) ? record.textReference.trim() : '';
          return {
               name: String(record.name || record.field || 'Result'),
               value: rich ? '' : value,
               units: String(record.units || ''),
               reference: limits ? `${record.lowerlimit} – ${record.upperlimit}` : textReference,
               flag,
               rich,
          };
     });
}
