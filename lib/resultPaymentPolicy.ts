export type ResultPaymentAction = 'entry' | 'validation' | 'print';
const settingsKeys = { entry: 'allowResultEnteringUpaid', validation: 'allowValidationUpaid', print: 'allowPrintingUnpaid' } as const;

export function resultActionAllowed(settings: Record<string, unknown> | null | undefined, paymentStatus: unknown, action: ResultPaymentAction): boolean {
    return Number(settings?.[settingsKeys[action]]) === 1 || String(paymentStatus ?? '').trim().toLowerCase() === 'paid';
}
