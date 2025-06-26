export type SmsCategoryType = {
     isBulk: boolean;
     value: string;
     label: string;
     categorization: "staffs" | "clients" | "organization" | "outsourcing" | "clinicians"

};

export const SmsSmsCategoryData: SmsCategoryType[] = [
     {
          isBulk: true,
          value: 'organization',
          label: 'Organizations',
          categorization: "organization"
     },

     {
          isBulk: false,
          value: 'outsourcing',
          label: 'Outsourcing organization',
          categorization: "outsourcing"
     },

     {
          isBulk: false,
          value: 'clinicians',
          label: 'Clinicians or Health Practitioners',
          categorization: "clinicians"
     },

     {
          isBulk: false,
          value: 'clients',
          label: 'Clients',
          categorization: 'clients'
     },

     {
          isBulk: false,
          value: 'staffs',
          label: 'Staffs',
          categorization: "staffs"
     },

     {
          isBulk: true,
          value: 'organization',
          label: 'Bulk Organizations',
          categorization: "organization"
     },

     {
          isBulk: true,
          value: 'outsourcing',
          label: 'Bulk Outsourcing organizations',
          categorization: 'outsourcing'
     },

     {
          isBulk: true,
          value: 'clinicians',
          label: 'Bulk Clinicians or Health Practitioners',
          categorization: "clinicians"
     },

     {
          isBulk: true,
          value: 'clients',
          label: 'Bulk Clients',
          categorization: 'clients'
     },

     {
          isBulk: true,
          value: 'staffs',
          label: 'Bulk Staffs',
          categorization: "staffs"
     },
];

export const SmsPlaceHolderCategory: Omit<SmsCategoryType, 'isBulk' | "categorization">[] = [
     { value: 'organization', label: 'Organizations' },
     { value: 'clinicians', label: 'Clinicians or Health Practitioners' },
     { value: 'staffs', label: 'Staffs' },
     { value: 'Outsourcing', label: 'Outsourcing organizations' },
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