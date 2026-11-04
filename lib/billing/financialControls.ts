import { customFetch } from "../../components/Auth/customFetch";

export interface SaleClosure {
     billingid: number;
     closed_status: "OPEN" | "CLOSED";
     closure_evidence: {
          closure_id: number | null;
          closed_at: string | null;
          closed_by: number | null;
          signed_off: boolean;
     } | null;
}
export interface RefundQuote extends SaleClosure {
     remaining_refundable_amount: number;
     remaining_voidable_amount: number;
     remaining_tax_amount: number;
     total_refunded_amount: number;
     refund_state: "NOT_REFUNDED" | "PARTIALLY_REFUNDED" | "FULLY_REFUNDED";
     can_refund_all: boolean;
     services: { serviceid: number; remaining_refundable_amount: number; remaining_voidable_amount: number }[];
}
function validClosure(row: SaleClosure): boolean {
     return !!row && Number.isSafeInteger(row.billingid) && row.billingid > 0 &&
          ["OPEN", "CLOSED"].includes(row.closed_status) &&
          (row.closure_evidence === null || !!row.closure_evidence && typeof row.closure_evidence.signed_off === "boolean");
}
export async function fetchSaleClosures(ids: number[]): Promise<Map<number, SaleClosure>> {
     const unique = [...new Set(ids)];
     if (unique.some(id => !Number.isSafeInteger(id) || id <= 0)) throw new Error("Invalid sale ID for closure verification.");
     const groups: number[][] = [];
     for (let offset = 0; offset < unique.length; offset += 200) groups.push(unique.slice(offset, offset + 200));
     const results = await Promise.all(groups.map(async group => {
          const response = await customFetch(`billing/closure/status?billingids=${group.join(",")}`);
          if (!Array.isArray(response?.data) || response.status === false) throw new Error(response?.message || "Sale closure status could not be verified.");
          const rows: SaleClosure[] = response.data;
          if (rows.length !== group.length || rows.some(row => !validClosure(row) || !group.includes(row.billingid)) ||
               new Set(rows.map(row => row.billingid)).size !== group.length)
               throw new Error("Sale closure status is incomplete. Financial changes are unavailable.");
          return rows;
     }));
     return new Map(results.flat().map(row => [row.billingid, row]));
}
export async function fetchRefundQuote(billingid: number): Promise<RefundQuote> {
     const response = await customFetch(`billing/refund-quote?billingid=${billingid}`);
     const quote: RefundQuote = response?.data;
     if (response?.status === false || !validClosure(quote) || quote.billingid !== billingid ||
          !["remaining_refundable_amount", "remaining_voidable_amount", "remaining_tax_amount", "total_refunded_amount"].every(key => {
               const amount = quote[key as "remaining_refundable_amount"];
               return typeof amount === "number" && Number.isFinite(amount) && amount >= 0;
          }) || !["NOT_REFUNDED", "PARTIALLY_REFUNDED", "FULLY_REFUNDED"].includes(quote.refund_state) ||
          typeof quote.can_refund_all !== "boolean" || !Array.isArray(quote.services) ||
          quote.services.some(row => !Number.isSafeInteger(row.serviceid) || !Number.isFinite(row.remaining_refundable_amount) || row.remaining_refundable_amount < 0 ||
               !Number.isFinite(row.remaining_voidable_amount) || row.remaining_voidable_amount < 0))
          throw new Error(response?.message || "Remaining refundable amounts and closure status could not be verified.");
     return quote;
}
