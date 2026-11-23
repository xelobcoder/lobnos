/** Test selections are sensitive. Keep only identifiers in this tab, never in URLs or localStorage. */
export const CATALOG_APPOINTMENT_KEY = 'pls.catalog-appointment.v1';
export const CATALOG_APPOINTMENT_PATH = '/patientportal/catalog-request';
const TTL_MS = 15 * 60_000;

export type CatalogSelection = { slug: string; itemIds: number[]; createdAt: number };
type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function validCatalogSelection(value: unknown, now = Date.now()): value is CatalogSelection {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const candidate = value as Record<string, unknown>;
    if (Object.keys(candidate).sort().join(',') !== 'createdAt,itemIds,slug') return false;
    if (typeof candidate.slug !== 'string' || candidate.slug.length > 80 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(candidate.slug)) return false;
    if (!Number.isSafeInteger(candidate.createdAt) || (candidate.createdAt as number) > now ||
        now - (candidate.createdAt as number) >= TTL_MS) return false;
    const ids = candidate.itemIds;
    return Array.isArray(ids) && ids.length > 0 && ids.length <= 20 &&
        ids.every(id => typeof id === 'number' && Number.isSafeInteger(id) && id > 0) && new Set(ids).size === ids.length;
}

export function clearCatalogSelection(storage: StorageLike): boolean {
    try {
        storage.removeItem(CATALOG_APPOINTMENT_KEY);
        return storage.getItem(CATALOG_APPOINTMENT_KEY) === null;
    } catch { return false; }
}

export function readCatalogSelection(storage: StorageLike, now = Date.now()): CatalogSelection | null {
    try {
        const raw = storage.getItem(CATALOG_APPOINTMENT_KEY);
        if (!raw || raw.length > 2000) { if (raw) clearCatalogSelection(storage); return null; }
        const value: unknown = JSON.parse(raw);
        if (validCatalogSelection(value, now)) return value;
    } catch { /* Corrupt or inaccessible storage is treated as no selection. */ }
    clearCatalogSelection(storage);
    return null;
}

export function saveCatalogSelection(storage: StorageLike, slug: string, itemIds: number[], now = Date.now()): boolean {
    const value = { slug, itemIds: [...itemIds], createdAt: now };
    if (!validCatalogSelection(value, now)) return false;
    try {
        storage.setItem(CATALOG_APPOINTMENT_KEY, JSON.stringify(value));
        return readCatalogSelection(storage, now) !== null;
    } catch { return false; }
}

/** Never accept a caller-provided return URL. */
export function catalogLoginDestination(storage: StorageLike): string {
    return readCatalogSelection(storage) ? CATALOG_APPOINTMENT_PATH : '/patientportal';
}

/** Remove the current selection on expiry without deleting a newer selection from this tab. */
export function scheduleCatalogSelectionExpiry(storage: StorageLike, selection: CatalogSelection, onExpire: () => void): () => void {
    let timer: ReturnType<typeof setTimeout>;
    const check = () => {
        const remaining = selection.createdAt + TTL_MS - Date.now();
        if (remaining > 0) { timer = setTimeout(check, remaining); return; }
        try {
            const raw = storage.getItem(CATALOG_APPOINTMENT_KEY);
            const current = raw ? JSON.parse(raw) : null;
            if (current?.createdAt === selection.createdAt && current?.slug === selection.slug &&
                JSON.stringify(current?.itemIds) === JSON.stringify(selection.itemIds)) {
                clearCatalogSelection(storage);
                onExpire();
            }
        } catch { clearCatalogSelection(storage); onExpire(); }
    };
    timer = setTimeout(check, Math.max(0, selection.createdAt + TTL_MS - Date.now()));
    return () => clearTimeout(timer);
}
