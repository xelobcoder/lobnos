export type ReceivingLine = {
  id: string; itemId: string; name: string; sku?: string; quantityDelivered: number;
  acceptedQuantity: number; returnedQuantity: number; acceptedValue: number;
  unitCost: number | null; batchNumber?: string; expiryDate?: string; condition: string;
  suggestedAcceptance?: number; invoiceQuantity?: number; invoicedQuantity?: number; invoiceAmount?: number;
};
export const heldQuantity = (line: ReceivingLine) => Math.max(0, Number((Number(line.quantityDelivered) - Number(line.acceptedQuantity) - Number(line.returnedQuantity)).toFixed(3)));
export const uninvoicedQuantity = (line: ReceivingLine) => Math.max(0, Number((Number(line.acceptedQuantity) - Number(line.invoiceQuantity ?? line.invoicedQuantity ?? 0)).toFixed(3)));
function scaled(value: unknown, places: number): bigint {
  const number = Number(value), integer = Math.round(number * 10 ** places);
  if (!Number.isFinite(number) || number < 0 || !Number.isSafeInteger(integer) || Number(number.toFixed(places)) !== number) throw new Error('Invalid accepted quantity or invoice value. Refresh the delivery before invoicing.');
  return BigInt(integer);
}
export function invoiceAllocation(line: ReceivingLine, quantity: number) {
  const remaining = uninvoicedQuantity(line);
  if (!Number.isFinite(quantity) || quantity <= 0 || Number(quantity.toFixed(3)) !== quantity || quantity > remaining || !Number.isFinite(Number(line.acceptedValue)) || Number(line.acceptedQuantity) <= 0) throw new Error('Choose an uninvoiced accepted quantity.');
  const totalCents = scaled(line.acceptedValue, 2), usedCents = scaled(line.invoiceAmount ?? 0, 2);
  const denominator = scaled(line.acceptedQuantity, 3), invoiced = scaled(line.invoiceQuantity ?? line.invoicedQuantity ?? 0, 3);
  if (usedCents > totalCents || invoiced > denominator) throw new Error('Invoice allocations exceed accepted goods. Refresh the delivery.');
  if (quantity === remaining) return Number(totalCents - usedCents) / 100;
  const cents = (totalCents * scaled(quantity, 3) + denominator / BigInt(2)) / denominator;
  if (cents > totalCents - usedCents) throw new Error('Choose the remaining quantity to allocate the final invoice balance.');
  return Number(cents) / 100;
}
export function receivingItem(row: any) {
  return { ...row, id: String(row.id ?? row.inventoryItemId), name: row.name, unit: row.consumption_unit || row.unit || 'unit',
    purchaseUnit: row.purchase_unit ?? row.purchaseUnit, factor: Number(row.units_per_purchase_unit ?? row.unitsPerPurchaseUnit ?? 1),
    retail: Number(row.sale_price ?? row.salePrice ?? 0), wholesale: Number(row.wholesale_price ?? row.wholesalePrice ?? 0),
    cost: Number(row.cost_price ?? row.costPrice ?? 0) || 0,
    batchTracking: row.pharmacy_batch_tracking ?? row.batch_tracking ?? row.batchTracking ?? true };
}
// Same three choices as main inventory receiving; applied to retail and wholesale together.
export const quickPriceModes = [
  ['increase_percentage', 'Increase by percentage'], ['increase_fixed', 'Increase by fixed amount'], ['manual', 'Enter new prices'],
] as const;
export type PriceDraft = { mode: string; value: string; retail: string; wholesale: string };
type PriceRule = { method: string; value: string };
const keep: PriceRule = { method: 'keep', value: '' };
export function priceDraftChoices(draft: PriceDraft, current: { retail: number; wholesale: number }): { retail: PriceRule; wholesale: PriceRule } {
  if (draft.mode === 'manual') {
    const pick = (value: string, existing: number) => value.trim() !== '' && Number(value) !== existing ? { method: 'manual', value: value.trim() } : keep;
    return { retail: pick(draft.retail, current.retail), wholesale: pick(draft.wholesale, current.wholesale) };
  }
  if (draft.value.trim() === '' || Number(draft.value) === 0) return { retail: keep, wholesale: keep };
  const rule = { method: draft.mode, value: draft.value.trim() };
  // A wholesale price that was never set cannot be increased; leave it unchanged.
  return { retail: current.retail > 0 ? rule : keep, wholesale: current.wholesale > 0 ? rule : keep };
}
export const lastCost = (item: { cost?: number } | undefined, factor = 1) => item?.cost && item.cost > 0 ? String(Math.round(item.cost * factor * 100) / 100) : '';
export const priceMethods = [
  ['keep', 'Keep current price'], ['manual', 'Manual price'], ['fixed', 'Cost + fixed amount'],
  ['percentage', 'Cost + markup %'], ['margin', 'Target gross margin %'],
  ['increase_fixed', 'Current selling price + fixed amount'], ['decrease_fixed', 'Current selling price - fixed amount'],
  ['increase_percentage', 'Increase current selling price by %'], ['decrease_percentage', 'Decrease current selling price by %'],
] as const;
