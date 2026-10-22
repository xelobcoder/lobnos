export type StorageState = 'available' | 'stored' | 'retrieved' | 'disposed';
export type LifecycleAction = 'aliquot' | 'store' | 'retrieve' | 'retention' | 'dispose';

export interface Specimen {
    id: number;
    sample_uid: string;
    barcode?: string;
    version: number;
    status: string;
    storage_state: StorageState;
    quantity?: number | string | null;
    remaining_quantity?: number | string | null;
    unit?: string | null;
    sample_type_name?: string | null;
    container_type_name?: string | null;
    patient_name?: string;
    fullpatientid?: string;
    billingid?: number;
    parent_sample_id?: number | null;
    parent_barcode?: string | null;
    aliquot_count?: number;
    retention_until?: string | null;
    freezer?: string | null;
    rack?: string | null;
    position?: string | null;
}

export interface StoragePosition {
    id: number;
    freezer: string;
    rack: string;
    position: string;
    temperature_c?: number | string | null;
    notes?: string | null;
    is_active: boolean | number;
    sample_id?: number | null;
    sample_barcode?: string | null;
}

export interface LifecycleCapabilities {
    canAliquot: boolean;
    canStore: boolean;
    canRetrieve: boolean;
    canSetRetention: boolean;
    canDispose: boolean;
    canManageLocations: boolean;
    canOverrideRetention: boolean;
}

export interface SpecimenLifecycleDetail {
    sample: Specimen;
    parent: Specimen | null;
    aliquots: Specimen[];
    storagePosition: StoragePosition | null;
    capabilities: LifecycleCapabilities;
    events: Array<{
        id: number;
        event_type: string;
        actor_name?: string;
        actor_employeeid?: number;
        reason?: string;
        created_at: string;
        metadata?: unknown;
    }>;
}

export interface LifecycleForm {
    quantity: string;
    positionId: string;
    reason: string;
    notes: string;
    retentionMode: 'days' | 'date';
    retentionDays: string;
    retentionUntil: string;
    method: string;
    witnessEmployeeId: string;
    witnessed: boolean;
    confirmDisposal: boolean;
    overrideRetention: boolean;
}

export const emptyLifecycleForm = (): LifecycleForm => ({
    quantity: '', positionId: '', reason: '', notes: '', retentionMode: 'days',
    retentionDays: '', retentionUntil: '', method: '', witnessEmployeeId: '',
    witnessed: false, confirmDisposal: false, overrideRetention: false,
});

export const actionTitles: Record<LifecycleAction, string> = {
    aliquot: 'Create aliquot', store: 'Store / return', retrieve: 'Retrieve specimen',
    retention: 'Set retention', dispose: 'Document disposal',
};

const capabilityForAction: Record<LifecycleAction, keyof LifecycleCapabilities> = {
    aliquot: 'canAliquot', store: 'canStore', retrieve: 'canRetrieve',
    retention: 'canSetRetention', dispose: 'canDispose',
};

export function availableLifecycleActions(detail: SpecimenLifecycleDetail): LifecycleAction[] {
    if (detail.sample.storage_state === 'disposed') return [];
    return (Object.keys(actionTitles) as LifecycleAction[]).filter(action => detail.capabilities?.[capabilityForAction[action]] === true);
}

export function storageLabel(position?: Pick<StoragePosition, 'freezer' | 'rack' | 'position'> | null): string {
    return position ? `${position.freezer} / ${position.rack} / ${position.position}` : 'Not in storage';
}

export function freeStoragePositions(positions: StoragePosition[]): StoragePosition[] {
    return positions.filter(position => Boolean(Number(position.is_active)) && position.sample_id == null);
}

export function hasUnexpiredRetention(sample: Specimen, now = Date.now()): boolean {
    return Boolean(sample.retention_until && new Date(sample.retention_until).getTime() > now);
}

/** A datetime-local value is interpreted in the operator's local timezone, then sent as UTC. */
export function localRetentionToIso(value: string): string {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error('Choose a valid retention date and time.');
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) throw new Error('Choose a valid retention date and time.');
    const [year, month, day, hour, minute] = value.match(/\d+/g)!.map(Number);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day || date.getHours() !== hour || date.getMinutes() !== minute) {
        throw new Error('Choose a valid retention date and time.');
    }
    return date.toISOString();
}

export function lifecycleMutation(
    detail: SpecimenLifecycleDetail, action: LifecycleAction, form: LifecycleForm,
    actorEmployeeId?: number, now = Date.now(),
): { endpoint: string; method: 'POST' | 'PUT'; body: Record<string, unknown> } {
    if (!availableLifecycleActions(detail).includes(action)) throw new Error('This action is no longer available. Refresh the specimen.');
    const { sample } = detail;
    if (!Number.isSafeInteger(Number(sample.version)) || Number(sample.version) < 1) throw new Error('Refresh the specimen before making changes.');
    const body: Record<string, unknown> = { expectedVersion: Number(sample.version) };
    let suffix: string = action;
    switch (action) {
        case 'aliquot': {
            const quantity = Number(form.quantity);
            if (!/^\d+(?:\.\d{1,2})?$/.test(form.quantity) || quantity <= 0) throw new Error('Enter an aliquot quantity greater than zero, using at most two decimal places.');
            if (sample.remaining_quantity == null || quantity > Number(sample.remaining_quantity)) throw new Error('Aliquot quantity exceeds the remaining specimen quantity.');
            body.quantity = quantity;
            if (form.notes.trim()) body.notes = form.notes.trim();
            suffix = 'aliquots';
            break;
        }
        case 'store': {
            const positionId = Number(form.positionId);
            if (!Number.isSafeInteger(positionId) || positionId <= 0) throw new Error('Choose an available storage position.');
            body.positionId = positionId;
            suffix = 'storage';
            break;
        }
        case 'retrieve':
            if (!form.reason.trim()) throw new Error('Record the reason for retrieving this specimen.');
            body.reason = form.reason.trim();
            break;
        case 'retention': {
            if (!form.reason.trim()) throw new Error('Record the reason for changing retention.');
            body.reason = form.reason.trim();
            if (form.retentionMode === 'days') {
                const days = Number(form.retentionDays);
                if (!Number.isSafeInteger(days) || days < 1 || days > 36500) throw new Error('Enter a retention period between 1 and 36,500 whole days.');
                body.retentionDays = days;
            } else {
                const date = localRetentionToIso(form.retentionUntil);
                if (new Date(date).getTime() <= now) throw new Error('The retention date must be in the future.');
                body.retentionUntil = date;
            }
            const requestedDeadline = body.retentionUntil ? new Date(String(body.retentionUntil)).getTime() : now + Number(body.retentionDays) * 86400000;
            if (sample.retention_until && requestedDeadline < new Date(sample.retention_until).getTime() && !detail.capabilities.canOverrideRetention) {
                throw new Error('Only an administrator or manager can shorten an existing retention period.');
            }
            break;
        }
        case 'dispose': {
            if (!form.method.trim() || !form.reason.trim()) throw new Error('Record both the disposal method and reason.');
            const witness = Number(form.witnessEmployeeId);
            if (!Number.isSafeInteger(witness) || witness <= 0 || witness === Number(actorEmployeeId)) throw new Error('Choose a different active laboratory staff member as the witness.');
            if (!form.witnessed || !form.confirmDisposal) throw new Error('Confirm the witness was present and that the specimen has been disposed of.');
            if (hasUnexpiredRetention(sample, now)) {
                if (!detail.capabilities.canOverrideRetention || !form.overrideRetention) throw new Error('Retention has not expired. An administrator or manager must explicitly authorize early disposal.');
                body.overrideRetention = true;
            }
            body.method = form.method.trim();
            body.reason = form.reason.trim();
            body.witnessEmployeeId = witness;
            break;
        }
    }
    return { endpoint: `physical-samples/${sample.id}/${suffix}`, method: action === 'retention' ? 'PUT' : 'POST', body };
}

/** Preserve the same key for a retry of the same version and form; successful requests remove it. */
export function requestIdempotencyKey(keys: Map<string, string>, fingerprint: string, create: () => string): string {
    const existing = keys.get(fingerprint);
    if (existing) return existing;
    const key = create();
    keys.set(fingerprint, key);
    return key;
}

export function readableEventMetadata(metadata: unknown): string {
    if (metadata == null) return '';
    let parsed = metadata;
    if (typeof metadata === 'string') {
        try { parsed = JSON.parse(metadata); } catch { return metadata; }
    }
    if (!parsed || typeof parsed !== 'object') return String(parsed ?? '');
    return Object.entries(parsed).map(([key, value]) => `${key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ')}: ${value && typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')}`).join(' · ');
}
