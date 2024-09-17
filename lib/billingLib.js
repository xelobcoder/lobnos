import { customFetch } from "../components/Auth/customFetch";

export const billingSource = [
    { label: "General Billing", value: 1 },
    { label: " Organizational Billing", value: 2 },
    // { label: " Private Health Insurance Scheme(P.H.I.S) ", value: 3 },
    // { label: "National Health Insurance Scheme(N.H.I.S)", value: 4 },
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