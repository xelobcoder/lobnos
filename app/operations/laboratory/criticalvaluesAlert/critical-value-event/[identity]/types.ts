interface Constraint {
    id: number;
    testid: number;
    fieldid: number;
    action: string;
    constraint_type: 'less' | 'greater' | string;
    replacement_text: string;
    value: string;
    prefix: string;
    isHit:boolean;
    statement: string;
    suffix: string;
  }
  
  interface RecordValue {
    id: number;
    testid: number;
    name: string;
    field: string;
    value: string;
    hasunits: number;
    originalvalue: string;
    units: string;
    plan: string;
    plain: string;
    ordering: number;
    isValueTracked: number;
    textReference: string;
    upperlimit: string;
    lowerlimit: string;
    category: string;
    options: string;
    undercategory: number;
    categoryid: number | null;
    valueAlert: string | null;
    alert: string | null;
    fieldid: number;
    constraints: Constraint[];
  }
  
  interface CriticalAlert {
    crkeyId: number;
    billingid: number;
    testid: number;
    constraint_type: 'less' | 'greater' | string;
    statement: string;
    createdOn: string; // ISO string
    createdBy: number;
    isSeen: boolean | null;
    isSeenBy: number | null;
    ascensionid: number;
    patientid: number;
    fullpatientid: string;
    designation: string;
    firstname: string;
    email: string;
    dob: string; // ISO string
    age: number;
    gender: string;
    marital_status: string;
    mobile_number: string;
    agetype: string;
    occupation: string;
    date: string; // ISO string
    activation_status: 'TRUE' | 'FALSE' | string;
    lastname: string;
    middlename: string;
    organization: string;
    contactpointer: string;
    whatAppcontact: string;
    testname: string;
    recordValues: RecordValue[];
  }
  