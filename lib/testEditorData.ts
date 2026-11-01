const record = (value: unknown): value is Record<string, unknown> => value != null && typeof value === 'object' && !Array.isArray(value);

export function testEditorDetail(value: unknown): Record<string,unknown> & {name:string} {
    if (!record(value) || typeof value.name !== 'string' || !value.name.trim() || value.status === 'error' || value.status === false || value.success === false) {
        throw new Error('Test configuration is unavailable or this test was not found.');
    }
    return {...value,name:value.name};
}

export function testEditorArray(value: unknown, label: string): unknown[] {
    if (Array.isArray(value)) return value;
    if (record(value) && value.status !== 'error' && value.success !== false && value.status !== false) {
        if (Array.isArray(value.data)) return value.data;
        if (Array.isArray(value.result)) return value.result;
    }
    throw new Error(`Unable to load ${label}.`);
}
