// This module replaces the authenticated transport ONLY in the isolated browser bundle.
// No request, session token, or real tenant data can leave this harness.
export { currencyFormatter, reactSelectCustomStyles } from '../../../components/Auth/customFetch.js';
import { record } from '../../../lib/pharmacyAccounting';
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
const purchaseLines = [{itemId:'medicine-1',name:'Synthetic medicine',quantity:20,unitCost:5}];
const purchaseRequests = [
  {id:'purchase-request-exact',status:'requested',version:7,created_by:8,created_at:'2099-01-03T12:00:00Z',reason:'Replenish synthetic stock',details:{estimatedValue:100,lines:purchaseLines,quotes:[{supplierId:'supplier-exact-1',reference:'Supplier quotation',total:100,lines:purchaseLines}],orderId:''}},
  {id:'own-purchase-request',status:'requested',version:1,created_by:9,created_at:'2099-01-03T12:00:00Z',reason:'Own request needs independent review',details:{estimatedValue:100,lines:purchaseLines,quotes:[{supplierId:'supplier-exact-1',reference:'Original estimate',total:100,lines:purchaseLines}],orderId:''}},
];
export async function customFetch(endpoint: string) {
  const url = new URL(endpoint, 'http://synthetic.invalid/');
  const path = url.pathname.replace(/^\/pharmacy\/accounting\//, '');
  window.__requests ||= [];
  window.__requests.push(endpoint);
  if (new URLSearchParams(location.search).has('failure')) return { success: false, error: { message: 'Synthetic service unavailable' } };
  let data: unknown;
  if (new URLSearchParams(location.search).has('configurationFailure') && path === 'settings') return { success: false, error: { message: 'Synthetic configuration unavailable' } };
  if (path === 'accounts') data = accounts;
  else if (path === 'settings') data = { branchid: 4, tenant_id: 1, enabled: !new URLSearchParams(location.search).has('legacy'), effective_date: '2099-01-01', mappings: { sales: 'SALES', 'expense:operating': 'EXP', 'liability:output-tax': 'TAX' } };
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
  else if (path === 'payables/settlement-reversals/voided-reversal-exact') data = {id:'voided-reversal-exact',kind:'ap_reversal',status:'voided',version:5,reversal_of:'settlement-original-exact',financial_date:'2099-01-03',amount:'20.00',description:'Voided synthetic reversal',details:{originalDocumentId:'settlement-original-exact'},audit:[],reversals:[]};
  else if (path === 'reports') data = { summary: {grossSales:2016220,refunds:200,netSales:2016020,taxCollected:0,receipts:20,refundCount:1,stockValue:2131180.43,medicines:2,reorderItems:0,outOfStock:0,bookRevenue:2016020,costOfSales:53819.79,operatingExpenses:200,profit:1962000.21}, rows: url.searchParams.get('report')==='balance_sheet' ? [{section:'Assets',account:'cash',account_name:'Cash on hand',debit:100,credit:0,amount:100},{section:'Liabilities',account:'payable',account_name:'Supplier balance',debit:0,credit:100,amount:100}] : [{ section:'Revenue', account: 'sales', account_name: 'Medicine sales', debit: 0, credit: 2016020, amount: 2016020 },{section:'Expenses',account:'cost_of_sales',account_name:'Cost of sales',debit:53819.79,credit:0,amount:53819.79},{section:'Expenses',account:'operating_expenses',account_name:'Operating expenses',debit:200,credit:0,amount:200}], columns: ['section','account', 'account_name', 'debit', 'credit', 'amount'], totals: { netSales: 2016020, costOfSales: 53819.79, grossProfit: 1962200.21, operatingExpenses: 200, netProfit: 1962000.21 } };
  else if (path === 'inventory/reconciliation') data = { asOf: '2099-01-03T12:00:00.000Z', branchid: 4, rows: [{ itemId: 'medicine-1', name: 'Synthetic medicine', sku: 'SYN-1', quantity: 3, unitCost: 30, value: 90 }], stockValue: 90, inventoryControl: 80, difference: 10, balanced: false, controls: [{ account: 'inventory', balance: 80 }], policy: 'Current weighted-average snapshot.', correctionPolicy: 'Investigate original source evidence.' };
  else if (path === 'tax') data = { rules: [{ id: 'rule-1', item_id: 'medicine-1', rate: '10', local_account: 'liability:output-tax', effective_date: '2099-01-01', reason: 'Synthetic approved policy', is_active: 1 }], transactions: [{ id: 'tax-1', sale_id: sale, sale_line_id: 'line-1', gross_amount: '110', net_amount: '100', tax_amount: '10', rate: '10', local_account: 'liability:output-tax', event_type: 'sale', financial_date: '2099-01-03' }], total: 1, policy: 'Tax-inclusive selling prices; only explicitly assigned medicines are taxed.' };
  else if (path === 'tax-credits') data = { items: [], totals: { count: 0, gross: 0, net: 0, tax: 0 }, limit: 25, offset: 0, policy: 'Original frozen snapshots only.' };
  else if (path === 'periods') data = { items: [{ period_code: '2099-01', period_start: '2099-01-01', period_end: '2099-01-31', status: 'open' }], pharmacyCanChangeStatus: false };
  else if (path === 'reconciliation') data = { accounts: [{ id: 7, name: 'Pharmacy Bank', currency: 'GHS' }], items: [] };
  else if (['receivables/aging', 'payables/aging'].includes(path)) data = { items: [], buckets: { current: 120 }, total: 120, reconciliation: { reconciled: true, difference: 0, parties: [] } };
  else if (path === 'consolidation') data = { from: url.searchParams.get('from') || '', to: url.searchParams.get('to') || '', linked: 1, unlinked: 0, reviewLimit: 100, truncated: false, items: [], note: 'Synthetic sources only.' };
  else if (path === 'consolidation/reconciliation') data = { from: url.searchParams.get('from') || '', to: url.searchParams.get('to') || '', rows: [], journalCount: 0, unlinked: 0, fullyChecked: true, linkedMismatchCount: 0, rowsTruncated: false, reviewLimit: 100, unlinkedShared: 0, orphanSharedEntries: [], orphanSharedEntriesTruncated: false, balanced: true };
  else if (path === 'suppliers' || url.pathname === '/pharmacy/suppliers') data = [{ id: 'supplier-exact-1', name: 'Akwa Synthetic Medical Supplies' }];
  else if (path === 'suppliers/supplier-exact-1/statement') data = { party: { name: 'Akwa Synthetic Medical Supplies' }, items: [{ date: '2099-01-03', reference: 'BILL-001', description: 'Synthetic bill', debit: 0, credit: 80, balance: 80 }], openingBalance: 0, closingBalance: 80 };
  else if (url.pathname === '/pharmacy/items') data = [{ id: 'medicine-1', name: 'Synthetic medicine' }];
  else if (url.pathname === '/pharmacy/catalogue') data = { items: [{ id: 'medicine-1', inventoryItemId:'medicine-1',name: 'Synthetic medicine', sku: 'SYN-1', unit:'tablet',costPrice:5,availableStock:20,is_active: true }], total: 1, page: 1, count: 20 };
  else if (url.pathname === '/pharmacy/enterprise/workflows' && url.searchParams.get('kind')==='purchase_requisition') data = purchaseRequests;
  else if (url.pathname === '/pharmacy/stock') data = {items:[{inventoryItemId:'medicine-1',name:'Synthetic medicine',sku:'SYN-1',unit:'tablet',availableStock:20,dispensableStock:20,salePrice:8,wholesalePrice:7}],total:1,totalPages:1,summary:{totalItems:1,inStock:1,lowStock:0,outOfStock:0}};
  else if (url.pathname === '/pharmacy/orders') data = [{id:'approved-order-exact',supplier_id:'supplier-exact-1',status:'ordered',created_at:'2099-01-03',total_amount:100,lines:[{id:'order-line-exact',item_id:'medicine-1',name:'Synthetic medicine',quantity_ordered:20,quantity_received:0,unit_cost:5}]}];
  else if (url.pathname === '/pharmacy/receipts') data = {items:[]};
  else if (url.pathname === '/pharmacy/analytics') {
    const meds = ['Amoxicillin 500mg capsules','Paracetamol 500mg','Artemether/Lumefantrine','Metformin 500mg','Nonsteroidal gel 30g','Omeprazole 20mg','Ciprofloxacin 500mg','Vitamin C 1000mg'];
    const days = Array.from({length:14},(_,i)=>`2099-01-${String(i+1).padStart(2,'0')}`);
    const report = url.searchParams.get('report');
    const rows = report === 'movements' ? meds.flatMap((medicine,i)=>[{date:days[i],medicine,movement:'receipt',quantity:40+i*12},{date:days[i+1],medicine,movement:'sale',quantity:-(10+i*5)}])
      : report === 'overview' ? days.map((date,i)=>({date,sales:1200+Math.round(600*Math.sin(i/2))+i*40,refunds:i%4===0?120:20,netSales:1100+Math.round(600*Math.sin(i/2))+i*40}))
      : meds.map((medicine,i)=>({medicine,name:medicine,netSales:900+i*130,grossProfit:300+i*45,stockValue:500+i*90,retailValue:800+i*120,ordered:50+i*5,received:40+i*4,outstanding:10+i}));
    data = {summary:{netSales:2016020,bookRevenue:2016020,costOfSales:53819.79,profit:1962000.21,refunds:200,operatingExpenses:200,stockValue:2131180.43,reorderItems:3,outOfStock:1,medicines:8},rows,columns:Object.keys(rows[0]).map(key=>({key,label:key})),total:rows.length,totalPages:1};
  }
  else if (url.pathname === '/pharmacy/checkout-setup') data = {financialDate:'2099-01-03',day:{status:'open'},accounts:[{id:7,name:'Synthetic pharmacy bank',account_type:'bank'}]};
  else if (url.pathname === '/pharmacy/management/reports') data = {revenue:2016020,costOfSales:53819.79,expenses:200,profit:1962000.21,balances:[{account_code:'sales',debit:0,credit:2016020}],documents:[],days:[{id:'current-day',financial_date:'2099-01-03',status:'open',opened_at:'2099-01-03T08:00:00Z'},{id:'closed-day',financial_date:'2099-01-02',status:'closed',opened_at:'2099-01-02T08:00:00Z',closed_at:'2099-01-02T18:00:00Z'}],shifts:[{id:'handover',cashier_id:8,cashier_name:'Synthetic cashier',financial_date:'2099-01-03',opening_float:100,counted_cash:2000100,variance:-20,closed_at:'2099-01-03T18:00:00Z'}],events:[]};
  else if (url.pathname === '/pharmacy/management/shifts/handover/handover') data = {cashierId:8,financialDate:'2099-01-03',openingFloat:100,cashSales:2000020,cashRefunds:0,cashOut:0,expectedCash:2000120,countedCash:2000100,variance:-20,closed:true,reviewed:false};
  else if (url.pathname === '/pharmacy/collection-accounts') data = [{ id: 7, name: 'Pharmacy Bank', account_type: 'bank', currency: 'GHS', is_active: true }];
  else if (path === 'revenue' || path === 'inventory') data = { items: [ledgerRow], total: 1 };
  else if (['audit', 'receivables', 'receivables/adjustments', 'receivables/adjustment-reversals', 'payables/settlements'].includes(path)) data = { items: [], total: 0 };
  else throw new Error(`Missing isolated browser fixture for ${endpoint}`);
  return { success: true, data: structuredClone(data) };
}
export async function customFetchMutation(endpoint: string, method: string, body: unknown) {
  window.__mutations ||= [];
  window.__mutations.push({ endpoint, method, body });
  if (endpoint==='pharmacy/orders') return {success:true,data:{id:'new-purchase-request',status:'requested',requiresApproval:true,version:1}};
  const row=purchaseRequests.find(row=>endpoint===`pharmacy/enterprise/purchase-requests/${row.id}/decision`);
  if (row) {
    const payload=record(body);
    if(payload.expectedVersion!==row.version||typeof payload.reason!=='string'||payload.reason.trim().length<3) return {success:false,error:{message:'Synthetic purchase version or reason is invalid.'}};
    if(row.created_by===9){
      if(!new URLSearchParams(location.search).has('asAdmin')||payload.adminSelfReview!==true||payload.reason.trim().length<10)return {success:false,error:{message:'Synthetic administrator acknowledgement and detailed reason are required.'}};
      Object.assign(row.details,{adminSelfReview:true,decisionReason:payload.reason,adminSelfReviewBy:9});
    }
    if(payload.decision==='approve'&&payload.quoteIndex===0){row.status='approved';row.details.orderId='approved-order-exact';row.version++;return {success:true,data:{id:row.id,status:row.status,version:row.version}};}
    if(payload.decision==='reject'){row.status='rejected';row.version++;return {success:true,data:{id:row.id,status:row.status,version:row.version}};}
    return {success:false,error:{message:'Synthetic purchase decision is invalid.'}};
  }
  return { success: false, error: { message: 'Synthetic verification: mutations are recorded, not persisted.' } };
}
