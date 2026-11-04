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
