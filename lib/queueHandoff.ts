import { customFetch, customFetchMutation } from '../components/Auth/customFetch';
import { queueData, QueueTicket } from './walkInQueue';

export interface QueueHandoff { ticketId: number; date?: string }
export function parseQueueHandoff(query?: { get: (name: string) => string | null } | null): QueueHandoff | null {
    const value = query?.get('queueTicket') || '';
    if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) return null;
    const date = query?.get('queueDate') || '';
    const parsedDate = new Date(`${date}T00:00:00Z`);
    if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date)) return null;
    return { ticketId: Number(value), ...(date ? { date } : {}) };
}
/** Carry only queue identity between authenticated screens, never name or phone. */
export function withQueueHandoff(url: string, handoff: QueueHandoff | null, pending = false): string {
    if (!handoff) return url;
    const [path, search = ''] = url.split('?');
    const query = new URLSearchParams(search);
    query.set('queueTicket', String(handoff.ticketId));
    if (handoff.date) query.set('queueDate', handoff.date);
    if (pending) query.set('queueLinkPending', '1');
    return `${path}?${query.toString()}`;
}
export async function loadQueueHandoffTicket(handoff: QueueHandoff): Promise<QueueTicket> {
    const query = handoff.date ? `?date=${encodeURIComponent(handoff.date)}` : '';
    const board = queueData<{ tickets: QueueTicket[] }>(await customFetch(`queue/tickets${query}`));
    const ticket = board.tickets?.find(item => Number(item.id) === handoff.ticketId);
    if (!ticket) throw new Error('The queue ticket could not be found. Open the queue to link this visit manually.');
    return ticket;
}
/** A follow-up queue failure must never turn a saved registration or sale into a failed save. */
export async function linkSavedRecordToQueue(handoff: QueueHandoff | null, values: { patientid: number; billingid?: number }): Promise<{ warning: string }> {
    if (!handoff) return { warning: '' };
    try {
        if (!Number.isSafeInteger(values.patientid) || values.patientid <= 0 || (values.billingid !== undefined && (!Number.isSafeInteger(values.billingid) || values.billingid <= 0))) throw new Error('The saved record has an invalid identifier.');
        const ticket = await loadQueueHandoffTicket(handoff);
        if (ticket.patientid && Number(ticket.patientid) !== values.patientid) throw new Error('This queue ticket is already linked to a different patient.');
        if (values.billingid && ticket.billingid && Number(ticket.billingid) !== values.billingid) throw new Error('This queue ticket is already linked to a different bill.');
        if (Number(ticket.patientid) === values.patientid && (!values.billingid || Number(ticket.billingid) === values.billingid)) return { warning: '' };
        if (!['waiting', 'called', 'serving'].includes(ticket.status)) throw new Error('This queue ticket is closed.');
        if (!Number.isSafeInteger(Number(ticket.version)) || Number(ticket.version) < 1) throw new Error('Refresh the queue before linking this visit.');
        const result = queueData<{ ticket: QueueTicket }>(await customFetchMutation(`queue/tickets/${handoff.ticketId}`, 'PATCH', { expectedVersion: Number(ticket.version), ...values }));
        if (Number(result.ticket?.patientid) !== values.patientid || (values.billingid && Number(result.ticket?.billingid) !== values.billingid)) throw new Error('The server did not confirm the queue link.');
        return { warning: '' };
    } catch (failure) {
        const reason = failure instanceof Error ? failure.message : 'The queue could not be reached.';
        return { warning: `The record was saved, but queue ticket #${handoff.ticketId} was not linked. ${reason} Do not save the record again; return to the queue to link the saved record.` };
    }
}
