export interface CounterInvoiceLine {
    inventoryItemId: string;
    name: string;
    quantity: number;
    priceType: string;
    unitPrice: number;
    lineTotal: number;
}

export interface CounterInvoice {
    id: string;
    code: string;
    invoice_number: string;
    status: 'unpaid' | 'paid' | 'collected' | 'cancelled';
    total: number;
    details: {customerName: string; lines: CounterInvoiceLine[]};
    attendant_name: string;
    created_at: string;
    paid_at?: string;
    collected_at?: string;
    sale_id?: string;
    saleStatus: string | null;
    outstandingAmount: number | null;
}

export interface CounterInvoiceQueueRow extends Omit<CounterInvoice, 'details'> {
    customerName: string;
    itemCount: number;
}

export function counterInvoiceReference(value: string): string {
    const reference = value.trim().toUpperCase();
    if (/^[A-Z0-9]{4}$/.test(reference) || (/^INV-[A-Z0-9]{4}-\d+$/.test(reference) && reference.length <= 80)) return reference;
    throw new Error('Enter the four-character code or full invoice number, e.g. INV-DC20-00001.');
}

export function canCollectCounterInvoice(invoice: Pick<CounterInvoice, 'status' | 'saleStatus' | 'outstandingAmount'>): boolean {
    return invoice.status === 'paid' && invoice.saleStatus === 'completed' && invoice.outstandingAmount === 0;
}
