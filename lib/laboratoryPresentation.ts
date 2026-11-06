import moment from 'moment';

/** Missing and malformed dates must never look like recorded workflow events. */
export function laboratoryDate(value: unknown, missing = 'Not recorded'): string {
    if (value === null || value === undefined || value === '') return missing;
    if (!(typeof value === 'string' || typeof value === 'number' || value instanceof Date)) return 'Unavailable';
    const date = moment(value);
    return date.isValid() ? date.format('LLLL') : 'Unavailable';
}

export function processingDates(test: { processingStartDate?: unknown; processingEndDate?: unknown; workflow?: { processing?: string } }, settings?: { byPassProcessing?: unknown }) {
    const bypassed = test.workflow?.processing === 'bypassed' ||
        (!test.workflow && Number(settings?.byPassProcessing) === 1 && !test.processingEndDate);
    if (bypassed && !test.processingStartDate && !test.processingEndDate) return { start: 'Bypassed by configuration', end: null };
    return {
        start: laboratoryDate(test.processingStartDate, test.processingEndDate ? 'Start not recorded' : 'Not started'),
        end: laboratoryDate(test.processingEndDate, test.processingStartDate ? 'In progress' : 'Not completed'),
    };
}
