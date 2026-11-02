import { record, type Accounts, type Settings } from './pharmacyAccounting';

type Identifier = string | number;
type Amount = string | number;
export interface TaxRule {
  id: Identifier; item_id: Identifier; rate: Amount; local_account: string;
  effective_date: string; reason: string; is_active: boolean;
}
export interface TaxTransaction {
  id: Identifier; sale_id: Identifier; sale_line_id: Identifier;
  gross_amount: Amount; net_amount: Amount; tax_amount: Amount; rate: Amount;
  local_account: string; event_type: string; financial_date: string;
}
export interface TaxData { rules: TaxRule[]; transactions: TaxTransaction[]; total: number; policy: string }
function identifier(value: unknown): Identifier {
  if ((typeof value !== 'string' && typeof value !== 'number') || String(value).trim() === '') throw Error('A tax record is missing its source identifier.');
  return value;
}
function amount(value: unknown): Amount {
  if ((typeof value !== 'string' && typeof value !== 'number') || String(value).trim() === '' || !Number.isFinite(Number(value))) throw Error('A tax record contains an invalid financial value.');
  return value;
}
function requiredText(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) throw Error('A tax record is missing required policy or evidence fields.');
  return value;
}
export function decodeTax(value: unknown): TaxData {
  const data = record(value);
  if (!Array.isArray(data.rules) || !Array.isArray(data.transactions)) throw Error('The tax response must include rules and transaction records.');
  if (!Number.isSafeInteger(data.total) || Number(data.total) !== data.transactions.length) throw Error('The tax response is incomplete. Narrow the date range or retry; no partial history will be exported.');
  return {
    policy: requiredText(data.policy),
    total: Number(data.total),
    rules: data.rules.map(value => {
      const rule = record(value);
      return { id: identifier(rule.id), item_id: identifier(rule.item_id), rate: amount(rule.rate),
        local_account: requiredText(rule.local_account), effective_date: requiredText(rule.effective_date),
        reason: requiredText(rule.reason), is_active: rule.is_active === true || rule.is_active === 1 };
    }),
    transactions: data.transactions.map(value => {
      const row = record(value);
      return { id: identifier(row.id), sale_id: identifier(row.sale_id), sale_line_id: identifier(row.sale_line_id),
        gross_amount: amount(row.gross_amount), net_amount: amount(row.net_amount), tax_amount: amount(row.tax_amount), rate: amount(row.rate),
        local_account: requiredText(row.local_account), event_type: requiredText(row.event_type), financial_date: requiredText(row.financial_date) };
    }),
  };
}
/** Only explicitly mapped, active shared liabilities are eligible; never infer a destination. */
export function taxLiabilityOptions(accounts: Accounts, settings: Settings) {
  return Object.entries(settings.mappings).filter(([local]) => /^liability:[A-Za-z0-9][A-Za-z0-9:_-]*$/.test(local)).flatMap(([localAccount, code]) => {
    const account = accounts.sharedAccounts.find(a => a.account_code === code && a.type === 'liability' && a.is_active !== false);
    return account ? [{ localAccount, code, name: account.name }] : [];
  });
}
export function taxRulePayload(fields: { itemId: Identifier | ''; rate: string; localAccount: string; effectiveDate: string; reason: string }, allowedAccounts: string[]) {
  if (fields.itemId === '' || !String(fields.itemId).trim()) throw Error('Select the medicine this rule explicitly applies to.');
  if (!fields.rate.trim() || !/^\d+(\.\d{1,4})?$/.test(fields.rate) || !Number.isFinite(Number(fields.rate)) || Number(fields.rate) > 100) throw Error('Enter an explicit percentage rate from 0 to 100, with up to four decimal places.');
  if (!allowedAccounts.includes(fields.localAccount)) throw Error('Choose an active, explicitly mapped liability account.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.effectiveDate)) throw Error('Enter the rule effective date.');
  if (!fields.reason.trim()) throw Error('Record the evidence and reason for this tax rule.');
  return { itemId: String(fields.itemId), rate: Number(fields.rate), localAccount: fields.localAccount, effectiveDate: fields.effectiveDate, reason: fields.reason.trim() };
}
export interface TaxFilters { from: string; to: string; search: string; eventType: string }
/** Filters apply to supplied snapshots only, without recalculating historical tax. */
export function filterTaxTransactions(rows: TaxTransaction[], filters: TaxFilters): TaxTransaction[] {
  const query = filters.search.trim().toLowerCase();
  return rows.filter(row => {
    const date = row.financial_date.slice(0, 10);
    return (!filters.from || date >= filters.from) && (!filters.to || date <= filters.to)
      && (!filters.eventType || row.event_type === filters.eventType)
      && (!query || [row.id, row.sale_id, row.sale_line_id, row.local_account, row.event_type].some(value => String(value).toLowerCase().includes(query)));
  });
}
