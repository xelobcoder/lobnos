import {errorMessage} from './errorMessage';
import { customFetch, customPost } from "../components/Auth/customFetch";


interface BillingSource {
    label: string;
    value: number;
}

interface UrgencyOption {
    value: string;
    label: string;
}

interface OrganizationOption {
    value: string;
    label: string;
}

interface BillingData {
    test: string;
    organizationId: string | number;
    lockSource: boolean;
    clinicianId: string | number;
    paymentmode: number;
    paid: number;
    refundList: any[];
    includeServices: boolean;
    nightAdjustmentValue: number;
    nightStart: string | number;
    nightEnd: number | string;
    nightAdjustmentMode: string;
    hasNightAdjustment: boolean;
    includeTest: boolean;
    discount: number;
    hourMode: number;
    cost: number;
    isPackageUsed: boolean;
    totalServiceDiscount: number;
    outstandingDebt: number;
    totalTestDiscount: number;
    status: string;
    isConditionsUnderstood?: boolean;
    payable: number;
    testcost: number;
    type: string;
    previousRecords: any[];
    servicesProvided: any[];
    totalCostOfServices: number;
    taxAppliedRecords: any[];
    previewPrevious: boolean;
    taxIncluded: boolean;
    isServiceOnly?: boolean;
    insuranceId?: string | number;
    categoryTrackid?: number;
    branchid?: number;
    taxValue: number;
    patientid: number | null;
    outstanding: number;
    samplingCenter:number | null;
    testpanels: any[];
    employeeid: string | number;
    billingSource: number;
    appsettings: {
        taxIncluded: boolean;
        taxValue: number;
    };
    cart: any[];
    isFree: boolean;
    cantIgnoreDebt: boolean;
    organizationData: any[];
    clinicianData: any[];
    amountIncurredDueTax: number;
    hasOutstandingDebt: boolean;
    paymentmodeData: any[];
    startTime?: string;
    endTime?: string;
    previousPaid?: number;
}

interface MultiBillingData {
    test: string;
    entityId: string | number;
    lockSource: boolean;
    paymentmode: number;
    paid: number;
    refundList: any[];
    includeServices: boolean;
    nightAdjustmentValue: number;
    nightStart: string | number;
    nightEnd: number | string;
    nightAdjustmentMode: string;
    hasNightAdjustment: boolean;
    promo:boolean;
    isPromoValid?: boolean;
    promoMethod?: string;
    promoAmount?: number;
    includeTest: boolean;
    discount: number;
    hourMode: number;
    cost: number;
    isPackageUsed: boolean;
    totalServiceDiscount: number;
    outstandingDebt: number;
    totalTestDiscount: number;
    status: string;
    isConditionsUnderstood?: boolean;
    payable: number;
    testcost: number;
    type: string;
    previousRecords: any[];
    servicesProvided: any[];
    totalCostOfServices: number;
    taxAppliedRecords: any[];
    previewPrevious: boolean;
    taxIncluded: boolean;
    isServiceOnly?: boolean;
    isPromo?: boolean;
    insuranceId?: string | number;
    categoryTrackid?: number;
    branchid?: number;
    taxValue: number;
    patientid: number | null;
    outstanding: number;
    samplingCenter:number | null;
    testpanels: any[];
    employeeid: string | number;
    billingSource: number;
    appsettings: {
        taxIncluded: boolean;
        taxValue: number;
    };
    cart: any[];
    isFree: boolean;
    cantIgnoreDebt: boolean;
    organizationData: any[];
    clinicianData: any[];
    amountIncurredDueTax: number;
    hasOutstandingDebt: boolean;
    paymentmodeData: any[];
    actualAmountPayable: number;
    startTime?: string;
    endTime?: string;
    previousPaid?: number;
    entitytype?: string;
    entityname?: string;
    entityid?: string | number;
    specialcode?: string;
}

interface BillingFailuresType {
    notOrganizationSelected: string;
    notClinicianSelected: string;
    cartEmpty: string;
    serviceAndCartEmpty: string;
    fullPayment: string;
    requiredParametersMissed: string;
    wrongTaxCalculations: string;
    invalidBillingData: string; // Added missing property
}

export const billingSource: BillingSource[] = [
    { label: "General Billing", value: 1 },
    { label: "Organizational Billing", value: 2 },
    { label: "Private Health Insurance Scheme(P.H.I.S)", value: 3 },
    { label: "National Health Insurance Scheme(N.H.I.S)", value: 4 },
    { label: "Special Health Care Provider Billing", value: 6 }
];

export const urgencyOptions: UrgencyOption[] = [
    { value: "urgent", label: "Urgent/Critical" },
    { value: "routine", label: "Routine" },
    { value: "normal", label: "Normal" },
    { value: "moderate", label: "Moderate" }
];

export const organizationOptions: OrganizationOption[] = [
    { value: "self", label: "Self" },
    { value: "organization", label: "Organization" },
    { value: "clinician", label: "Clinician" },
];

export const getAllNecessaryData = async (): Promise<{ 
    organizationData: any[]; 
    clinicianData: any[]; 
    testpanels: any[]; 
} | string> => {
    try {
        const panels = await customFetch("testpanel/list/bulk/billing");
        const organization = await customFetch("organization");
        const clinician = await customFetch("clinicians");
        const myprops = await Promise.all([panels, organization, clinician]);
        return {
            organizationData: myprops[1]?.organizations ?? [],
            clinicianData: myprops[2]?.result ?? [],
            testpanels: myprops[0]?.data ?? [],
        };
    } catch (err) {
        return 'something wrong occurred';
    }
};

export const fetchOurSourcingOrganization = async (
    setOrganization?: (data: any[]) => void
): Promise<any[]> => {
    const response = await customFetch(`outsourcing/organization/all`);
    if (Array.isArray(response) && setOrganization) {
        setOrganization(response);
    }
    return response;
}

export const getOustandingBill = async function (patientid: string|number) {
    try {
        if (!patientid || isNaN(Number(patientid))) return;
        const response = await customFetch(`billing/client/bulk/outstanding?patientid=${patientid}`);
        const { result } = response;
        if (result && Array.isArray(result)) {
            const outstandingDebt = result.length > 0 ? result[0]?.outstanding : 0
            return parseFloat(outstandingDebt);
        }
    } catch (err) {
        return "ERROR"
    }
}


export const canIgnoreDebtPaymentAndTax = async function () {
    const applicationSettings = await customFetch(`applicationsettings/billing`);
    if (applicationSettings && typeof applicationSettings === "object") {
        const { PaidBillsBeforeTransaction, includeTax, taxValue } = applicationSettings;
        return { PaidBillsBeforeTransaction, includeTax, taxValue };
    }
    return null;
}


export const LoadOrganizationalTest = async function (organizationid: string | number) {
    try {
        if (organizationid) {
            const settings = await customFetch(`organization/billing/test?organizationid=${organizationid}`);
            if (settings && settings.testList) {
                return settings;
            }
            return [];
        }
    } catch (err) {
        alert("something wrong")
    }
}


export const fetchServices = async (setHolder: (services: import("./Multi/MultiTypes").ServicesListItem[]) => void) => {
    try {
        const { result } = await customFetch("billing/services");
        return setHolder ? setHolder(result) : result
    } catch (err) {
        return setHolder ? setHolder([]) : []
    }
}


export const Billingdefaultdata: BillingData = {
    test: "",
    organizationId: "",
    lockSource: false,
    clinicianId: "",
    paymentmode: 0,
    paid: 0,
    refundList: [],
    outstandingDebt:0,
    includeServices: false,
    nightAdjustmentValue: 10,
    nightStart: 18,
    nightEnd: 6,
    nightAdjustmentMode: "absolute",
    hasNightAdjustment: false,
    includeTest: true,
    discount: 0,
    hourMode: 24,
    cost: 0,
    isPackageUsed: false,
    totalServiceDiscount: 0,
    totalTestDiscount: 0,
    status: "normal",
    payable: 0,
    testcost: 0,
    type: "",
    previousRecords: [],
    servicesProvided: [],
    totalCostOfServices: 0,
    taxAppliedRecords: [],
    previewPrevious: false,
    taxIncluded: true,
    taxValue: 0,
    patientid: null,
    outstanding: 0,
    samplingCenter:null,
    testpanels: [],
    employeeid: "",
    billingSource: 0,
    appsettings: { taxIncluded: false, taxValue: 0 },
    cart: [],
    isFree: false,
    cantIgnoreDebt: false,
    organizationData: [],
    clinicianData: [],
    amountIncurredDueTax: 0,
    hasOutstandingDebt: false,
    paymentmodeData: [],
};


const BillingFailures: BillingFailuresType = {
    notOrganizationSelected: `organization not selected`,
    notClinicianSelected: `clinician not selected`,
    cartEmpty: 'Test Cart empty for non service only billing',
    serviceAndCartEmpty: 'Test Cart and Services cannot be empty',
    fullPayment: `Full payment must be paid to continue`,
    requiredParametersMissed: `Required Parameters not completed`,
    wrongTaxCalculations: 'Tax inclusive but not considered in the calculation',
    invalidBillingData: 'Invalid billing data or missing billing source' // Added missing value
}


export const ValidateAndSubmitBillingInformation = async function (
    billingdata: BillingData,
    method: 'POST' | 'PUT',
    billingid?: number,
    isServiceOnly: boolean = false
) {
    try {
        if (typeof billingdata !== "object" || !billingdata.billingSource) {
            return { error: BillingFailures.invalidBillingData };
        }
        if (method === "PUT" && !billingid) {
            return { error: BillingFailures.requiredParametersMissed };
        }

        const {
            billingSource,
            patientid,
            previousRecords,
            servicesProvided,
            organizationId,
            taxValue,
            taxIncluded,
            payable,
            insuranceId,
            isConditionsUnderstood,
            testcost,
            outstanding,
            cart = [],
            cost,
            status,
            paid,
            paymentmode,
            hasNightAdjustment,
            discount,
            clinicianId,
            employeeid,
            branchid,
            type,
            amountIncurredDueTax,
            cantIgnoreDebt,
            isPackageUsed
        } = billingdata;


        if (cart.length === 0 && servicesProvided.length === 0) {
            return { error: BillingFailures.cartEmpty };
        }
        if (!employeeid || !patientid || !branchid) {
            return { error: BillingFailures.requiredParametersMissed };
        }
        if (type === "organization" && !organizationId) {
            return { error: BillingFailures.notOrganizationSelected };
        }
        if (type === "clinician" && !clinicianId) {
            return { error: BillingFailures.notClinicianSelected };
        }
        if (!cantIgnoreDebt && (paid === 0 || outstanding > 0)) {
            console.log(cantIgnoreDebt, paid, outstanding)
            return { error: BillingFailures.fullPayment };
        }
        if (taxIncluded && amountIncurredDueTax < 0) {
            return { error: BillingFailures.wrongTaxCalculations };
        }

        const isFinancialParamsAccurate =
            !isNaN(paid) &&
            !isNaN(cost) &&
            !isNaN(discount) &&
            !isNaN(paymentmode) &&
            !isNaN(payable) &&
            !isNaN(testcost);

        if (!isFinancialParamsAccurate) {
            return { error: BillingFailures.requiredParametersMissed };
        }

        const numericPaid = ensureNumericFields(paid);
        const numericOutstanding = ensureNumericFields(outstanding);
        const numericCost = ensureNumericFields(cost);
        const numericDiscount = ensureNumericFields(discount);
        const numericPayable = ensureNumericFields(payable);
        const numericTotalCost = ensureNumericFields(testcost);


        if (typeof numericPaid !== "number" || typeof numericOutstanding !== "number" ||
            typeof numericCost !== "number" || typeof numericDiscount !== "number" ||
            typeof numericPayable !== "number" || typeof numericTotalCost !== "number") {
            throw new Error("One or more fields are not numeric as expected");
        }


        if (type == "phis" && !insuranceId) {
            throw new Error("Insurance Id not provided for insurance  billing");
        }


        if (type == "clinicians" && !clinicianId) {
            throw new Error("Clinician Id not provided for special clinician  billing");
        }


        const backendData = {
            cost: numericCost,
            payable: numericPayable,
            testcost: numericTotalCost,
            discount: numericDiscount,
            cart,
            servicesProvided,
            amountIncurredDueTax,
            billingSource,
            outstanding: numericOutstanding,
            status,
            isConditionsUnderstood,
            patientid: parseInt(patientid.toString(), 10),
            billingid: billingid ? parseInt(billingid.toString()) : billingid,
            taxValue,
            previousRecords,
            employeeid,
            clinicianId,
            organizationId,
        
            isPackageUsed,
            insuranceId,
            taxIncluded,
            hasNightAdjustment,
            paid: numericPaid,
            type,
            samplingCenter: branchid,
            paymentmode,
        };

        const url = method === "POST" ? "billing" : `billing?billingid=${billingid}`;
        const response = await customPost(url, method, backendData);
        if (response.status && response.status === 'pending verification'){
            return response;
        }

        return response;
    } catch (err) {
        return { status: "error", message: "Error occurred during transit", details: errorMessage(err) };
    }
};





export const fetchPreviousBilledRecords = async function (billingid: number) {
    try {
        if (!billingid) return;
        const { result } = await customFetch(`billing/information/single?billingid=${billingid}`);
        return result;
    } catch (err) {
        return []
    }
}

export  const getTransactionPreviousBillingRecords = async (billingid: number) => {
            try {
                const response = await customFetch(`billing/previous/transaction/data?billingid=${billingid}`);
                return response.result;
            } catch (err) {
                return [];
            }
        };



export const hasPreviousRecords = function (billingdata: Pick<import("./Multi/MultiTypes").MultiBillingData, "previousRecords">, selected: {id: string | number}) {
    const previousRecords = billingdata.previousRecords || [];
    if (previousRecords.length > 0) {
        const hasMatch = previousRecords.filter((prev, index) => prev.trackId == selected.id);
        if (hasMatch.length > 0) return true
    }
    return false;
}

function ensureNumericFields(value: string | number): number {
    const parsedValue = parseFloat(typeof value === "string" ? value : value.toString());
    if (!isNaN(parsedValue)) {
        return parsedValue;
    }
    throw new Error("Value must be numeric");
}