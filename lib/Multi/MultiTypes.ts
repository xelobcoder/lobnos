type entitytype = 'general' | 'organization' | 'insurance' | 'clinician' | 'phis'

export interface TestCartItem {
    discountedValue: number;
    price: number;
    name: string;
    id: number;
    isoutsourced: number;
    testid: number;
    prioritised: boolean;
    concessionMode: string;
    concessionValue: number;
    pricingType: string;
    actualPrice: number;
    originalPrice: number;
    discount: number;
    isNightTime?: boolean;
    amountIncurredDueTax: number;
    totalcost?: number;
    totalpayable?: number;
    cost?: number;
    hasNightAdjustment: boolean;
    nightAdjustmentValue: number;
    nightAdjustmentMode: string;
    nightAdjustmentStartTime: string;
    nightAdjustmentEndTime: string;
    promoDiscount?: number;
}

export interface ServicesListItem {
    serviceName: string;
    servicePrice: number;
    createdBy: number;
    keyid: number;
    username: string;
    issystem: number;
    discountedValue: number;
    discount: number;
    isNightTime?: boolean;
    amountIncurredDueTax: number;
    totalcost?: number;
    totalpayable?: number;
    cost?: number;
    hasNightAdjustment: boolean;
    prioritised: boolean;
    nightAdjustmentValue: number;
    nightAdjustmentMode: string;
    nightAdjustmentStartTime: string;
    nightAdjustmentEndTime: string;
}

export interface MultiBillingData {
    allowAdvancePayment?: boolean;
    openPaymentModal?: number;
    useSpecialCode?: boolean;
    specialCode?: string;
    billingid?: string | number;
    billingSource: number;
    claimscheckcode?:number;
    nhisnumber?:number;
    outstanding?: number;
    totalTestAmountPayable: number;
    showsummary?: boolean;
    patientid?: number | null;
    entityId?: string | number | null;
    nhismembershipid?: number | null;
    entitytype?: entitytype;
    excessAction?: 'balance' | 'refund';
    isPackageUsed: boolean;
    packageid?: number;
    status?: string;
    claimCode: string;
    NHISMemberID: string;
    entityname: string | null;
    servicesProvided: any[];
    previousRecordsSummary?: {
        billingid?: number;
        patientid?: number;
        totalTransactionCost?: string;
        totalcost?: string;
        paid?: string;
        payable?: string;
        totalrefunded?: string;
        discount?: string;
        outstanding?: string;
        balance?: string;
        billedon?: string;
        clientstatus?: string;
        year?: number;
        month?: number;
        day?: number;
        amountIncurredDueTax?: string;
        lastupdated?: string;
        branchid?: number;
        isPromo?: number;
        promoValue?: string;
        promoMethod?: string;
        promoCodeId?: number | null;
    };
    paymentStatus?: string;
    paymentReceived?: boolean;
    subtotal: number;
    additionalInfo: string;
    totaldiscount: number;
    totalAmountIncurredDueTax: number;
    totalServiceAmount: number;
    amountPayable: number;
    paid: number;
    balance: number;
    isAdjustment?: number;
    adjustmentType?: 'addition' | 'correction' | 'voided' | null;
    adjustmentReason?: string;
    relatedBillingId?: number | string;
    promoCode: number | null;
    promoDiscount?: number;
    testList?: TestCartItem[];
    payments?: Array<{ mode: string | number; amount: number }>;
    paymentModes: Array<{ KeyID: number; PaymentMode: string }>;
    cart: TestCartItem[];
    ispricingcheckout?: boolean;
    organizationId?: number | null;
    organizationname?: string | null;
    clinicianId?: number | null;
    clinicianname?: string | null;
    servicesList: ServicesListItem[];
    isPromo?: boolean;
    promoId: number | null;
    promoDetails?: {
        campaign_id: number | null;
        code: string;
        created_at: string;
        description: string;
        discount_type: string;
        discount_value: string;
        id: number;
        is_active: number;
        max_uses: number;
        times_used: number;
        updated_at: string;
        valid_from: string;
        valid_to: string;
    };
    branchid?: number;
    includeServices?: boolean;
    hasNightAdjustment?: boolean;
    previousRecords?: any[];
    previousPaymentHistory?: any[];
    employeeid: number | null;
    refundList?: any[];
    showdetails?: boolean;
    showRelatedBilling?: boolean;
    promoVerifySuccess?: boolean | null;
    promoVerifyMessage?: string | null;
    insuranceid: number | null;
    promoVerifyLoading?: boolean;
    billingIdVerified?: boolean;
    resultDeliveryMode?: string;
    result_delivery: any;
    resultDeliveryDetail?: string;
}

export const defaultMultiBillingData: MultiBillingData = {
    billingSource: 1,
    isPackageUsed: false,
    subtotal: 0,
    insuranceid:0,
    promoId: null,
    totaldiscount: 0,
    isAdjustment: 0,
    result_delivery: null,
    adjustmentType: 'addition',
    outstanding: 0,
    adjustmentReason: '',
    totalTestAmountPayable: 0,
    totalAmountIncurredDueTax: 0,
    totalServiceAmount: 0,
    amountPayable: 0,
    paid: 0,
    balance: 0,
    cart: [],
    servicesList: [],
    paymentModes: [],
    testList: [],
    promoDiscount: 0,
    patientid: null,
    clinicianId: null,
    clinicianname: null,
    organizationId: null,
    organizationname: null,
    isPromo: false,
    promoCode: null,
    paymentStatus: '',
    employeeid: null,
    paymentReceived: false,
    branchid: undefined,
    servicesProvided: [],
    includeServices: false,
    entityname: null,
    hasNightAdjustment: false,
    previousRecords: [],
    previousPaymentHistory: [],
    refundList: [],
    payments: [],
    entityId: undefined,
    entitytype: undefined,
    packageid: undefined,
    NHISMemberID: '',
    claimCode: '',
    ispricingcheckout: false,
    status: '',
    additionalInfo: '',
    showdetails: false,
    previousRecordsSummary: {},
    promoDetails: {
        campaign_id: null,
        code: '',
        created_at: '',
        description: '',
        discount_type: '',
        discount_value: '',
        id: 0,
        is_active: 0,
        max_uses: 0,
        times_used: 0,
        updated_at: '',
        valid_from: '',
        valid_to: ''
    },
    showRelatedBilling: false,
    promoVerifySuccess: null,
    promoVerifyMessage: null,
    promoVerifyLoading: false,
    billingIdVerified: false,
    openPaymentModal: undefined
};




export interface billingContextProps {
    categorytrackid: number,
    entitytype?: string,
    entityname?: string,
    billingid?: number | null,
    isNewTransaction?: boolean,
    isRelatedBilling?: boolean,
    patientid: number,
    entityid?: string,
    ispricingcheckout: boolean,
    isAdjustment?: boolean,
    adjustmentType?: 'addition' | 'correction' | 'voided' | null,
    adjustmentReason?: string,
    specialcode?: string,
}