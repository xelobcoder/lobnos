export interface PreviousClinicianBillingRecord {
    strategyId: number;
    clinicianId: number;
    allconcessionApplied: number;
    concessionMode: 'absolute' | 'percentage';
    applicableOrganization: string | null;
    applicableTest: Array<{
        actualPrice: number;
        concessionValue: number;
        discountedValue: number;
        originalPrice: number;
        testName: string;
        testid: number;
        concessionMode: 'absolute' | 'percentage'
    }>;
    concessionValue: string;
    createdOn: string;
    updatedon: string | null;
}
