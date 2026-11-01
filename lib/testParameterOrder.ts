export interface OrderedTestParameter {
    name: string;
    ordering?: string | number | null;
    units?: string;
    plan?: string;
}

export function orderedTestParameters<T extends OrderedTestParameter>(fields: readonly T[]): T[] {
    const position = (field: T, index: number) =>
        field.ordering != null && field.ordering !== '' && Number.isFinite(Number(field.ordering))
            ? Number(field.ordering)
            : index;
    return fields
        .map((field, index) => ({field, index}))
        .sort((a, b) => position(a.field, a.index) - position(b.field, b.index) || a.index - b.index)
        .map(row => row.field);
}

export function moveTestParameter<T>(fields: readonly T[], from: number, to: number): T[] {
    if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < 0 || from >= fields.length || to >= fields.length) {
        throw new Error('Invalid parameter position');
    }
    const next = [...fields];
    const [field] = next.splice(from, 1);
    next.splice(to, 0, field);
    return next;
}

export function applyTestParameterOrder<T extends OrderedTestParameter>(fields: readonly T[]): T[] {
    return fields.map((field, index) => ({...field, ordering: index}));
}
