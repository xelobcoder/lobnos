import { customFetch, customPost } from "../components/Auth/customFetch";

export const billingSource = [
    { label: "General Billing", value: 1 },
    { label: " Organizational Billing", value: 2 },
    { label: " Private Health Insurance Scheme(P.H.I.S) ", value: 3 },
    { label: "National Health Insurance Scheme(N.H.I.S)", value: 4 },
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
        const paymentModes = await customFetch("paymentmodes");
        const myprops = await Promise.all([panels, organization, clinician, paymentModes]);
        return {
            organizationData: myprops[1]?.organizations,
            clinicianData: myprops[2]?.result,
            paymentmodeData: myprops[3]?.data,
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
    includeTest: true,
    discount: 0,
    cost: "",
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
    fullPayment: `Full payment must be paid to continue`,
    requiredParametersMissed: `Required Parameters not completed`, wrongTaxCalculations: 'Tax inclusive but not considered in the calculation'
}


export const ValidateAndSubmitBillingInformation = async function (billingdata, method, billingid) {
    try {
        if (typeof billingdata !== "object" || !billingdata.billingSource) return false;
        if (method === "PUT" && !billingid) return BillingFailures.requiredParametersMissed;

        const { billingSource, patientid, previousRecords, servicesProvided, organizationId, taxValue, taxIncluded, payable, testcost, outstanding, cart, cost, status, paid, paymentmode, discount, clinicianId, employeeid, branchid, type, amountIncurredDueTax, cantIgnoreDebt } = billingdata;

        if (cart.length == 0 || !employeeid || !patientid || !branchid) return BillingFailures.requiredParametersMissed;
        if (type == "organization" && !organizationId) return BillingFailures.notOrganizationSelected;
        if (type === "clinician" && !clinicianId) return BillingFailures.notClinicianSelected;
        if (cantIgnoreDebt === false && (paid == 0 || outstanding > 0)) return BillingFailures.fullPayment;
        if (taxIncluded === true && amountIncurredDueTax < 0) return BillingFailures.wrongTaxCalculations;
        let isFinancialParamsAccurate = !isNaN(paid) && !isNaN(cost) && !isNaN(discount) && !isNaN(paymentmode) && !isNaN(payable) && !isNaN(testcost);

        if (isFinancialParamsAccurate) {
            const backendData = {
                cost,
                payable,
                testcost,
                discount,
                cart,
                servicesProvided,
                amountIncurredDueTax,
                billingSource,
                outstanding,
                status,
                patientid: parseInt(patientid),
                billingid,
                taxValue,
                previousRecords,
                employeeid,
                clinicianId,
                organizationId,
                taxIncluded,
                paid,
                type,
                samplingCenter: branchid,
                paymentmode
            }
            const url = method === "POST" ? "billing" : `billing?billingid=${billingid}`;
            const response = await customPost(url, method, backendData);

            return response;
        }
        return BillingFailures.requiredParametersMissed;
    } catch (err) {
        console.log(err)
        return { status: 'error', message: 'error ocuured during transit' }
    }

}



export const fetchPreviousBilledRecords = async function (billingid) {
    try {
        if (!billingid) return;
        const { result } = await customFetch(`billing/information/single?billingid=${billingid}`);
        return result;
    } catch (err) {
        return []
    }
}
