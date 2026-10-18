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
export const workflowFor = (test?: { workflow?: LaboratoryWorkflow } | null): LaboratoryWorkflow => test?.workflow ?? {
    collection: 'pending', sampleValidation: 'pending', processing: 'pending',
    canCollect: false, canValidateSample: false, canProcess: false, canEnterResults: false,
    blockedReason: 'Refresh to load laboratory workflow eligibility',
};
