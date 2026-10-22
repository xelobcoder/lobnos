import { buildApiUrl } from './apiBaseUrl';

export type QueueStatus = 'waiting' | 'called' | 'serving' | 'completed' | 'cancelled';
export interface QueueFacility { slug: string; name: string }
export interface QueueSettings { publicEnabled: boolean; displayEnabled: boolean; ticketPrefix: string; version: number }
export interface QueueTicket {
    id: number; ticketNumber: string; queueDate?: string; status: QueueStatus; createdAt: string; version: number;
    name?: string; phone?: string; patientid?: number | null; billingid?: number | null; counter?: string | null;
    notes?: string | null; testsTotal: number; testsCompleted: number; testsValidated: number;
}
export interface QueueBoard {
    facility: QueueFacility; date: string; tickets: QueueTicket[]; updatedAt: string;
    summary: { waiting: number; called: number; serving: number; completed: number; total: number };
}
export interface PublicQueueConfig { facility: QueueFacility; settings: Pick<QueueSettings, 'publicEnabled' | 'displayEnabled' | 'ticketPrefix'>; date: string }

export const queueStatusLabels: Record<QueueStatus, string> = { waiting: 'Waiting', called: 'Called', serving: 'In service', completed: 'Finished', cancelled: 'Cancelled' };
const transitions: Record<QueueStatus, QueueStatus[]> = {
    waiting: ['called', 'cancelled'], called: ['serving', 'waiting', 'cancelled'],
    serving: ['completed', 'waiting', 'cancelled'], completed: [], cancelled: [],
};
export const nextQueueStatuses = (status: QueueStatus): QueueStatus[] => transitions[status] || [];
export const queueFailure = (failure: unknown): string => failure instanceof Error ? failure.message : 'Unable to update the queue. Please try again.';
/** Idempotency keys also work on facility LAN kiosks served over plain HTTP. */
export function createQueueRetryKey(source: { randomUUID?: () => string; getRandomValues?: (bytes: Uint8Array) => Uint8Array } | null = typeof crypto === 'undefined' ? null : crypto): string {
    if (typeof source?.randomUUID === 'function') return source.randomUUID();
    if (typeof source?.getRandomValues === 'function') {
        const bytes = source.getRandomValues(new Uint8Array(16));
        return `queue-${Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')}`;
    }
    return `queue-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}
export function queueData<T>(response: unknown): T {
    const value = response as { status?: string; message?: string; error?: string; data?: T } | null;
    if (value?.status !== 'success' || value.data == null) throw new Error(value?.message || value?.error || 'The server did not confirm this request.');
    return value.data;
}
/** Public requests intentionally carry no staff credentials or tenant query parameters. */
export async function publicQueueRequest<T>(slug: string, resource: 'config' | 'tickets' | 'display', body?: unknown): Promise<T> {
    if (!slug || slug.length > 120) throw new Error('This queue link is invalid.');
    const response = await fetch(buildApiUrl(`public/queue/${encodeURIComponent(slug)}/${resource}`), {
        method: body === undefined ? 'GET' : 'POST', cache: 'no-store', credentials: 'omit',
        headers: { 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    let result: unknown;
    try { result = await response.json(); } catch { throw new Error('The queue could not be reached. Please try again.'); }
    if (!response.ok) {
        const error = result as { message?: string };
        throw new Error(error?.message || 'The queue request failed. Please try again.');
    }
    return queueData<T>(result);
}
export function checkInBody(name: string, phone: string, idempotencyKey: string) {
    const cleanName = name.trim().replace(/\s+/g, '');
    const cleanPhone = phone.trim();
    if (!cleanName.length || name.trim().length > 160) throw new Error('Enter your name (up to 160 characters).');
    const digits = cleanPhone.replace(/\D/g, '').length;
    if (!/^\+?[\d\s().-]{7,30}$/.test(cleanPhone) || digits < 7 || digits > 15) throw new Error('Enter a valid phone number with 7 to 15 digits.');
    if (!/^[A-Za-z0-9_-]{10,100}$/.test(idempotencyKey)) throw new Error('Please refresh this page before checking in.');
    return { name: name.trim().replace(/\s+/g, ' '), phone: cleanPhone, idempotencyKey };
}
export function queueUpdate(ticket: QueueTicket, values: { status?: QueueStatus; counter?: string; patientid?: string; billingid?: string; note?: string }) {
    if (!Number.isSafeInteger(Number(ticket.version)) || Number(ticket.version) < 1) throw new Error('Refresh the queue before updating this ticket.');
    const body: Record<string, unknown> = { expectedVersion: Number(ticket.version) };
    if (values.status) {
        if (!nextQueueStatuses(ticket.status).includes(values.status)) throw new Error('This action is no longer available. Refresh the queue.');
        body.status = values.status;
    }
    if (values.counter !== undefined) {
        if (values.counter.trim().length > 80) throw new Error('Enter a counter or desk name using at most 80 characters.');
        body.counter = values.counter.trim();
    }
    for (const field of ['patientid', 'billingid'] as const) {
        if (values[field] === undefined) continue;
        const input = values[field]!.trim();
        if (input && (!/^[1-9]\d*$/.test(input) || !Number.isSafeInteger(Number(input)))) throw new Error(`Enter a valid ${field === 'patientid' ? 'patient' : 'billing'} ID.`);
        body[field] = input ? Number(input) : null;
    }
    if (values.note?.trim()) body.note = values.note.trim();
    return body;
}
export function queueProgress(ticket: Pick<QueueTicket, 'testsTotal' | 'testsCompleted' | 'testsValidated'>) {
    const count = (value: number) => Number.isFinite(Number(value)) ? Math.max(0, Math.floor(Number(value))) : 0;
    const total = count(ticket.testsTotal);
    const completed = Math.min(total, count(ticket.testsCompleted));
    const validated = Math.min(total, count(ticket.testsValidated));
    return { total, completed, validated, pending: Math.max(0, total - completed), percent: total ? Math.round(completed / total * 100) : 0 };
}
export function localQueueDate(now = new Date()): string {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
