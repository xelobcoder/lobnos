/** Pharmacy-local evidence and shared GL remain distinct; no synthetic financial values. */
export const accountingDestinations = [
	['', 'Overview'], ['chart-of-accounts', 'Chart of accounts'], ['general-ledger', 'General ledger'],
	['journals', 'Journals'], ['receivables', 'Accounts receivable'], ['payables', 'Accounts payable'],
	['expenses', 'Expenses'], ['revenue', 'Revenue'], ['cogs', 'Cost of goods sold'],
	['cash-bank', 'Cash & bank'], ['reconciliation', 'Reconciliation'], ['suppliers', 'Supplier statements'],
	['inventory', 'Inventory valuation'], ['statements', 'Financial statements'], ['trial-balance', 'Trial balance'],
	['tax', 'Tax configuration'], ['periods', 'Financial periods'], ['audit', 'Audit trail'], ['settings', 'Accounting settings'],
] as const;
export type Section = typeof accountingDestinations[number][0];
export const financialStatementLinks = [
	{ report: 'profit_loss', title: 'Profit & loss (Income statement)', detail: 'Income, costs and profit for a period' },
	{ report: 'cash_flow', title: 'Cash flow', detail: 'Cash received, paid and remaining' },
	{ report: 'balance_sheet', title: 'Balance sheet', detail: 'Assets, liabilities and equity at a date' },
] as const;
export function financialStatementReport(value: string | null): string {
	return value !== null && (financialStatementLinks.some(item => item.report === value) || value === 'transactions') ? value : 'profit_loss';
}
export function financialStatementHref(report: string): string {
	return `/pharmacy/accounting/statements?report=${encodeURIComponent(report)}`;
}
export const accountingFriendlyTitles: Partial<Record<Section, string>> = {
	receivables: 'Money customers owe us', payables: 'Money we owe suppliers',
	'general-ledger': 'All pharmacy accounting transactions', cogs: 'Cost of goods sold',
};
export type RecordData = Record<string, unknown>;
export function accountingRecovery(code: string): { message: string; href: string; label: string } | null {
	const actions: Record<string, { message: string; href: string; label: string }> = {
		PAYABLE_RECONCILIATION_REQUIRED: { message: 'Ask pharmacy finance to compare this supplier statement with recorded credits and advances. Apply existing money before recording another payment; do not pay twice.', href: '/pharmacy/accounting/payables?view=applications', label: 'Review supplier credits & advances' },
		UNPOSTED_RECEIPT: { message: 'Ask pharmacy finance to reconcile the original receipt. Do not register another receipt or invent a liability.', href: '/pharmacy/accounting/settings', label: 'Open accounting reconciliation setup' },
		SOURCE_MISMATCH: { message: 'Ask pharmacy finance to compare the original source with its posting before retrying. Do not change posted amounts to force a match.', href: '/pharmacy/accounting/general-ledger', label: 'Inspect accounting transactions' },
		CASH_SHIFT_REQUIRED: { message: 'Open your cash shift for the payment date. A request with an incorrect date must be cancelled and replaced, not backdated.', href: '/pharmacy/cashier', label: 'Open Cashier & shift' },
		POSTING_BLOCKED: { message: 'Review the financial day and payment setup with the pharmacy manager. Resolve the blocker before retrying the original operation.', href: '/pharmacy/finance', label: 'Review financial-day blockers' },
		TERMS_CONFLICT: { message: 'Refresh the bill or invoice. Cancel the outdated correction and prepare one against its current due date; another person must approve it.', href: '/pharmacy/accounting', label: 'Open pharmacy accounting tasks' },
		APPROVAL_SEPARATION: { message: 'Ask a different authorized finance user to approve this request. Switching your active role does not make you a different employee.', href: '/pharmacy/accounting', label: 'Open pharmacy accounting tasks' },
	};
	return actions[code] || null;
}
export interface Account {
	id: string | number; account_code: string; name: string; type: string;
	normal_balance: string; parent_account_id?: string | number | null; is_active?: boolean;
	local_codes?: string[]; origin?: string; account_number?: string;
}
export interface Accounts { items: Account[]; sharedAccounts: Account[]; facilityAvailable?: boolean }
export interface Settings {
	branchid?: number; tenant_id?: number; enabled: boolean; effective_date: string | null;
	mappings: Record<string, string>;
}
export interface JournalLine { account: string; debit: string; credit: string }
export function decodeAccounts(value: unknown): Accounts {
	const data = record(value);
	const decode = (rows: unknown): Account[] => {
		if (!Array.isArray(rows)) throw Error('The accounts response is missing its account list.');
		return rows.map(value => {
			const a = record(value);
			if (!['string', 'number'].includes(typeof a.id) || !['account_code', 'name', 'type', 'normal_balance'].every(key => typeof a[key] === 'string'))
				throw Error('An account response is missing required account fields.');
			return {
				id: a.id as string | number, account_code: a.account_code as string, name: a.name as string, type: a.type as string,
				normal_balance: a.normal_balance as string, parent_account_id: a.parent_account_id as string | number | null,
				is_active: a.is_active === undefined ? true : Boolean(a.is_active),
				local_codes: Array.isArray(a.local_codes) ? a.local_codes.filter((code): code is string => typeof code === 'string') : [],
				origin: typeof a.origin === 'string' ? a.origin : undefined,
				account_number: typeof a.account_number === 'string' ? a.account_number : undefined
			};
		});
	};
	return { items: decode(data.items), sharedAccounts: decode(data.sharedAccounts), facilityAvailable: data.facilityAvailable !== false };
}
export function decodeSettings(value: unknown): Settings {
	const data = record(value), mappings = record(data.mappings);
	if (typeof data.enabled !== 'boolean' || data.mappings === null || typeof data.mappings !== 'object' || Array.isArray(data.mappings) || Object.values(mappings).some(code => typeof code !== 'string'))
		throw Error('The accounting settings response has an invalid configuration shape.');
	return { ...data, enabled: data.enabled, effective_date: typeof data.effective_date === 'string' ? data.effective_date : null, mappings: mappings as Record<string, string> };
}
export function accountEditPayload(values: { name: string; parentAccountId: string; isActive: boolean }) {
	// Shared chart identity is immutable, including when an account belongs to pharmacy.
	return { name: values.name, parentAccountId: values.parentAccountId ? Number(values.parentAccountId) : null, isActive: values.isActive };
}
export function documentActions(kind: 'journals' | 'expenses', row: RecordData, actor: unknown, finance: boolean): string[] {
	if (!finance || !Number.isInteger(Number(row.version)) || Number(row.version) < 1) return [];
	const status = String(row.status || ''), actions: string[] = [];
	const own = actor !== undefined && [row.created_by, row.submitted_by].some(id => id != null && String(id) === String(actor));
	if (status === 'draft') actions.push('submit', 'void');
	if (status === 'submitted') {
		if (!own && actor !== undefined) actions.push('approve');
		actions.push('void');
	}
	if (status === 'approved') actions.push(kind === 'journals' ? 'post' : 'pay');
	if (kind === 'expenses' && status === 'partially_paid') actions.push('pay');
	if (kind === 'journals' ? status === 'posted' : status === 'approved' && Number(record(row.details).paidAmount || 0) === 0) actions.push('reverse');
	return actions;
}
export function reconciliationBlockers(data: RecordData, balances: RecordData, actor: unknown): string[] {
	const statement = record(data.statement), items = rowsOf(data.items), ledger = rowsOf(data.ledgerLines), blockers: string[] = [];
	if (actor == null) blockers.push('Authenticated finalizer identity could not be verified.');
	else if (String(statement.created_by) === String(actor)) blockers.push('The statement importer cannot finalize their own reconciliation.');
	const missing = items.filter(row => row.journal_line_id == null);
	if (missing.length) blockers.push(`${missing.length} statement transaction(s) are unmatched: ${missing.map(row => text(row.reference || row.id)).join(', ')}.`);
	const ids = new Set(items.filter(row => row.journal_line_id != null).map(row => String(row.journal_line_id)));
	const unmatched = ledger.filter(row => !ids.has(String(row.id)));
	if (unmatched.length) blockers.push(`${unmatched.length} bank ledger movement(s) are not allocated to this statement: ${unmatched.map(row => text(row.id)).join(', ')}.`);
	if (balances.openingBalance == null || balances.closingBalance == null) blockers.push('Server-computed opening and closing bank balances are not yet verified.');
	else {
		if (Number(balances.openingBalance) !== Number(statement.opening_balance)) blockers.push(`Opening balance mismatch: bank books ${text(balances.openingBalance)}, statement ${text(statement.opening_balance)}.`);
		if (Number(balances.closingBalance) !== Number(statement.closing_balance)) blockers.push(`Closing balance mismatch: bank books ${text(balances.closingBalance)}, statement ${text(statement.closing_balance)}.`);
	}
	if (Array.isArray(data.blockers)) blockers.push(...data.blockers.map(value => typeof value === 'string' ? value : text(record(value).message || value)));
	return blockers;
}
export interface InventoryControlSnapshot {
	asOf: string; branchid: number;
	rows: { itemId: string | number; name: string; sku: string | null; quantity: number | string; unitCost: number | string; value: number | string }[];
	stockValue: number | string; inventoryControl: number | string; difference: number | string; balanced: boolean;
	controls: { account: string; balance: number | string }[]; policy: string; correctionPolicy: string;
}
export function decodeInventoryControl(value: unknown): InventoryControlSnapshot {
	const data = record(value);
	const amount = (value: unknown): number | string => {
		if ((typeof value !== 'number' && typeof value !== 'string') || String(value).trim() === '' || !Number.isFinite(Number(value))) throw Error('The inventory reconciliation response contains an invalid financial value.');
		return value;
	};
	if (typeof data.asOf !== 'string' || !data.asOf || !Number.isSafeInteger(data.branchid) || Number(data.branchid) <= 0 ||
		!Array.isArray(data.rows) || !Array.isArray(data.controls) || typeof data.balanced !== 'boolean' || typeof data.policy !== 'string' || typeof data.correctionPolicy !== 'string')
		throw Error('The inventory reconciliation response is incomplete. No control balance can be verified.');
	const difference = amount(data.difference);
	const stockValue = amount(data.stockValue), inventoryControl = amount(data.inventoryControl);
	const cents = (value: number | string) => Math.round(Number(value) * 100);
	if (![stockValue, inventoryControl, difference].every(value => Number.isSafeInteger(cents(value))) ||
		cents(stockValue) - cents(inventoryControl) !== cents(difference))
		throw Error('The inventory reconciliation totals are inconsistent. No balanced result can be verified.');
	if (data.balanced && Number(difference) !== 0) throw Error('The inventory reconciliation response claims a balance despite a non-zero difference. Refresh and investigate; it is not verified.');
	return {
		asOf: data.asOf, branchid: Number(data.branchid), stockValue, inventoryControl, difference, balanced: data.balanced, policy: data.policy, correctionPolicy: data.correctionPolicy,
		rows: data.rows.map(value => {
			const row = record(value);
			if (!['string', 'number'].includes(typeof row.itemId) || typeof row.name !== 'string' || (row.sku != null && typeof row.sku !== 'string')) throw Error('Inventory valuation evidence is missing medicine identifiers.');
			return { itemId: row.itemId as string | number, name: row.name, sku: row.sku as string | null, quantity: amount(row.quantity), unitCost: amount(row.unitCost), value: amount(row.value) };
		}),
		controls: data.controls.map(value => {
			const row = record(value); if (typeof row.account !== 'string' || !row.account) throw Error('Inventory control evidence is missing an account code.');
			return { account: row.account, balance: amount(row.balance) };
		}),
	};
}
export function record(value: unknown): RecordData {
	return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as RecordData : {};
}
export function rowsOf(value: unknown): RecordData[] {
	const data = record(value);
	const rows = Array.isArray(value) ? value : data.items ?? data.rows;
	return Array.isArray(rows) ? rows.map(record) : [];
}
export function text(value: unknown): string {
	if (value === null || value === undefined) return '—';
	if (typeof value === 'object') return JSON.stringify(value);
	return String(value);
}
/** Presentation only: source IDs remain untouched in requests, links, persisted evidence and exports. */
export function accountingReference(value: unknown, field = 'source_document', kind?: unknown): string {
	const full = text(value);
	const prefixes: Record<string, string> = { sale: 'PHM', credit_sale: 'PHM', sale_refund: 'RFD', refund: 'RFD', return: 'RTN', receipt: 'RCV', stock_receipt: 'RCV', goods_receipt: 'RCV', purchase: 'RCV', supplier_payment: 'SUP', credit_collection: 'COL', customer_payment: 'COL', expense: 'EXP', expense_refund: 'RFD', journal: 'JRN', manual_journal: 'JRN', ar_adjustment: 'ADJ', ap_settlement: 'SET' };
	const prefix = /journal/i.test(field) ? 'JRN' : /sale_id/.test(field) ? 'PHM' : prefixes[String(kind)] || (field === 'id' ? 'REF' : 'SRC');
	const uuid = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
	return full.replace(new RegExp(`\\b(?:([a-z][a-z0-9]{1,15})-)?(${uuid})\\b`, 'gi'), (_match, existing: string | undefined, id: string) => `${existing?.toUpperCase() || prefix}-${id.slice(0, 8).toUpperCase()}`);
}
export function accountingDateLabel(value: unknown): string {
	const full = text(value);
	return /^\d{4}-\d{2}-\d{2}(?:T|\s|$)/.test(full) ? full.slice(0, 10) : full;
}
export function accountingAmount(value: unknown): string {
	if (value == null || value === '' || !['number', 'string'].includes(typeof value) || !Number.isFinite(Number(value))) return '—';
	return new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value));
}
export function errorMessage(value: unknown): string {
	const data = record(value), error = record(data.error);
	return String(error.message || data.message || (typeof data.error === 'string' ? data.error : '') || 'The accounting request could not be completed.');
}
export function journalError(lines: JournalLine[]): string {
	if (lines.length < 2) return 'At least two journal lines are required.';
	let debit = 0, credit = 0;
	for (const line of lines) {
		const d = Number(line.debit || 0), c = Number(line.credit || 0);
		if (![line.debit, line.credit].every(v => v === '' || /^\d+(\.\d{1,2})?$/.test(v)))
			return 'Use monetary amounts with at most two decimal places.';
		if (!line.account || !Number.isFinite(d) || !Number.isFinite(c) || d < 0 || c < 0 || (d > 0) === (c > 0))
			return 'Each line needs an account and one positive debit or credit.';
		debit += Math.round(d * 100); credit += Math.round(c * 100);
	}
	return debit !== credit ? 'Debits and credits must balance.' : '';
}
export function financialQuery(filters: Record<string, string | number | boolean>): string {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(filters)) if (value !== '') params.set(key, String(value));
	return params.toString();
}
export function csv(rows: RecordData[], columns: string[]): string {
	// Neutralize spreadsheet formulas, including values preceded by whitespace.
	const cell = (value: unknown) => {
		const raw = value === null || value === undefined ? '' : text(value);
		const safe = /^\s*[=+@-]/.test(raw) && !/^-?\d+(\.\d+)?$/.test(raw) ? `'${raw}` : raw;
		return `"${safe.replace(/"/g, '""')}"`;
	};
	return [columns, ...rows.map(row => columns.map(key => row[key]))].map(row => row.map(cell).join(',')).join('\r\n');
}
