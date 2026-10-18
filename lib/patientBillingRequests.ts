export interface RequestedTest {
    testid: number;
    name: string;
    estimatedPrice: string;
}

export interface PatientBillingRequest {
    id: number;
    patientid: number;
    testIds: number[];
    tests?: { testid: number; name: string }[];
    note: string;
    status: 'submitted' | 'rejected' | 'converted';
    billingid: number | null;
    review_note: string;
    created_at: string;
    firstname?: string;
    lastname?: string;
    fullpatientid?: string;
}

export function requestReviewUrl(encryptedPatientId: string, requestId: number): string {
    if (!Number.isSafeInteger(requestId) || requestId <= 0) throw new Error('Invalid request.');
    return `/billing/patientid/${encryptedPatientId}/multi/1?entitytype=general&isRelatedBilling=0&billingRequestId=${requestId}`;
}

export function requestedCart<T extends { testid: number }>(tests: T[], ids: number[]): T[] {
    const selected = ids.map(id => tests.find(test => Number(test.testid) === id));
    if (!ids.length || selected.some(test => !test)) {
        throw new Error('A requested test is no longer available. Do not save a partial request; contact the patient or reject it.');
    }
    return selected as T[];
}
