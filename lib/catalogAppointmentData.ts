import { z } from 'zod';
import type { CatalogSelection } from './catalogAppointmentSelection';

const itemSchema = z.object({
    id: z.number().int().positive().safe(), name: z.string().min(1).max(160),
    price: z.number().finite().nonnegative(), available: z.boolean(),
    type: z.enum(['test', 'panel']),
});
const catalogSchema = z.object({
    source: z.literal('pls-live'),
    facility: z.object({ slug: z.string(), name: z.string().min(1).max(160) }),
    currency: z.string().regex(/^[A-Z]{3}$/),
    tests: z.array(itemSchema).max(20000),
});
const slotSchema = z.object({
    time: z.string().regex(/^([01]\d|2[0-3]):00$/),
    booked: z.number().int().nonnegative(), capacity: z.number().int().positive(), available: z.boolean(),
});
export const availabilitySchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    timeZone: z.string().min(1).max(100),
    slots: z.array(slotSchema).max(24),
});
export const createdAppointmentSchema = z.object({
    refid: z.number().int().positive().safe(), status: z.literal('pending'), timeZone: z.string().min(1).max(100),
});

export function selectedLiveCatalog(input: unknown, selection: CatalogSelection) {
    const parsed = catalogSchema.safeParse(input);
    if (!parsed.success || parsed.data.facility.slug !== selection.slug) throw new Error('The live facility catalog is unavailable. Return to the catalog and select your tests again.');
    const byId = new Map<number, z.infer<typeof itemSchema>>();
    for (const item of parsed.data.tests) {
        if (byId.has(item.id)) throw new Error('The live facility catalog is invalid. Please try again later.');
        byId.set(item.id, item);
    }
    const items = selection.itemIds.map(id => byId.get(id));
    if (items.some(item => !item?.available)) throw new Error('A selected test is no longer available. Return to the catalog and select your tests again.');
    return { facility: parsed.data.facility, currency: parsed.data.currency, items: items as z.infer<typeof itemSchema>[] };
}

export function pricesMatch(a: ReturnType<typeof selectedLiveCatalog>, b: ReturnType<typeof selectedLiveCatalog>): boolean {
    return a.currency === b.currency && a.facility.name === b.facility.name &&
        a.items.length === b.items.length && a.items.every((item, index) =>
            item.id === b.items[index].id && item.name === b.items[index].name &&
            item.type === b.items[index].type && item.price === b.items[index].price);
}

/** Calendar date in the server's reported timezone, without converting a chosen wall time. */
export function todayInZone(zone: string, now = new Date()): string {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
    const part = (name: string) => parts.find(item => item.type === name)?.value;
    return `${part('year')}-${part('month')}-${part('day')}`;
}

export function plusCalendarDays(date: string, days: number): string {
    const value = new Date(`${date}T00:00:00Z`);
    value.setUTCDate(value.getUTCDate() + days);
    return value.toISOString().slice(0, 10);
}
