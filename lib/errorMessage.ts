export function errorMessage(value: unknown, fallback = 'An unexpected error occurred'): string {
    if (value instanceof Error) return value.message || fallback;
    if (typeof value === 'string') return value || fallback;
    if (value && typeof value === 'object' && 'message' in value && typeof value.message === 'string') return value.message || fallback;
    return fallback;
}
