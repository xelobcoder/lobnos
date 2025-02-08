import { customFetch, customPost } from "../components/Auth/customFetch";

export const billingSource = [
    { label: "General Billing", value: 1 },
    { label: " Organizational Billing", value: 2 },
    { label: " Private Health Insurance Scheme(P.H.I.S) ", value: 3 },
    { label: "National Health Insurance Scheme(N.H.I.S)", value: 4 },
    { label: "Special Health Care Provider Billing", value: 6 }
]



export const urgencyOptions =
    [
        { value: "urgent", label: "Urgent/Critical" },
        { value: "routine", label: "Routine" },
        { value: "normal", label: "Normal" },
        { value: "moderate", label: "Moderate" }
    ]



export const organizationOptions = [
    { value: "self", label: "Self" },
    { value: "organization", label: "Organization" },
    { value: "clinician", label: "Clinician" },
]



export const getAllNecessaryData = async function () {
    try {
        const panels = await customFetch("testpanel/list/bulk/billing");
        const organization = await customFetch("organization");
        const clinician = await customFetch("clinicians");
        const myprops = await Promise.all([panels, organization, clinician]);
        return {
            organizationData: myprops[1]?.organizations,
            clinicianData: myprops[2]?.result,
            testpanels: myprops[0]?.data,
        }
    } catch (err) {
        return 'something wrong occured';
    }
};


export const fetchOurSourcingOrganization = async function (setOrganization) {
    const response = await customFetch(`outsourcing/organization/all`);
    if (Array.isArray(response) && setOrganization) {
        setOrganization(response);
    }
    return response;
}

export const getOustandingBill = async function (patientid) {
    try {
        if (!patientid || isNaN(patientid)) return;
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
        const { PaidBillsBeforeTransaction, includeTax, taxValue } = applicationSettings;;
        return { PaidBillsBeforeTransaction, includeTax, taxValue };
    }
}


export const LoadOrganizationalTest = async function (organizationid) {
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


export const fetchServices = async (setHolder) => {
    try {
        const { result } = await customFetch("billing/services");
        return setHolder ? setHolder(result) : result
    } catch (err) {
        return setHolder ? setHolder([]) : []
    }
}


export const Billingdefaultdata = {
    test: "",
    organizationId: "",
    clinicianId: "",
    paymentmode: "",
    paid: 0,
    refundList: [],
    includeServices: false,
    nightAdjustmentValue: 10,
    nightStart:18,
    nightEnd:6,
    nightAdjustmentMode: "absolute",
    hasNightAdjustment: true,
    includeTest: true,
    discount: 0,
    hourMode: 12,
    cost: "",
    isPackageUsed: false,
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
    patientid: "",
    outstanding: 0,
    samplingCenter: "",
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


const BillingFailures = {
    notOrganizationSelected: `organization not selected`,
    notClinicianSelected: `clinician not selected`,
    cartEmpty: 'Test Cart empty for non service only billing',
    serviceAndCartEmpty: 'Test Cart and Services cannot be  empty ',
    fullPayment: `Full payment must be paid to continue`,
    requiredParametersMissed: `Required Parameters not completed`, wrongTaxCalculations: 'Tax inclusive but not considered in the calculation'
}


export const ValidateAndSubmitBillingInformation = async function (
    billingdata,
    method,
    billingid,
    isServiceOnly = false
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
            testcost,
            outstanding,
            cart = [],
            cost,
            status,
            paid,
            paymentmode,
            discount,
            clinicianId,
            employeeid,
            branchid,
            type,
            amountIncurredDueTax,
            cantIgnoreDebt,
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
            console.log(cantIgnoreDebt,paid,outstanding)
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


        function ensureNumericFields(value) {
            const parsedValue = parseFloat(typeof value == "string" ? value.toString() : value);
            if (!isNaN(parsedValue)) {
                return parsedValue
            }
            throw new Error("Value must be numeric");
        }

        const numericPaid = ensureNumericFields(paid)
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
            patientid: parseInt(patientid, 10),
            billingid: billingid ? parseInt(billingid) : billingid,
            taxValue,
            previousRecords,
            employeeid,
            clinicianId,
            organizationId,
            insuranceId,
            taxIncluded,
            paid: numericPaid,
            type,
            samplingCenter: branchid,
            paymentmode,
        };

        const url = method === "POST" ? "billing" : `billing?billingid=${billingid}`;
        const response = await customPost(url, method, backendData);

        return response;
    } catch (err) {
        return { status: "error", message: "Error occurred during transit", details: err.message };
    }
};




export const fetchPreviousBilledRecords = async function (billingid) {
    try {
        if (!billingid) return;
        const { result } = await customFetch(`billing/information/single?billingid=${billingid}`);
        return result;
    } catch (err) {
        return []
    }
}



export const hasPreviousRecords = function (billingdata, selected) {
    const previousRecords = billingdata.previousRecords;
    if (previousRecords.length > 0) {
        const hasMatch = previousRecords.filter((prev, index) => prev.trackId == selected.id);
        if (hasMatch.length > 0) return true
    }
    return false;
}