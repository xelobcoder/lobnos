// types/serviceTypes.ts

export interface Witness {
  employeeid: number;
  [key: string]: any;
}

export interface Service {
  serviceid: number;
  billingid: number;
  trackId: number;
  cost: string;
  employeeid: number;
  serviceCategory: string;
  categoryTrackId: number;
  clinicianId: number;
  organizationId: number;
  registrationType: string;
  branchid: number;
  isoutsourced: number;
  outsourceid: number | null;
  serviceAddedOn: string;
  taxList: string;
  taxValue: string;
  amountIncurredDueTax: string;
  taxIncluded: number;
  discount: string;
  totalcost: string;
  totalpayable: string;
  isNHIS: number;
  isPHIS: number;
  insuranceid: number | null;
  claimCode: string | null;
  hasNightAdjustment: number;
  nightAdjustmentValue: string;
  nightAdjustmentMode: string;
  isPackageUsed: number;
  packageid: number | null;
  status: string;
  isRefunded: number;
  isRefundCompleted: number;
  isRefundApproved: number;
  isRefundInitiated: number;
  amountRefunded: string;
  outsourcingOrganization: string | null;
  name: string | boolean;
  witnesses: Witness[];
}
