import { resultActionAllowed } from './resultPaymentPolicy';
export interface LaboratoryWorkflow {
    collection: 'completed' | 'bypassed' | 'pending';
    sampleValidation: 'completed' | 'bypassed' | 'pending';
    processing: 'completed' | 'bypassed' | 'pending';
    canCollect: boolean;
    canValidateSample: boolean;
    canProcess: boolean;
    canEnterResults: boolean;
    blockedReason: string | null;
}

export interface ResultWorkflowRecord {
    workflow?: LaboratoryWorkflow;
    paymentstatus?: unknown;
    resultEntryEnd?: unknown;
    isapproved?: unknown;
    requires_revalidation?: unknown;
    result_validation_stage?: string;
}

/** Explicit approval wins over display text; an amendment always invalidates release. */
export function isResultApproved(test?: ResultWorkflowRecord | null): boolean {
    if (!test || Number(test.requires_revalidation) === 1) return false;
    if (test.isapproved !== undefined && test.isapproved !== null) return String(test.isapproved).trim() === '1';
    return ['approved', 'validated'].includes(String(test.result_validation_stage ?? '').trim().toLowerCase());
}

export function resultApprovalLabel(test?: ResultWorkflowRecord | null): string {
    if (Number(test?.requires_revalidation) === 1) return 'Revalidation required';
    if (isResultApproved(test)) return 'Approved';
    return test?.resultEntryEnd ? 'Pending approval' : 'No result yet';
}

/** Validation has its own payment setting. Entry permission must not decide validation. */
export function canValidateResult(test: ResultWorkflowRecord | null | undefined, settings?: Record<string, unknown> | null): boolean {
    return Boolean(test?.resultEntryEnd && test.workflow?.canEnterResults &&
        resultActionAllowed(settings, test.paymentstatus, 'validation') && !isResultApproved(test));
}

// Fail closed while loading or talking to an older server. Never infer acceptance from a date.
export const workflowFor = (test?: { workflow?: LaboratoryWorkflow; paymentstatus?: unknown } | null, settings?: Record<string, unknown> | null): LaboratoryWorkflow => {
    const workflow: LaboratoryWorkflow = test?.workflow ?? {
    collection: 'pending', sampleValidation: 'pending', processing: 'pending',
    canCollect: false, canValidateSample: false, canProcess: false, canEnterResults: false,
    blockedReason: 'Refresh to load laboratory workflow eligibility',
    };
    if (settings !== undefined && workflow.canEnterResults && !resultActionAllowed(settings, test?.paymentstatus, 'entry')) {
        return { ...workflow, canEnterResults: false, blockedReason: 'Payment is required before entering results for this service.' };
    }
    return workflow;
};
