export type SmsCategoryType = {
     isBulk: boolean;
     value: string;
     label: string;
     categorization: "organization" | "staff" | "clinicians" | "clients" | "outsourcing"
};

export const SmsSmsCategoryData: SmsCategoryType[] = [
     { isBulk: true, value: 'organization', label: 'Organizations', categorization: "organization" },
     { isBulk: false, value: 'outsourcing', label: 'Outsourcing organization', categorization: "outsourcing" },
     { isBulk: true, value: 'clinicians', label: 'Clinicians or Health Practitioners', categorization: "clinicians" },
     { isBulk: false, value: 'clients', label: 'Clients', categorization: 'clients' },
     { isBulk: true, value: 'staffs', label: 'Staffs', categorization: "staff" },
     { isBulk: false, value: 'bulkOrganizations', label: 'Bulk Organizations', categorization: "organization" },
     { isBulk: true, value: 'bulkOutsourcing', label: 'Bulk Outsourcing organizations', categorization: 'outsourcing' },
     { isBulk: false, value: 'bulkClinicians', label: 'Bulk Clinicians or Health Practitioners', categorization: "clinicians" },
     { isBulk: true, value: 'bulkClients', label: 'Bulk Clients', categorization: 'clients' },
     { isBulk: false, value: 'bulkStaffs', label: 'Bulk Staffs', categorization: "staff" },
];

export const SmsPlaceHolderCategory: Omit<SmsCategoryType, 'isBulk' | "categorization">[] = [
     { value: 'organization', label: 'Organizations' },
     { value: 'clinicians', label: 'Clinicians or Health Practitioners' },
     { value: 'staffs', label: 'Staffs' },
     { value: 'Outsourcing', label: 'Outsourcing organizations'},
     { value: 'Clients', label: 'Clients' },
];


export const customReactSelectStyles = {
     menuPortal: (base: any) => ({
          ...base,
          zIndex: 9999,
     }),
     menu: (base: any) => ({
          ...base,
          maxHeight: "300px",
          overflowY: "auto",
     }),
};