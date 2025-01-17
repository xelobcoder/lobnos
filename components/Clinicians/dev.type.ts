export interface PreviousClinicianBillingRecord {
    strategyId: number;
    clinicianId: number;
    allconcessionApplied: number;
    concessionMode: 'absolute' | 'percentage';
    applicableOrganization: string | null;
    applicableTest: Array<{
        actualPrice: number;
        concessionAmount: number;
        discountedAmount: number;
        originalPrice: number;
        testName: string;
        testid: number;
        concessionMode: 'absolute' | 'percentage'
    }>;
    concessionAmount: string;
    createdOn: string;
    updatedOn: string | null;
}
