export interface Service {
    serviceid: number;
    billingid: number;
    trackid: number;
    cost: string;
    employeeid: number;
    servicecategory: string;
    categorytrackid: number;
    clinicianid: number;
    organizationid: number;
    registrationtype: string;
    branchid: number;
    isoutsourced: number;
    outsourceid?: number | null;
    serviceaddedon: string;
    taxlist: string;
    taxvalue: string;
    amountincurredduetax: string;
    taxincluded: number;
    discount: string;
    totalcost: string;
    totalpayable: string;
    isnhis: number;
    isphis: number;
    insuranceid?: any;
    claimcode?: any;
    hasnightadjustment: number;
    nightadjustmentvalue: string;
    nightadjustmentmode: string;
    ispackageused: number;
    packageid?: any;
    isrefundcompleted: number;
    isrefundapproved: number;
    isrefundinitiated: number;
    amountrefunded: string;
}


export interface InvoiceData {
    clientInformation: ClientInformation;
    testInformation: Service[];
}

export interface ClientInformation {
    patientid: number;
    fullpatientid: string;
    designation: string;
    firstname: string;
    email: string;
    dob: string;
    age: number;
    gender: string;
    marital_status: string;
    mobile_number: string;
    agetype: string;
    occupation: string;
    date: string;
    activation_status: string;
    lastname: string;
    middlename?: string;
    organization: string;
    contactpointer?: string;
    whatappcontact?: string;
    billingid: number;
    totaltransactioncost: string;
    totalcost: string;
    paid: string;
    payable: string;
    totalrefunded?: number;
    discount?: string;
    outstanding?: string;
    balance?: string;
    billedon?: string;
    clientstatus?: string;
}