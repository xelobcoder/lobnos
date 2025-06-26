type entitytype = 'general' | 'organization' | 'insurance' | 'clinician' | 'phis'


export interface TestCartItem {
        discountedValue: number;
        price: number;
        name: string;
        id: number;
        isoutsourced: number;
        testid: number;
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
        nightAdjustmentValue: number;
        nightAdjustmentMode: string;
        nightAdjustmentStartTime: string;
        nightAdjustmentEndTime: string;
    }

export interface MultiBillingData {
    billingid?: string | number;
    billingSource: number;
    patientid?: number |null;
    entityId?: string | number | null;
    entitytype?:entitytype;
    isPackageUsed: boolean;
    packageid?: number;
    status?: string;
    entityname:string | null;
    servicesProvided:any[],
    paymentStatus?: string;
    paymentReceived?: boolean;
    subtotal: number;
    additionalInfo :string,
    totaldiscount: number;
    totalAmountIncurredDueTax: number;
    totalServiceAmount: number;
    amountPayable: number;
    paid: number;
    balance: number;
promoCode:number |null;
    promoDiscount?: number;
    testList?: TestCartItem[];
    // Payment
    payments?: Array<{ mode: string | number; amount: number }>;
    paymentModes: Array<{ KeyID: number; PaymentMode: string }>;
    // Cart and services
    cart: TestCartItem[];
    servicesList: ServicesListItem[];
    // Promo
    isPromo?: boolean;
    // Misc
    branchid?: number;
    includeServices?: boolean;
    hasNightAdjustment?: boolean;
    previousRecords?: any[];
    previousPaymentHistory?: any[];
    employeeid: number |null;
    refundList?: any[];
    // Optionally add any other fields you use in your UI
    showdetails?: boolean;
}



export const defaultMultiBillingData: MultiBillingData = {
    billingSource: 1,
    isPackageUsed: false,
    subtotal: 0,
    totaldiscount: 0,
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
    patientid:null,
    isPromo: false,
    promoCode:null,
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
    status: '',
    additionalInfo:'',
    showdetails: false
};