export type SupplierOrderDocument = {
  reference: string; supplierName: string; status: string; notes: string;
  createdAt?: string; supplierEmail?: string; supplierPhone?: string;
  lines: { name: string; quantity: number; unit?: string }[];
};
export type PurchaseRequestDocument = {
  reference: string; status: string; createdAt?: string; reason: string; decisionReason?: string; supplierName?: string;
  lines: { name: string; unit?: string; quantity: number; requestedQuantity?: number; approvedQuantity?: number; amendmentReason?: string }[];
};
export type PurchaseDocumentLine = { name: string; unit?: string; quantity: number; approved?: number | null; note?: string };
export type PurchaseDocumentSpec = {
  kind: 'order' | 'request'; reference: string; date?: string; statusLabel: string;
  supplier?: { name: string; phone?: string; email?: string }; purpose?: string; notes?: string; decisionReason?: string; requestedBy?: string;
  /** Red line under the letterhead and in the footer, e.g. NOT AUTHORIZED FOR PURCHASE. */
  banner?: string;
  /** Faint diagonal stamp on every page, as the invoice does for PAID / VOID. */
  stamp?: string;
  lines: PurchaseDocumentLine[];
};

const UNAUTHORIZED = ['draft', 'submitted', 'rejected', 'cancelled'];
const ORDER_STAMPS: Record<string, string> = { draft: 'DRAFT', submitted: 'NOT APPROVED', rejected: 'REJECTED', cancelled: 'CANCELLED' };
const REQUEST_STAMPS: Record<string, string> = { requested: 'AWAITING APPROVAL', rejected: 'REJECTED' };
const REQUEST_LABELS: Record<string, string> = { requested: 'Awaiting review', approved: 'Approved', rejected: 'Rejected' };
const label = (status: string) => status.replaceAll('_', ' ').replace(/^\w/, letter => letter.toUpperCase());

export function purchaseOrderText(order: SupplierOrderDocument): string {
  return [
    'Prime Laboratory Software - Pharmacy purchase order',
    order.reference, `Supplier: ${order.supplierName}`, `Status: ${order.status}`,
    ...(UNAUTHORIZED.includes(order.status) ? ['NOT AUTHORIZED FOR PURCHASE'] : []),
    '', ...order.lines.map((line, index) => `${index + 1}. ${line.name}: ${line.quantity} ${line.unit || 'units'}`),
    ...(order.notes ? ['', `Notes: ${order.notes}`] : []),
  ].join('\n');
}
export function purchaseOrderSpec(order: SupplierOrderDocument): PurchaseDocumentSpec {
  return {
    kind: 'order', reference: order.reference, date: order.createdAt, statusLabel: label(order.status), notes: order.notes || undefined,
    supplier: { name: order.supplierName, phone: order.supplierPhone, email: order.supplierEmail },
    banner: UNAUTHORIZED.includes(order.status) ? 'NOT AUTHORIZED FOR PURCHASE' : undefined, stamp: ORDER_STAMPS[order.status],
    lines: order.lines.map(line => ({ name: line.name, unit: line.unit, quantity: line.quantity })),
  };
}
export function purchaseRequestSpec(request: PurchaseRequestDocument): PurchaseDocumentSpec {
  return {
    kind: 'request', reference: request.reference, date: request.createdAt, statusLabel: REQUEST_LABELS[request.status] || label(request.status),
    purpose: request.reason, decisionReason: request.decisionReason, supplier: request.supplierName ? { name: request.supplierName } : undefined,
    banner: 'INTERNAL REQUISITION - NOT A SUPPLIER ORDER', stamp: REQUEST_STAMPS[request.status],
    lines: request.lines.map(line => ({ name: line.name, unit: line.unit, quantity: line.requestedQuantity ?? line.quantity, approved: line.approvedQuantity ?? null, note: line.amendmentReason })),
  };
}
export async function downloadPurchaseDocument(spec: PurchaseDocumentSpec): Promise<void> {
  const [{ buildPurchaseDocumentPdf }, { loadCompanyBranding }] = await Promise.all([import('./pharmacyPurchaseDocumentPdf'), import('../components/reports/reportPdf')]);
  const branding = await loadCompanyBranding().catch(() => ({ company: {}, logo: null }));
  buildPurchaseDocumentPdf(spec, branding).save(`${spec.reference.replace(/[^A-Za-z0-9_-]/g, '_')}.pdf`);
}
export const downloadPurchaseOrder = (order: SupplierOrderDocument) => downloadPurchaseDocument(purchaseOrderSpec(order));
export const downloadPurchaseRequest = (request: PurchaseRequestDocument) => downloadPurchaseDocument(purchaseRequestSpec(request));
