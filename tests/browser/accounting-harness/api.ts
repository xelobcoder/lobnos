// This module replaces the authenticated transport ONLY in the isolated browser bundle.
// No request, session token, or real tenant data can leave this harness.
export const currencyFormatter = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' });
export const reactSelectCustomStyles = {};
declare global {
  interface Window {
    __requests?: string[];
    __mutations?: { endpoint: string; method: string; body: unknown }[];
  }
}
const journal = '266a7e7d-2000-4000-8000-012345678901';
const sale = 'f262eb76-2000-4000-8000-012345678901';
const ledgerRow = { id: 'line-1', journal_id: journal, date: '2099-01-03T00:00:00.000Z', reference: journal, kind: 'receipt', description: `Pharmacy receipt PHM-${sale}`, account: 'cash', account_code: '1000', account_name: 'Cash on hand', source_document: sale, business_unit: 'pharmacy', branchid: 4, debit: 120, credit: 0, running_balance: 120 };
const accounts = {
  items: [
    { id: 1, account_code: 'EXP', name: 'Pharmacy operating costs', type: 'expense', normal_balance: 'debit', is_active: true, local_codes: ['expense:operating'] },
    { id: 2, account_code: 'SALES', name: 'Medicine sales', type: 'revenue', normal_balance: 'credit', is_active: true, local_codes: ['sales'] },
    { id: 3, account_code: 'TAX', name: 'Output tax', type: 'liability', normal_balance: 'credit', is_active: true, local_codes: ['liability:output-tax'] },
  ],
  sharedAccounts: [
    { id: 1, account_code: 'EXP', name: 'Pharmacy operating costs', type: 'expense', normal_balance: 'debit', is_active: true },
    { id: 2, account_code: 'SALES', name: 'Medicine sales', type: 'revenue', normal_balance: 'credit', is_active: true },
    { id: 3, account_code: 'TAX', name: 'Output tax', type: 'liability', normal_balance: 'credit', is_active: true },
  ],
};
const supplierBill = { id: 'original-bill-exact', supplier_id: 'supplier-exact-1', source_ref: 'original-receipt-exact', source_kind: 'receipt', outstanding_amount: '50.00', amount: '50.00', document_date: '2099-01-01' };
const application = { id:'application-exact', kind:'supplier_allocate', status:'posted', version:4, financial_date:'2099-01-03', amount:'20.00', description:'Reviewed synthetic original application', created_by:8, details:{sourceId:'registered-source-exact',supplierId:'supplier-exact-1',allocations:[{billId:supplierBill.id,documentRef:supplierBill.source_ref,amount:'20.00'}]},sourceUses:[{id:'use-original',source_id:'registered-source-exact',document_id:'application-exact',bill_id:supplierBill.id,allocation_id:'allocation-exact',financial_date:'2099-01-03',amount:'20.00'}],reversals:[],audit:[] };
export async function customFetch(endpoint: string) {
  const url = new URL(endpoint, 'http://synthetic.invalid/');
  const path = url.pathname.replace(/^\/pharmacy\/accounting\//, '');
  window.__requests ||= [];
  window.__requests.push(endpoint);
  if (new URLSearchParams(location.search).has('failure')) return { success: false, error: { message: 'Synthetic service unavailable' } };
  let data: unknown = { items: [], total: 0 };
  if (path === 'accounts') data = accounts;
  else if (path === 'settings') data = { branchid: 4, tenant_id: 1, enabled: true, effective_date: '2099-01-01', mappings: { sales: 'SALES', 'expense:operating': 'EXP', 'liability:output-tax': 'TAX' } };
  else if (path === 'overview') data = { receivables: 120, payables: 80, documents: [{ kind: 'expense', status: 'draft', count: 1, amount: 25 }], reconciliations: [] };
  else if (path === 'ledger') data = { rows: [ledgerRow], total: 1, page: 1, count: 25, openingBalance: 0, closingBalance: 120 };
  else if (path.startsWith('posted-journals/')) data = { id: journal, kind: 'receipt', source_ref: sale, description: ledgerRow.description, financial_date: '2099-01-03', status: 'posted', business_unit: 'pharmacy', immutable: true, sharedEntryId: 7, lines: [{ ...ledgerRow, source_document: sale }] };
  else if (path === 'journals') data = { items: [{ id: journal, kind: 'manual', description: 'Synthetic draft for review', date: '2099-01-03', status: 'draft', version: 1, amount: 120 }], total: 1 };
  else if (path === 'expenses') data = { items: [{ id: 'expense-1', description: 'Synthetic transport evidence', date: '2099-01-03', amount: 25, status: 'draft', version: 1 }], total: 1 };
  else if (path === 'payables' || path === 'payables/bills') data = {items:[supplierBill],total:1};
  else if (path === 'payables/allocation-sources/candidates') data = {items:[{sourceKind:'payment',sourceRef:'original-payment-exact',supplierId:'supplier-exact-1',amount:'20.00',financialDate:'2099-01-01',journalId:journal}],limit:25,offset:0,scanned:1,nextOffset:null};
  else if (path === 'payables/allocation-sources') data = {items:[{id:'registered-source-exact',sourceKind:'payment',sourceRef:'registered-payment-exact',supplierId:'supplier-exact-1',amount:'40.00',allocatedAmount:'20.00',unappliedAmount:'20.00',availableAmount:'20.00',status:'available',financialDate:'2099-01-01',journalId:journal}],limit:25,offset:0};
  else if (path === 'payables/allocations') data = {items:[application],limit:25,offset:0};
  else if (path === 'payables/allocations/application-exact') data = application;
  else if (path === 'payables/allocation-reversals') data = {items:[{id:'release-exact',kind:'supplier_unallocate',status:'voided',version:3,reversal_of:application.id,financial_date:'2099-01-03',amount:'20.00',description:'Voided synthetic release'}],limit:25,offset:0};
  else if (path === 'payables/allocation-reversals/release-exact') data = {id:'release-exact',kind:'supplier_unallocate',status:'voided',version:3,reversal_of:application.id,financial_date:'2099-01-03',amount:'20.00',details:{sourceId:'registered-source-exact'},sourceUses:[],reversals:[],audit:[]};
  else if (path === 'payables/settlement-reversals') data = {items:[{id:'voided-reversal-exact',kind:'ap_reversal',status:'voided',version:5,reversal_of:'settlement-original-exact',financial_date:'2099-01-03',amount:'20.00',description:'Voided synthetic reversal'}],limit:25,offset:0};
  else if (path === 'reports') data = { rows: [{ account: 'sales', account_name: 'Medicine sales', debit: 0, credit: 120, amount: 120 }], columns: ['account', 'account_name', 'debit', 'credit', 'amount'], totals: { netSales: 120, costOfSales: 40, grossProfit: 80, operatingExpenses: 25, netProfit: 55 } };
  else if (path === 'inventory/reconciliation') data = { asOf: '2099-01-03T12:00:00.000Z', branchid: 4, rows: [{ itemId: 'medicine-1', name: 'Synthetic medicine', sku: 'SYN-1', quantity: 3, unitCost: 30, value: 90 }], stockValue: 90, inventoryControl: 80, difference: 10, balanced: false, controls: [{ account: 'inventory', balance: 80 }], policy: 'Current weighted-average snapshot.', correctionPolicy: 'Investigate original source evidence.' };
  else if (path === 'tax') data = { rules: [{ id: 'rule-1', item_id: 'medicine-1', rate: '10', local_account: 'liability:output-tax', effective_date: '2099-01-01', reason: 'Synthetic approved policy', is_active: 1 }], transactions: [{ id: 'tax-1', sale_id: sale, sale_line_id: 'line-1', gross_amount: '110', net_amount: '100', tax_amount: '10', rate: '10', local_account: 'liability:output-tax', event_type: 'sale', financial_date: '2099-01-03' }], total: 1, policy: 'Tax-inclusive selling prices; only explicitly assigned medicines are taxed.' };
  else if (path === 'tax-credits') data = { items: [], totals: { count: 0, gross: 0, net: 0, tax: 0 }, limit: 25, offset: 0, policy: 'Original frozen snapshots only.' };
  else if (path === 'periods') data = { items: [{ period_code: '2099-01', period_start: '2099-01-01', period_end: '2099-01-31', status: 'open' }], pharmacyCanChangeStatus: false };
  else if (path === 'reconciliation') data = { accounts: [{ id: 7, name: 'Pharmacy Bank', currency: 'GHS' }], items: [] };
  else if (path.includes('/aging')) data = { items: [], buckets: { current: 120 }, total: 120, reconciliation: { reconciled: true, difference: 0, parties: [] } };
  else if (path === 'consolidation') data = { from: url.searchParams.get('from') || '', to: url.searchParams.get('to') || '', linked: 1, unlinked: 0, reviewLimit: 100, truncated: false, items: [], note: 'Synthetic sources only.' };
  else if (path.startsWith('consolidation/')) data = { from: url.searchParams.get('from') || '', to: url.searchParams.get('to') || '', rows: [], journalCount: 0, unlinked: 0, fullyChecked: true, linkedMismatchCount: 0, rowsTruncated: false, reviewLimit: 100, unlinkedShared: 0, orphanSharedEntries: [], orphanSharedEntriesTruncated: false, balanced: true };
  else if (path === 'suppliers' || url.pathname === '/pharmacy/suppliers') data = [{ id: 'supplier-exact-1', name: 'Akwa Synthetic Medical Supplies' }];
  else if (path.includes('/statement')) data = { party: { name: 'Akwa Synthetic Medical Supplies' }, items: [{ date: '2099-01-03', reference: 'BILL-001', description: 'Synthetic bill', debit: 0, credit: 80, balance: 80 }], openingBalance: 0, closingBalance: 80 };
  else if (url.pathname === '/pharmacy/items') data = [{ id: 'medicine-1', name: 'Synthetic medicine' }];
  else if (path === 'revenue' || path === 'inventory') data = { items: [ledgerRow], total: 1 };
  return { success: true, data };
}
export async function customFetchMutation(endpoint: string, method: string, body: unknown) {
  window.__mutations ||= [];
  window.__mutations.push({ endpoint, method, body });
  return { success: false, error: { message: 'Synthetic verification: mutations are recorded, not persisted.' } };
}
