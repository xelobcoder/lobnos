
export interface TableColumn {
     field: string;
     value: string;
}
export type PlaceholderColumnSelectionType = TableColumn & { category: string }


export interface SmsTemplateFormState {
     templateName: string;
     smscontent: string;
     placeholders: PlaceholderColumnSelectionType[] | []
     selectedCategory: Omit<SmsCategoryType, 'isBulk'> | null;
     createdby: number
}

export interface RefundAdminViewType {
    serviceName?: string;
     refundid: number;
     serviceid: number;
     refundedBy: number;
     firstWitness: number;
     secondWitness: number;
     thirdWitness: number;
     firstWitnessPurpose: string;
     firstWitnessDate: string | null;
     secondWitnessDate: string | null;
     thirdWitnessDate: string | null;
     isRefundCompleted: number;
     isRefundInitiated: number;
     initiatedBy: number;
     secondWitnessPurpose: string | null;
     thirdWitnessPurpose: string | null;
     isRefundApproved: number;
     billingid: number;
     trackId: number;
     cost: number;
     employeeid: number;
     serviceCategory: string;
     categoryTrackId: number;
     clinicianId: number;
     organizationId: number | null;
     registrationType: string;
     branchid: number;
     isoutsourced: number;
     outsourceid: number | null;
     serviceAddedOn: string;
     taxList: string;
     taxValue: number;
     amountIncurredDueTax: number;
     taxIncluded: number;
     discount: number;
     fullname: string;
     billedby: string;
     witnesses: Witness[];
}
