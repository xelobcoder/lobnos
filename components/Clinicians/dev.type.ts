export interface PreviousClinicianBillingRecord extends IBillingStrategy {
    applicableTest: ApplicableTest[];
    applicableEntities: ApplicableEntity[];
}

export type EntityType = 'clinician' | 'insurance' | 'organization' | 'general';

export interface ApplicableTest {
    testid: number;
    discountedValue: number;
    concessionValue: number;
    concessionMode: 'absolute' | 'percentage';
    pricingType: 'discount' | 'surcharge';
    actualPrice: number;
    originalPrice: number;
    name: string
}

export interface ApplicableEntity {
    entity_type: EntityType;
    name: string;
    id: number;


    insuranceName?: string;
    entity_id: number;
}

export interface BillingStrategyRequestBody {
    allConcessionApplied: boolean;
    concessionMode: 'absolute' | 'percentage';
    concessionValue: number;
    applicableTest: ApplicableTest[];
    description?: string | null;
    valid_from?: string | null;
    valid_until?: string | null;
    price_type?: 'discount' | 'surcharge';
    name?: string;
}

export interface IBillingStrategy {
    strategyid: number;
    name: string;
    description: string | null;
    allConcessionApplied: number;
    concessionMode: 'absolute' | 'percentage';
    concessionValue: number;
    price_type: 'discount' | 'surcharge';
    valid_from: string | null;
    valid_until: string | null;
    is_expired: boolean;
    createdon: string;
    updatedon: string | null;
}