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
  paymentstatus: "pending" |"partial" | "paid"
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

export interface AccessWindow {
  id?: number;
  employeeid: number;
  role: 'admin' | 'manager';
  edit_window: '1h' | '4h' | '8h' | '12h' | '24h' | '1d' | '1w' | '2w' | '1m';
  access_window: '1h' | '4h' | '8h' | '12h' | '24h' | '1d' | '1w' | '2w' | '1m';
  require_approval: boolean;
}
