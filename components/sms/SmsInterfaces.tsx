export type SmsCategoryType = {
     isBulk: boolean;
     value: string;
     label: string;
};

export const SmsSmsCategoryData: SmsCategoryType[] = [
     { isBulk: true, value: 'organizations', label: 'Organizations' },
     { isBulk: false, value: 'outsourcing', label: 'Outsourcing organization' },
     { isBulk: true, value: 'clinicians', label: 'Clinicians or Health Practitioners' },
     { isBulk: false, value: 'clients', label: 'Clients' },
     { isBulk: true, value: 'staffs', label: 'Staffs' },
     { isBulk: false, value: 'bulkOrganizations', label: 'Bulk Organizations' },
     { isBulk: true, value: 'bulkOutsourcing', label: 'Bulk Outsourcing organizations' },
     { isBulk: false, value: 'bulkClinicians', label: 'Bulk Clinicians or Health Practitioners' },
     { isBulk: true, value: 'bulkClients', label: 'Bulk Clients' },
     { isBulk: false, value: 'bulkStaffs', label: 'Bulk Staffs' },
];

export const SmsPlaceHolderCategory: Omit<SmsCategoryType, 'isBulk'>[] = [
     { value: 'organizations', label: 'Organizations' },
     { value: 'clinicians', label: 'Clinicians or Health Practitioners' },
     { value: 'staffs', label: 'Staffs' },
     { value: 'Outsourcing', label: 'Outsourcing organizations' },
     { value: 'Clients', label: 'Clients' },
];
