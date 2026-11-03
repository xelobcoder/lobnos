const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function compile(file, imports = {}, globals = {}) {
  if(file.startsWith('app/pharmacy/accounting/components/'))imports={
    './AccountingWorkspace.module.css':{__esModule:true,default:{summaryStrip:'accounting-summary',summaryDetail:'summary-detail'}},...imports,
  };
  if(file.endsWith('/Subledgers.tsx'))imports={'next/navigation':{useSearchParams:()=>new URLSearchParams()},'./SupplierAllocations':{__esModule:true,default:()=>null},...imports};
  if(file.endsWith('/Registers.tsx'))imports={
    './AccountingWorkspace.module.css':{__esModule:true,default:{}},
    '../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable':{__esModule:true,default:()=>null},
    './SupplierPicker':{__esModule:true,default:()=>null},
    '@remixicon/react':new Proxy({},{get:(_,name)=>name==='__esModule'?undefined:props=>require('react').createElement('svg',props)}),...imports,
  };
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(code, { exports, URLSearchParams, crypto: require('node:crypto'), ...globals, require: name => {
    if(name.endsWith('.module.css')&&!(name in imports))return {__esModule:true,default:{}};
    if (!(name in imports)) throw Error(`Unexpected dependency ${name}`);
    return imports[name];
  } }, { filename: file });
  return exports;
}
const lib = compile('lib/pharmacyAccounting.ts');
const learningLib = compile('lib/pharmacyLearning.ts', { './pharmacyManual': compile('lib/pharmacyManual.ts') });
const taxLib = compile('lib/pharmacyTax.ts', { './pharmacyAccounting': lib });
const configurationLib = compile('lib/pharmacyAccountingConfiguration.ts');
const plain = value => JSON.parse(JSON.stringify(value));
const balanced = [{ account: 'cash', debit: '12.30', credit: '' }, { account: 'sales', debit: '', credit: '12.30' }];
test('all 19 accounting destinations are unique and accountant-accessible, including nested review', () => {
  const roles = compile('components/Auth/roles.ts');
  const policy = compile('lib/roleNavigationPolicy.ts', { '../components/Auth/roles': roles });
  assert.equal(lib.accountingDestinations.length, 19);
  assert.equal(new Set(lib.accountingDestinations.map(([section]) => section)).size, 19);
  for (const [section] of lib.accountingDestinations) {
    const url = `/pharmacy/accounting${section ? `/${section}` : ''}`;
    assert.equal(policy.canAccessRolePage('pharmacy_accountant', url), true, url);
    assert.equal(policy.canAccessRolePage('pharmacy_storekeeper', url), false, url);
  }
  assert.equal(policy.canAccessRolePage('pharmacy_accountant', '/pharmacy/accounting/journals/document-id'), true);
  assert.equal(policy.canAccessRolePage('pharmacy_accountant', '/accounting/general-ledger?sourceModule=pharmacy'), false);
  assert.equal(policy.canAccessRolePage('pharmacy_manager', '/accounting/general-ledger'), false);
  assert.equal(policy.canAccessRolePage('accountant', '/accounting/general-ledger?sourceModule=pharmacy'), true);
});
test('journal validation uses exact cents, requires two lines and no two-sided lines', () => {
  assert.equal(lib.journalError(balanced), '');
  assert.match(lib.journalError(balanced.slice(0, 1)), /two/);
  assert.match(lib.journalError([{ ...balanced[0], credit: '1' }, balanced[1]]), /one positive/);
  assert.match(lib.journalError([{ ...balanced[0], debit: '12.31' }, balanced[1]]), /balance/);
  assert.match(lib.journalError([{ ...balanced[0], account: '' }, balanced[1]]), /account/);
  assert.match(lib.journalError([{ ...balanced[0], debit: 'NaN' }, balanced[1]]), /monetary/);
  assert.match(lib.journalError([{ ...balanced[0], debit: '12.301' }, balanced[1]]), /two decimal/);
  assert.equal(lib.journalError([{ account: 'a', debit: '0.10', credit: '' }, { account: 'b', debit: '0.20', credit: '' }, { account: 'c', debit: '', credit: '0.30' }]), '');
});
test('document transitions respect independent approval, workflow states and unsupported paid refunds', () => {
  const row = { version: 1, created_by: 7, submitted_by: 8, status: 'submitted' };
  assert.deepEqual(plain(lib.documentActions('journals', row, 7, true)), ['void']);
  assert.deepEqual(plain(lib.documentActions('journals', row, 8, true)), ['void']);
  assert.deepEqual(plain(lib.documentActions('journals', row, 9, true)), ['approve', 'void']);
  assert.deepEqual(plain(lib.documentActions('journals', { ...row, status: 'approved' }, 9, true)), ['post']);
  assert.deepEqual(plain(lib.documentActions('journals', { ...row, status: 'posted' }, 9, true)), ['reverse']);
  assert.deepEqual(plain(lib.documentActions('expenses', { ...row, status: 'paid', details: { paidAmount: '10.00' } }, 9, true)), []);
  assert.deepEqual(plain(lib.documentActions('expenses', { ...row, status: 'partially_paid' }, 9, true)), ['pay']);
  assert.deepEqual(plain(lib.documentActions('journals', row, 9, false)), []);
  assert.deepEqual(plain(lib.documentActions('journals', { ...row, version: undefined }, 9, true)), []);
});
test('account edit payload excludes immutable identity, type and balance fields', () => {
  assert.deepEqual(plain(lib.accountEditPayload({ name: 'Cash desk', parentAccountId: '4', isActive: true })), { name: 'Cash desk', parentAccountId: 4, isActive: true });
  assert.equal(lib.accountEditPayload({ name: 'Cash desk', parentAccountId: '', isActive: false }).parentAccountId, null);
});
test('typed account and settings adapters reject malformed configurations', () => {
  assert.throws(() => lib.decodeAccounts({ items: [] }), /account list/);
  assert.throws(() => lib.decodeSettings({ enabled: 'yes', mappings: {} }), /configuration shape/);
  assert.throws(() => lib.decodeSettings({ enabled: false, mappings: { cash: 100 } }), /configuration shape/);
  const accounts = lib.decodeAccounts({ items: [], sharedAccounts: [{ id: 1, account_code: '100', name: 'Cash', type: 'asset', normal_balance: 'debit', local_codes: ['cash'] }] });
  assert.equal(accounts.sharedAccounts[0].local_codes[0], 'cash');
  assert.equal(lib.decodeSettings({ enabled: false, effective_date: null, mappings: {} }).enabled, false);
});
test('ledger queries encode filters and bounded full-export flag without adding an API prefix', () => {
  const query = lib.financialQuery({ account: 'collection:12', from: '2026-01-01', to: '', all: true, search: 'cash & bank' });
  const params = new URLSearchParams(query);
  assert.equal(params.get('account'), 'collection:12');
  assert.equal(params.get('all'), 'true');
  assert.equal(params.has('to'), false);
  assert.equal(params.get('search'), 'cash & bank');
});
test('CSV export quotes fields and neutralizes spreadsheet formulas', () => {
  const output = lib.csv([{ description: '=CMD()', amount: '-12.30', reference: 'a"b' }], ['description','amount','reference']);
  assert.match(output, /"'=CMD\(\)"/);
  assert.match(output, /"-12.30"/);
  assert.match(output, /"a""b"/);
});
test('accounting adapter calls relative customFetch paths and preserves server errors', async () => {
  const calls = [];
  let response = { success: true, data: { rows: [], total: 0 } };
  const api = compile('app/pharmacy/accounting/components/api.ts', {
    react: {},
    '../../../../components/Auth/customFetch': {
      customFetch: async endpoint => { calls.push({ endpoint }); return response; },
      customFetchMutation: async (endpoint, method, body) => { calls.push({ endpoint, method, body }); return response; },
    },
    '../../../../lib/pharmacyAccounting': lib,
    '../../../../lib/pharmacyTax': taxLib,
  });
  await api.request('ledger?page=1');
  await api.request('journals', 'POST', { financialDate: '2026-01-02', date: '2026-01-02', idempotencyKey: 'key-12345678' });
  await api.request('pharmacy/suppliers', undefined, undefined, true);
  assert.equal(calls[0].endpoint, 'pharmacy/accounting/ledger?page=1');
  assert.equal(calls[1].endpoint, 'pharmacy/accounting/journals');
  assert.equal(calls[1].body.idempotencyKey, 'key-12345678');
  assert.equal(calls[2].endpoint, 'pharmacy/suppliers');
  response = { success: false, error: { code: 'PERIOD_CLOSED', message: 'Posting period is closed' } };
  await assert.rejects(api.request('journals'), /Posting period is closed/);
  response = { success: true };
  await assert.rejects(api.request('overview'), /data envelope/);
});
const React = require('react');
const jsx = require('react/jsx-runtime');
const { renderToStaticMarkup } = require('react-dom/server');
const nextLink = { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) };
const styleModule = { __esModule: true, default: { card: 'card', table: 'table', number: 'number', empty: 'empty' } };
const currencyFormatter=new Intl.NumberFormat('en-GH',{style:'currency',currency:'GHS'});
function PrimeTableFixture({column,data}) {
  return React.createElement('div',{className:'prime-table-decorative'},React.createElement('table',null,
    React.createElement('thead',null,React.createElement('tr',null,column.map(col=>React.createElement('th',{key:col.id,scope:'col'},col.Header)))),
    React.createElement('tbody',null,data.map((row,index)=>React.createElement('tr',{key:index},column.map(col=>React.createElement('td',{key:col.id},col.Cell?col.Cell({row:{original:row,index},value:row[col.accessor]}):String(row[col.accessor]??''))))))));
}
const commonImports = {
  'react/jsx-runtime': jsx,react:React,
  'next/link': nextLink,
  '../../../../lib/pharmacyAccounting': lib,
  '../../components/PharmacyWorkspace.module.css': styleModule,
  './AccountingWorkspace.module.css':{__esModule:true,default:{section:'accounting-section',actions:'accounting-actions',grid:'accounting-grid',dataTable:'accounting-table',number:'text-start',table:'table',summaryStrip:'accounting-summary',summaryDetail:'summary-detail'}},
  '../../../../components/accounting/AccountingTable.module.css':{__esModule:true,default:{tableView:'lab-accounting-table'}},
  '../../../../components/accounting/ReportShell.module.css':{__esModule:true,default:{header:'report-header'}},
  '../../../../components/accessories/Datatables/PrimeTable':{__esModule:true,default:PrimeTableFixture},
  '../../../../components/accessories/Loader':{__esModule:true,default:()=>React.createElement('span',null,'Loading')},
  '../../../../components/Auth/customFetch':{currencyFormatter},
};
const common = compile('app/pharmacy/accounting/components/common.tsx', commonImports);
const hooks = { useState: initial => [typeof initial === 'function' ? initial() : initial, () => {}] };
test('supplier order documents contain quantities without invented costs and mark unapproved copies', () => {
  const lib=compile('lib/pharmacyPurchaseOrder.ts');
  const document={reference:'PO-2026-000125',supplierName:'Original supplier',status:'approved',notes:'Deliver to Pharmacy',lines:[{name:'First tablets',quantity:20,unit:'tablet'},{name:'Second medicine',quantity:5,unit:'bottle'}]};
  const text=lib.purchaseOrderText(document);
  assert.match(text,/Prime Laboratory Software/);assert.match(text,/First tablets: 20 tablet/);assert.match(text,/Second medicine: 5 bottle/);
  assert.doesNotMatch(text,/cost|price|total|NOT AUTHORIZED/);
  assert.match(lib.purchaseOrderText({...document,status:'draft'}),/NOT AUTHORIZED FOR PURCHASE/);
});
function fakePdf() {
  const texts=[],tables=[],state={pages:1,saved:'',images:0};
  class PDF {
    constructor(options){this.options=options;this.internal={pageSize:{getWidth:()=>210,getHeight:()=>297}};this.GState=function(value){return value;};}
    text(value){texts.push(Array.isArray(value)?value.join(' '):String(value));}
    splitTextToSize(value){return [String(value)];}
    addImage(){state.images++;}addPage(){state.pages++;}getNumberOfPages(){return state.pages;}save(name){state.saved=name;}
  }
  for(const name of ['setProperties','setTextColor','setFont','setFontSize','setDrawColor','setLineWidth','line','setFillColor','rect','setPage','saveGraphicsState','setGState','restoreGraphicsState'])PDF.prototype[name]=function(){};
  const autoTable=(doc,options)=>{tables.push(options);doc.lastAutoTable={finalY:options.startY+((options.body||[]).length+(options.head?1:0))*6};};
  return {texts,tables,state,jspdf:{__esModule:true,default:PDF},autotable:{__esModule:true,default:autoTable}};
}
function purchasePdfLib(fake){
  const invoice=compile('components/invoices/organizationInvoicePdf.ts',{jspdf:fake.jspdf,'jspdf-autotable':fake.autotable});
  return compile('lib/pharmacyPurchaseDocumentPdf.ts',{jspdf:fake.jspdf,'jspdf-autotable':fake.autotable,'../components/invoices/organizationInvoicePdf':invoice});
}
const branding={company:{name:'Prime Pharmacy',address:'1 Health Road',phonenumber:244000111,email:'store@example.test'},logo:'data:image/png;base64,AAAA'};
test('purchase order PDF follows the invoice layout with supplier, quantities only, sign-off and approval stamp', () => {
  const lib=compile('lib/pharmacyPurchaseOrder.ts'),fake=fakePdf();
  const order={reference:'PO-2026-000125',supplierName:'Original supplier',supplierPhone:'0244000222',supplierEmail:'sales@supplier.test',createdAt:'2026-11-02',status:'approved',notes:'Deliver before noon',lines:[{name:'First tablets',quantity:20,unit:'tablet'},{name:'Second medicine',quantity:5,unit:'bottle'}]};
  purchasePdfLib(fake).buildPurchaseDocumentPdf(lib.purchaseOrderSpec(order),branding);
  const text=fake.texts.join('\n');
  for(const expected of ['PRIME PHARMACY','PURCHASE ORDER','FROM — ORDERING FACILITY','TO — SUPPLIER','Original supplier','Tel: 0244000222','SUPPLIER INSTRUCTIONS','Quote PO-2026-000125','Authorized by (name, signature & stamp)','Page 1 of 1','Deliver before noon'])assert.ok(text.includes(expected),expected);
  assert.equal(fake.state.images,1);
  const meta=fake.tables[0].body,items=fake.tables[1];
  assert.deepEqual(plain(meta.slice(0,3)),[['PO No.','PO-2026-000125'],['Order Date','02 November 2026'],['Status','Approved']]);
  assert.deepEqual(plain(items.head[0]),['#','Medicine / Description','Unit','Qty Ordered','Qty Supplied']);
  assert.deepEqual(plain(items.body),[['1','First tablets','tablet','20',''],['2','Second medicine','bottle','5','']]);
  assert.doesNotMatch(JSON.stringify(fake.tables)+text,/GHS|Unit cost|Price \(|Amount due|NOT AUTHORIZED|DRAFT/);
  const draft=fakePdf();
  purchasePdfLib(draft).buildPurchaseDocumentPdf(lib.purchaseOrderSpec({...order,status:'draft'}),branding);
  assert.ok(draft.texts.includes('NOT AUTHORIZED FOR PURCHASE'));assert.ok(draft.texts.includes('DRAFT'));
  assert.match(lib.purchaseOrderText({...order,status:'draft'}),/NOT AUTHORIZED FOR PURCHASE/);
});
test('purchase request PDF shows requested and approved quantities as an internal requisition', () => {
  const lib=compile('lib/pharmacyPurchaseOrder.ts'),fake=fakePdf();
  const spec=lib.purchaseRequestSpec({reference:'PR-ABC123',status:'requested',createdAt:'2026-11-01T10:00:00Z',reason:'Replenish low stock',
    lines:[{name:'First tablets',unit:'tablet',quantity:20,requestedQuantity:20,approvedQuantity:15,amendmentReason:'Budget'},{name:'Second medicine',quantity:5}]});
  purchasePdfLib(fake).buildPurchaseDocumentPdf(spec,branding);
  const text=fake.texts.join('\n');
  for(const expected of ['PURCHASE REQUEST','INTERNAL REQUISITION','PURPOSE OF REQUEST','Replenish low stock','REVIEW NOTES','AWAITING APPROVAL','Requested by (name & signature)'])assert.ok(text.includes(expected),expected);
  assert.deepEqual(plain(fake.tables[1].head[0]),['#','Medicine / Description','Unit','Qty Requested','Qty Approved','Review Note']);
  assert.deepEqual(plain(fake.tables[1].body),[['1','First tablets','tablet','20','15','Budget'],['2','Second medicine','units','5','Pending','']]);
  assert.doesNotMatch(text,/TO — SUPPLIER|Thank you for your prompt delivery/);
});
test('purchase document download loads company branding and saves under the reference', async () => {
  let built,saved='';
  const lib=compile('lib/pharmacyPurchaseOrder.ts',{
    './pharmacyPurchaseDocumentPdf':{buildPurchaseDocumentPdf:(spec,brand)=>{built={spec,brand};return {save:name=>{saved=name;}};}},
    '../components/reports/reportPdf':{loadCompanyBranding:async()=>branding},
  });
  await lib.downloadPurchaseOrder({reference:'PO-2026-000125',supplierName:'Supplier',status:'approved',notes:'',lines:[]});
  assert.equal(saved,'PO-2026-000125.pdf');assert.equal(built.brand,branding);assert.equal(built.spec.kind,'order');
  await lib.downloadPurchaseRequest({reference:'PR/7',status:'approved',reason:'Restock',lines:[]});
  assert.equal(saved,'PR_7.pdf');assert.equal(built.spec.kind,'request');assert.equal(built.spec.stamp,undefined);
});
function orderWorkspaceFixture({ role = 'pharmacy_manager', actor = 9, status = 'approved', owner = 8, error = '' } = {}) {
  const manager = ['admin','pharmacy_manager'].includes(role), stock = manager || role === 'pharmacy_storekeeper', finance = manager || role === 'pharmacy_accountant';
  const data = { id:'order-original',reference:'PO-2026-000125',supplierId:'supplier-original',supplierName:'Original supplier',status,createdAt:'2026-11-02',createdBy:owner,version:3,managed:true,notes:'',total:100,canReceive:true,
    lines:[{itemId:'medicine-original',name:'Original medicine',unit:'tablet',quantity:20,accepted:10,unitCost:5,salePrice:8}],
    stages:[{id:'details',label:'Created',state:'complete'},{id:'approval',label:'Approved',state:'complete'},{id:'receiving',label:'Partially received',state:'active'},{id:'stock',label:'Partially stocked',state:'active'},{id:'invoices',label:'Partially invoiced',state:'active'},{id:'payments',label:'Partially paid',state:'active'}],
    deliveries:[],legacyReceipts:[],invoices:[],bills:[],settlements:[],allocations:[],events:[],financial:{amount:'50.00',paid:'20.00',outstanding:'30.00'} };
  const components = compile('app/pharmacy/inventory/orders/page.tsx', {
    'react/jsx-runtime':jsx, react:{...React,...hooks}, 'next/link':nextLink, 'next/navigation':{useSearchParams:()=>new URLSearchParams('order=order-original')},
    '../../../../lib/pharmacyAccounting':lib,'../../../../lib/pharmacyPurchaseOrder':compile('lib/pharmacyPurchaseOrder.ts'),'../../components/PharmacyPurchaseRequestForm':{__esModule:true,default:()=>null},'../../components/PharmacyReceivingModal':{__esModule:true,default:()=>null},
    '../../components/PharmacyPaymentFields':{usePharmacyDocument:()=>({pending:null,execute:async()=>({success:true})})},
    '../../accounting/components/Subledgers':{ControlledActions:()=>null,SettlementForm:()=>null},
    '../deliveries/DeliveriesWorkspace':{SupplierInvoices:({canRecord})=>React.createElement('section',null,React.createElement('h2',null,'Supplier invoices'),canRecord&&React.createElement('button',null,'Record supplier invoice'))},
    '../../../../lib/pharmacyReceiving':{heldQuantity:()=>0},
    '../../components/PharmacyWorkspace':{styles:{},money:value=>currencyFormatter.format(Number(value)),dateLabel:value=>String(value).slice(0,10),
      usePharmacyAccess:()=>({manager,stock,finance,administrator:role==='admin',app:{user:{employeeid:actor}}}),
      usePharmacyResource:()=>({data,loading:false,error,refresh:async()=>{}}),
      Empty:({children})=>React.createElement('p',null,children),Message:({error,notice})=>React.createElement(React.Fragment,null,error&&React.createElement('p',{role:'alert'},error),notice&&React.createElement('p',{role:'status'},notice)),Modal:()=>null},
  });
  return renderToStaticMarkup(React.createElement(components.default));
}
test('order workspace renders the actual reference, partial stages and invoice-level balances together', () => {
  const html=orderWorkspaceFixture();
  assert.match(html,/PO-2026-000125/);assert.match(html,/Original supplier/);assert.match(html,/Original medicine/);
  for(const label of ['Partially received','Partially stocked','Partially invoiced','Partially paid'])assert.ok(html.includes(label));
  for(const stage of ['details','approval','receiving','stock','invoices','payments'])assert.ok(html.includes(`href="#${stage}"`));
  assert.match(html,/Outstanding<\/dt><dd[^>]*>GH₵30\.00/);assert.match(html,/Pay supplier/);
  assert.match(html,/full bill balances, not an invented order-level payment split/);
});
test('order workspace gates stock and finance actions and enforces the self-review distinction', () => {
  const accountant=orderWorkspaceFixture({role:'pharmacy_accountant'});
  assert.doesNotMatch(accountant,/>Receive medicines</);assert.match(accountant,/Pay supplier/);
  const stock=orderWorkspaceFixture({role:'pharmacy_storekeeper'});
  assert.doesNotMatch(stock,/Pay supplier|GH₵30\.00/);assert.match(stock,/finance authority is required/);
  const ownManager=orderWorkspaceFixture({status:'submitted',owner:9});
  assert.match(ownManager,/cannot approve your own order/);assert.doesNotMatch(ownManager,/Confirm decision/);
  const ownAdmin=orderWorkspaceFixture({role:'admin',status:'submitted',owner:9});
  assert.match(ownAdmin,/administrator self-review exception is audited/);assert.match(ownAdmin,/Administrator exception reason/);
});
test('order evidence errors suppress stale financial and operational actions', () => {
  const html=orderWorkspaceFixture({error:'Original order evidence is unavailable'});
  assert.match(html,/Original order evidence is unavailable/);assert.match(html,/Reload order/);
  assert.doesNotMatch(html,/Original medicine|Pay supplier|Receive medicines/);
});
class FormDataFixture {
  constructor(values) { this.values = values; }
  get(key) { return this.values[key] ?? null; }
}
function findElement(node, predicate) {
  if (!node || typeof node !== 'object') return undefined;
  if (predicate(node)) return node;
  for (const child of React.Children.toArray(node.props?.children)) {
    const found = findElement(child, predicate); if (found) return found;
  }
}
const accountsFixture = { items: [{ id: 1, account_code: '101', name: 'Cash desk', type: 'asset', local_codes: ['cash'] }, { id: 2, account_code: '501', name: 'Operating expenses', type: 'expense', local_codes: ['operating_expenses'] }], sharedAccounts: [] };
function documentsForTest(states, calls) {
  let stateIndex = 0;
  const reactHooks = { useState: initial => [states[stateIndex++] ?? (typeof initial === 'function' ? initial() : initial), () => {}] };
  return compile('app/pharmacy/accounting/components/Documents.tsx', {
    'react/jsx-runtime': jsx, react: reactHooks, 'next/link': nextLink,
    '../../../../lib/pharmacyAccounting': lib,
    '../../components/PharmacyWorkspace': { usePharmacyAccess: () => ({ app: { user: { employeeid: 9 } }, finance: true, manager: true }) },
    './Configuration': { LocalAccountSelect: () => null },
    './api': {
      useResource: endpoint => ({ data: endpoint === 'accounts' ? accountsFixture : [{ id: 'supplier-1', name: 'Active supplier' }], loading: false, error: '', refresh: () => {} }),
      useMutation: () => ({ mutate: async (...args) => { calls.push(args); return true; }, pending: false, error: '', notice: '' }),
    },
    './common': common, './Registers': { Register: () => null },
  }, { FormData: FormDataFixture });
}
async function submit(element, values = {}) {
  const form = findElement(element, el => el.type === 'form');
  assert.ok(form, 'an actual workflow form must be rendered');
  await form.props.onSubmit({ preventDefault() {}, currentTarget: values });
}
test('journal create and submit/approve/post/reverse forms send versioned transaction payloads', async () => {
  const calls = [];
  let documents = documentsForTest([balanced], calls);
  await submit(documents.JournalForm({ onSaved() {} }), { description: 'Cash sale adjustment', financialDate: '2026-02-01' });
  assert.equal(calls[0][0], 'journals');
  assert.deepEqual(plain(calls[0][1]), { description: 'Cash sale adjustment', financialDate: '2026-02-01', date: '2026-02-01', lines: [{ account: 'cash', debit: '12.30', credit: '0.00' }, { account: 'sales', debit: '0.00', credit: '12.30' }] });
  for (const [action, status] of [['submit','draft'], ['approve','submitted'], ['post','approved'], ['reverse','posted'], ['void','draft']]) {
    documents = documentsForTest([action, 'Reviewed transaction'], calls);
    await submit(documents.DocumentActions({ row: { id: 'journal-1', status, version: 3, created_by: 7 }, kind: 'journals', refresh() {} }), { financialDate: '2026-02-02' });
    const [endpoint, body] = calls.at(-1);
    assert.equal(endpoint, `journals/journal-1/${action}`);
    assert.equal(body.expectedVersion, 3);
    assert.equal(body.reason, 'Reviewed transaction');
    if (action === 'reverse') assert.equal(body.date, '2026-02-02');
  }
});
test('expense create and pay forms preserve supplier, local mapping, amount, reference and date', async () => {
  const calls = [];
  let documents = documentsForTest([], calls);
  await submit(documents.Expenses(), { description: 'Delivery charge', amount: '45.00', expenseAccount: 'operating_expenses', supplierId: 'supplier-1', financialDate: '2026-02-01' });
  assert.deepEqual(plain(calls[0]), ['expenses', { description: 'Delivery charge', amount: '45.00', expenseAccount: 'operating_expenses', supplierId: 'supplier-1', financialDate: '2026-02-01', date: '2026-02-01' }]);
  for (const [action, status] of [['submit','draft'], ['approve','submitted'], ['pay','approved']]) {
    documents = documentsForTest([action, 'Verified expense'], calls);
    await submit(documents.DocumentActions({ row: { id: 'expense-1', status, version: 4, created_by: 7, amount: '45.00', details: { outstandingAmount: '45.00' } }, kind: 'expenses', refresh() {} }), { financialDate: '2026-02-02', method: 'card', amount: '45.00', reference: 'BANK-123' });
    const [endpoint, body] = calls.at(-1);
    assert.equal(endpoint, `expenses/expense-1/${action}`);
    assert.equal(body.expectedVersion, 4);
    if (action === 'pay') assert.deepEqual(plain(body), { expectedVersion: 4, reason: 'Verified expense', date: '2026-02-02', financialDate: '2026-02-02', method: 'card', amount: '45.00', reference: 'BANK-123' });
  }
});
test('settings form saves only explicit mappings and does not fabricate category allocation', async () => {
  const calls = [];
  const config = compile('app/pharmacy/accounting/components/Configuration.tsx', {
    'react/jsx-runtime': jsx, react: hooks, '../../../../lib/pharmacyAccounting': lib, './common': common,
    '../../../../lib/pharmacyAccountingConfiguration':configurationLib,
    './api': { useResource: () => ({}), useMutation: () => ({ mutate: async (...args) => { calls.push(args); return true; }, pending: false }) },
  });
  await submit(config.SettingsEditor({ initial: { enabled: false, effective_date: null, mappings: { cash: '101' } }, accounts: accountsFixture, refresh() {} }));
  assert.deepEqual(plain(calls[0]), ['settings', { enabled: false, effective_date: null, mappings: { cash: '101' } }, 'PUT']);
  await submit(config.SettingsEditor({ initial: { enabled: true, effective_date: null, mappings: {} }, accounts: accountsFixture, refresh() {} }));
  assert.equal(calls.length, 1, 'enabling without date/mappings must not issue a request');
  await submit(config.SettingsEditor({ initial: { enabled: true, effective_date: '2026-02-01', mappings: { cash: '101', sales: '401' } }, accounts: accountsFixture, refresh() {} }));
  assert.equal(calls.length,1,'incomplete/noncanonical enabled mappings cannot issue a save');
  const explicitMappings=Object.fromEntries(configurationLib.requiredMappingCategories.map(key=>[key,configurationLib.canonicalControl(key)||`approved-${key}`]));
  await submit(config.SettingsEditor({ initial: { enabled: true, effective_date: '2026-02-01', mappings: explicitMappings }, accounts: accountsFixture, refresh() {} }));
  assert.deepEqual(plain(calls[1]), ['settings', { enabled: true, effective_date: '2026-02-01', mappings: explicitMappings }, 'PUT']);
});
test('standalone chart creates Pharmacy-only accounts and distinguishes safe removal actions', async () => {
  const calls = [], rows = [
    { id: 'system:operating_expenses', account_code: 'operating_expenses', name: 'Operating expenses', type: 'expense', normal_balance: 'debit', is_active: true, local_codes: ['operating_expenses'], origin: 'system' },
    { id: 'local:4', account_code: 'RENT', name: 'Rent', type: 'expense', normal_balance: 'debit', is_active: true, local_codes: ['expense:RENT'], origin: 'local' },
    { id: 8, account_code: 'OLD', name: 'Legacy facility account', type: 'asset', normal_balance: 'debit', is_active: true, local_codes: [], origin: 'owned_shared' },
  ];
  const config = compile('app/pharmacy/accounting/components/Configuration.tsx', {
    'react/jsx-runtime': jsx, react: hooks, '../../../../lib/pharmacyAccounting': lib, './common': common,
    '../../../../lib/pharmacyAccountingConfiguration': configurationLib,
    './api': { useResource: () => ({ data: { items: rows, sharedAccounts: [], facilityAvailable: false }, loading: false, error: '', refresh() {} }),
      useMutation: () => ({ mutate: async (...args) => { calls.push(args); return true; }, pending: false, error: '', notice: '' }) },
  }, { FormData: FormDataFixture, window: { confirm: () => true, scrollTo() {} } });
  const chart = config.ChartOfAccounts();
  await submit(chart, { accountCode: 'RENT2', name: 'Other rent', type: 'expense', normalBalance: 'debit' });
  assert.deepEqual(plain(calls[0]), ['local-accounts', { accountCode: 'RENT2', name: 'Other rent', type: 'expense', normalBalance: 'debit', parentAccountId: null }, 'POST']);
  const table = findElement(chart, node => node.type === common.DataTable);
  assert.ok(table);
  assert.equal(findElement(table.props.actions(rows[0]), node => node.type === 'button'), undefined);
  await findElement(table.props.actions(rows[1]), node => node.type === 'button' && node.props.children === 'Delete').props.onClick();
  await findElement(table.props.actions(rows[2]), node => node.type === 'button' && node.props.children === 'Remove from Pharmacy').props.onClick();
  assert.deepEqual(plain(calls.slice(1)), [['local-accounts/4/remove', {}], ['accounts/8/remove', {}]]);
});
test('standalone tax rules offer active Pharmacy liabilities without a facility mapping', () => {
  const accounts = { items: [
    { id: 'system:liability:output_tax', account_code: 'liability:output_tax', name: 'Sales tax payable', type: 'liability', is_active: true, local_codes: ['liability:output_tax'] },
    { id: 'system:liability:grni', account_code: 'liability:grni', name: 'Goods received not invoiced', type: 'liability', is_active: true, local_codes: ['liability:grni'] },
    { id: 'local:9', account_code: 'OLD', name: 'Inactive', type: 'liability', is_active: false, local_codes: ['liability:old'] },
  ], sharedAccounts: [] };
  assert.deepEqual(plain(taxLib.taxLiabilityOptions(accounts, { enabled: false, effective_date: null, mappings: {} })),
    [{ localAccount: 'liability:output_tax', code: 'liability:output_tax', name: 'Sales tax payable' }]);
  assert.deepEqual(plain(taxLib.taxLiabilityOptions(accounts, { enabled: true, effective_date: '2026-11-02', mappings: {} })), []);
});
test('financial statement renders real section tables, totals and classification warning; server errors never show stale rows', () => {
  function workspace(resource) {
    return compile('app/pharmacy/accounting/components/Registers.tsx', {
      'react/jsx-runtime': jsx, react: hooks, 'next/link': nextLink,
      '../../../../lib/pharmacyAccounting': lib, './common': common,
      './api': { useResource: () => ({ ...resource, refresh() {} }) },
      './exports': {},
    });
  }
  const data = { rows: [{ id: 1, section: 'Revenue', account: 'sales', amount: '123.45' },{id:2,section:'Expenses',account:'cost_of_sales',amount:'53.00'},{id:3,section:'Liabilities',account:'payable',amount:'20.00'}], columns: [{key:'section',label:'Section'}, { key: 'account', label: 'Account' }, { key: 'amount', label: 'Amount' }], total: 3, totals: { netProfit: '123.45' }, classificationIssues: [{ journalId: 'j1', description: 'Unclassified entry', amount: '1.00' }] };
  let registers = workspace({ data, loading: false, error: '' });
  const html = renderToStaticMarkup(registers.Register({ endpoint: 'reports', report: 'profit_loss' }));
  assert.match(html, /<table/); assert.match(html, /Revenue/); assert.match(html, /123.45/);
  assert.match(html, /Net Profit/); assert.match(html, /classification is incomplete/);
  const document=new (require('jsdom').JSDOM)(html).window.document;
  for(const name of ['Expenses','Liabilities']){
    const section=document.querySelector(`section[aria-label="${name}"]`);
    assert.equal(section.querySelectorAll('h3').length,1,'each statement group needs exactly one heading');
    assert.equal(section.querySelector('h3').textContent,name);
    assert.equal([...section.querySelectorAll('th')].some(e=>e.textContent==='Section'),false,'group names should not be repeated in every row');
  }
  registers = workspace({ data: null, loading: false, error: 'Financial period unavailable' });
  const errorHtml = renderToStaticMarkup(registers.Register({ endpoint: 'reports', report: 'profit_loss' }));
  assert.match(errorHtml, /role="alert"/); assert.match(errorHtml, /Financial period unavailable/);
  assert.doesNotMatch(errorHtml, /123.45|<table/);
});
test('mutation hook injects idempotency into POST and PUT and retains a retry key after failure', async () => {
  const calls = []; let fail = true;
  const api = compile('app/pharmacy/accounting/components/api.ts', {
    react: { ...hooks, useRef: value => ({ current: value }) }, '../../../../lib/pharmacyAccounting': lib,
    '../../../../lib/pharmacyTax': taxLib,
    '../../../../components/Auth/customFetch': { customFetchMutation: async (endpoint, method, body) => {
      calls.push({ endpoint, method, body });
      return fail ? { success: false, error: { message: 'Network outcome unknown' } } : { success: true, data: {} };
    } },
  });
  const mutation = api.useMutation();
  await mutation.mutate('journals/j1/post', { expectedVersion: 3 });
  fail = false;
  await mutation.mutate('journals/j1/post', { expectedVersion: 3 });
  assert.equal(calls[0].body.idempotencyKey, calls[1].body.idempotencyKey);
  await mutation.mutate('settings', { enabled: false, effective_date: null, mappings: {} }, 'PUT');
  assert.equal(calls[2].method, 'PUT'); assert.ok(calls[2].body.idempotencyKey);
});
test('full-filtered exports fetch every page, preserve filters and reject truncation or ignored pagination', async () => {
  const calls = [], page = Array.from({ length: 200 }, (_, id) => ({ id }));
  let truncated = false, ignoresPaging = false;
  const exportsApi = compile('app/pharmacy/accounting/components/exports.ts', {
    '../../../../lib/pharmacyAccounting': lib,
    './api': { request: async endpoint => {
      calls.push(endpoint);
      if (endpoint.startsWith('ledger?')) return { rows: [{ id: 1 }], total: 1, truncated };
      return { items: ignoresPaging || endpoint.includes('offset=0') ? page : [{ id: 200 }], total: 201 };
    } },
  });
  const data = await exportsApi.fullFilteredExport('expenses', { status: 'approved', from: '2026-01-01' });
  assert.equal(data.rows.length, 201);
  assert.ok(calls[1].includes('offset=200')); assert.ok(calls[1].includes('status=approved'));
  await exportsApi.fullFilteredExport('ledger', { account: 'cash' }, { ledger: true });
  assert.match(calls.at(-1), /all=true/);
  truncated = true;
  await assert.rejects(exportsApi.fullFilteredExport('ledger', {}, { ledger: true }), /incomplete/);
  ignoresPaging = true;
  await assert.rejects(exportsApi.fullFilteredExport('expenses', {}), /did not advance/);
});
test('bank reconciliation forms send statement evidence to import, match and finalize endpoints', async () => {
  const calls = [], bankLine = { date: '2026-02-02', reference: 'BANK-001', amount: '25.00', description: 'Customer receipt' };
  const states = ['statement-1', [bankLine], '', 0]; let index = 0, matched=false;
  const controls = compile('app/pharmacy/accounting/components/Controls.tsx', {
    'react/jsx-runtime': jsx, react: { useState: initial => [states[index++] ?? initial, () => {}] },
    '../../../../lib/pharmacyAccounting': lib, '../../components/PharmacyWorkspace': { usePharmacyAccess: () => ({ manager: true,app:{user:{employeeid:9}} }) },
    './api': {
      useResource: endpoint => ({ data: endpoint.startsWith('ledger?')?{openingBalance:0,closingBalance:25}:endpoint.includes('?') ? { statement: { id: 'statement-1', account_id:12,created_by:8,status: 'imported',opening_balance:0,closing_balance:25 }, items: [{ id: 'bank-line-1', amount: '25.00',...(matched?{journal_line_id:8}:{}) }], ledgerLines: [{ id: 8, amount: '25.00', matched }] } : { items: [{ id: 'statement-1' }], accounts: [{ id: 12, name: 'Bank' }] }, loading: false, error: '', refresh() {} }),
      useMutation: () => ({ mutate: async (...args) => { calls.push(args);if(args[0]==='reconciliation/match')matched=true; return true; }, pending: false }),
    },
    './common': common, './Registers': { Register: () => null },
  }, { FormData: FormDataFixture });
  let forms = [];
  function collect(node) { if (!node || typeof node !== 'object') return; if (node.type === 'form') forms.push(node); React.Children.toArray(node.props?.children).forEach(collect); }
  const render=()=>{index=0;forms=[];collect(controls.Reconciliation());};render();
  assert.equal(forms.length, 3);
  await submit(forms[0], { accountId: '12', reference: 'FEB-STATEMENT', startDate: '2026-02-01', endDate: '2026-02-28', openingBalance: '0.00', closingBalance: '25.00' });
  assert.equal(calls[0][0], 'reconciliation/import');
  assert.deepEqual(plain(calls[0][1].lines), [bankLine]); assert.equal(calls[0][1].accountId, 12);
  await submit(forms[2],{reason:'Cannot bypass unmatched evidence'});
  assert.equal(calls.length,1,'Finalization handler itself blocks unmatched evidence');
  await submit(forms[1], { statementLineId: 'bank-line-1', journalLineId: '8' });
  assert.deepEqual(plain(calls[1]), ['reconciliation/match', { statementId: 'statement-1', statementLineId: 'bank-line-1', journalLineId: 8 }]);
  render();
  await submit(forms[2], { reason: 'Bank and book balances reconciled' });
  assert.deepEqual(plain(calls[2]), ['reconciliation/finalize', { statementId: 'statement-1', reason: 'Bank and book balances reconciled' }]);
});
test('Excel and PDF exporters build structured financial rows and totals, not chart images', async () => {
  const sheets = [], tables = [], documents = [];
  class PdfFixture {
    constructor() { this.internal = { pageSize: { getWidth: () => 297 } }; documents.push(this); }
    setFontSize() {}
    text() {}
    splitTextToSize(value) { return [value]; }
    addPage() {}
    save(name) { this.filename = name; }
  }
  const exportsApi = compile('app/pharmacy/accounting/components/exports.ts', {
    '../../../../lib/pharmacyAccounting': lib, './api': {},
    xlsx: { utils: { aoa_to_sheet: rows => { sheets.push(rows); return {}; }, book_new: () => ({}), book_append_sheet() {}, json_to_sheet: rows => rows }, writeFile() {} },
    jspdf: { jsPDF: PdfFixture },
    'jspdf-autotable': { __esModule: true, default: (_doc, table) => { tables.push(table); } },
  });
  const data = { rows: [{ account: 'sales', amount: '100.00' }], metadata: { columns: ['account','amount'], totals: { netProfit: '100.00' } } };
  await exportsApi.downloadAccountingExport('xlsx', 'Pharmacy profit loss', data, '2026-01-01 to 2026-02-01');
  assert.ok(sheets[0].some(row => row[0] === 'sales' && row[1] === '100.00'));
  assert.ok(sheets[0].some(row => row[0] === 'net Profit' && row[1] === '100.00'));
  await exportsApi.downloadAccountingExport('pdf', 'Pharmacy profit loss', data, '2026-01-01 to 2026-02-01');
  assert.deepEqual(plain(tables[0].body), [['sales','100.00']]);
  assert.deepEqual(plain(tables[1].body), [['net Profit','100.00']]);
  assert.match(documents[0].filename, /\.pdf$/);
});
const taxAccounts = {
  items: [],
  sharedAccounts: [
    { id: 21, account_code: 'OUTPUT-TAX', name: 'Approved output tax', type: 'liability', is_active: true },
    { id: 22, account_code: 'REVENUE', name: 'Sales', type: 'revenue', is_active: true },
    { id: 23, account_code: 'OLD-TAX', name: 'Inactive output tax', type: 'liability', is_active: false },
  ],
};
const taxSettings = { enabled: true, effective_date: '2026-11-02', mappings: { 'liability:output-tax': 'OUTPUT-TAX', payable: 'OUTPUT-TAX', 'liability:wrong-type': 'REVENUE', 'liability:inactive': 'OLD-TAX' } };
const taxFixture = {
  policy: 'Tax-inclusive selling prices; only explicitly assigned medicines are taxed.',
  rules: [{ id: 'rule-1', item_id: 'medicine-1', rate: '10.0000', local_account: 'liability:output-tax', effective_date: '2026-11-02', reason: 'Reviewed facility policy', is_active: 1 }],
  transactions: [
    { id: 'tax-1', sale_id: 'sale-1', sale_line_id: 'line-1', gross_amount: '27.50', net_amount: '25.00', tax_amount: '2.50', rate: '10.0000', local_account: 'liability:output-tax', event_type: 'sale', financial_date: '2026-11-02' },
    { id: 'tax-2', sale_id: 'sale-1', sale_line_id: 'line-1', gross_amount: '27.50', net_amount: '25.00', tax_amount: '2.50', rate: '10.0000', local_account: 'liability:output-tax', event_type: 'refund', financial_date: '2026-11-03' },
  ],
  total: 2,
};
function taxComponents({ manager = true, states, calls = [], resourceError = '', exported = [], requests = [] } = {}) {
  let stateIndex = 0;
  return compile('app/pharmacy/accounting/components/Tax.tsx', {
    'react/jsx-runtime': jsx, 'next/link': nextLink,
    react: states ? { useState: initial => [states[stateIndex++] ?? (typeof initial === 'function' ? initial() : initial), () => {}] } : hooks,
    '../../../../lib/pharmacyAccounting': lib, '../../../../lib/pharmacyTax': taxLib,
    '../../components/PharmacyWorkspace': { MedicinePicker: () => null, usePharmacyAccess: () => ({ manager }) },
    './api': {
      useResource: endpoint => { requests.push(endpoint); return { data: resourceError ? null : endpoint.startsWith('tax') ? taxLib.decodeTax(taxFixture) : endpoint === 'accounts' ? taxAccounts : taxSettings, loading: false, error: resourceError, refresh() {} }; },
      useMutation: () => ({ pending: false, mutate: async (...args) => { calls.push(args); return true; } }),
    },
    './common': common,'./Registers':{Register:()=>null},
    '../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable':{__esModule:true,default:()=>null},
    './exports': { downloadAccountingExport: async (...args) => { exported.push(args); } },
  }, { FormData: FormDataFixture });
}
test('tax adapters preserve original sale/refund snapshots and reject incomplete server-filtered histories', () => {
  const data = taxLib.decodeTax(taxFixture);
  assert.equal(data.total, 2);
  assert.throws(() => taxLib.decodeTax({ ...taxFixture, total: 3 }), /incomplete/);
  assert.equal(data.rules[0].is_active, true);
  assert.equal(data.transactions[1].tax_amount, '2.50');
  assert.equal(data.transactions[1].rate, '10.0000');
  assert.throws(() => taxLib.decodeTax({ policy: 'policy', rules: [] }), /rules and transaction/);
  assert.throws(() => taxLib.decodeTax({ ...taxFixture, total: 1, transactions: [{ ...taxFixture.transactions[0], tax_amount: 'invalid' }] }), /financial value/);
  assert.deepEqual(plain(taxLib.taxLiabilityOptions(taxAccounts, taxSettings)), [{ localAccount: 'liability:output-tax', code: 'OUTPUT-TAX', name: 'Approved output tax' }]);
});
test('tax rule form submits explicit medicine, percentage, mapped liability, effective date and evidence only', async () => {
  const calls = [], tax = taxComponents({ states: [{ id: 'medicine-1', name: 'Explicitly selected medicine' }, '', 0], calls });
  const element = tax.TaxRuleForm({ accounts: taxAccounts, settings: taxSettings, refresh() {} });
  const rate = findElement(element, el => el.type === 'input' && el.props.name === 'rate');
  assert.equal(rate.props.defaultValue, undefined, 'no prefilled jurisdictional rate');
  assert.equal(rate.props.step, '0.0001'); assert.equal(rate.props.max, '100');
  const liability = findElement(element, el => el.type === 'select' && el.props.name === 'localAccount');
  const choices = React.Children.toArray(liability.props.children).flatMap(el => React.isValidElement(el) ? [el.props.value] : []);
  assert.deepEqual(choices, ['', 'liability:output-tax']);
  await submit(element, { rate: '7.1250', localAccount: 'liability:output-tax', effectiveDate: '2099-01-01', reason: ' Facility approved rate and effective date ' });
  assert.deepEqual(plain(calls[0]), ['tax/rules', { itemId: 'medicine-1', rate: 7.125, localAccount: 'liability:output-tax', effectiveDate: '2099-01-01', reason: 'Facility approved rate and effective date' }]);
  await submit(element, { rate: '', localAccount: 'liability:output-tax', effectiveDate: '2099-01-01', reason: 'Missing rate' });
  await submit(element, { rate: '7', localAccount: 'liability:wrong-type', effectiveDate: '2099-01-01', reason: 'Wrong account type' });
  assert.equal(calls.length, 1, 'blank rates and unmapped/inactive/non-liability choices cannot issue mutations');
  assert.throws(() => taxLib.taxRulePayload({ itemId: 'medicine-1', rate: '5.12345', localAccount: 'liability:output-tax', effectiveDate: '2099-01-01', reason: 'Five decimals' }, ['liability:output-tax']), /four decimal/);
});
test('finance reads real tax rule and transaction tables but cannot configure; failures show no stale evidence', () => {
  let tax = taxComponents({ manager: false });
  const readOnly = tax.TaxRuleForm({ accounts: taxAccounts, settings: taxSettings, refresh() {} });
  assert.equal(findElement(readOnly, el => el.type === 'form'), undefined);
  const html = renderToStaticMarkup(tax.default());
  assert.match(html, /<table/); assert.match(html, /rule-1/); assert.match(html, /tax-2/);
  assert.match(html, /27.50/); assert.match(html, /25.00/); assert.match(html, /2.50/);
  assert.match(html, /Only a pharmacy manager or administrator/);
  assert.match(html, /only explicitly assigned medicines/);
  tax = taxComponents({ resourceError: 'Tax policy service unavailable' });
  const errorHtml = renderToStaticMarkup(tax.default());
  assert.match(errorHtml, /role="alert"/); assert.match(errorHtml, /Tax policy service unavailable/);
  assert.doesNotMatch(errorHtml, /rule-1|tax-2|<table/);
});
test('tax uses server date filters and exports every filtered snapshot, not only the displayed page', async () => {
  const filtered = taxLib.filterTaxTransactions(taxFixture.transactions, { from: '2026-11-03', to: '2026-11-03', search: 'sale-1', eventType: 'refund' });
  assert.equal(filtered.length, 1); assert.equal(filtered[0].tax_amount, '2.50'); assert.equal(filtered[0].rate, '10.0000');
  const exported = [], tax = taxComponents({ exported });
  const element = tax.TaxTransactions({ transactions: taxFixture.transactions, range: { from: '2026-11-02', to: '2026-11-03' } });
  const html = renderToStaticMarkup(element);
  assert.match(html, /Requests exceeding 10,000 rows are rejected rather than truncated/);
  assert.doesNotMatch(html, /1,000|history limit|Additional history may exist/);
  const excel = findElement(element, el => el.type === 'button' && el.props.children === 'Excel · all filtered rows');
  await excel.props.onClick();
  assert.equal(exported[0][0], 'xlsx'); assert.equal(exported[0][2].rows.length, 2);
  assert.equal(exported[0][2].rows[1].tax_amount, '2.50');
  assert.match(exported[0][3], /complete server-filtered records/);
  const requests = [];
  taxComponents({ requests, states: [{ from: '2026-11-02', to: '2026-11-03' }] }).default();
  assert.equal(requests[0], 'tax?from=2026-11-02&to=2026-11-03');
});
function subledgersForTest({ states = [], calls = [], actor = 9, bills = [], linkedId = '' } = {}) {
  let index=0;
  return compile('app/pharmacy/accounting/components/Subledgers.tsx',{
    'react/jsx-runtime':jsx,'next/link':nextLink,
    'next/navigation':{useSearchParams:()=>new URLSearchParams(linkedId ? {billId:linkedId} : {})},
    react:{useState:initial=>[states[index++]??(typeof initial==='function'?initial():initial),()=>{}]},
    '../../../../lib/pharmacyAccounting':lib,
    '../../components/PharmacyWorkspace':{usePharmacyAccess:()=>({app:{user:{employeeid:actor}},finance:true})},
    './api':{useResource:()=>({data:{items:bills},loading:false,error:'',refresh(){}}),useMutation:()=>({pending:false,mutate:async(...args)=>{calls.push(args);return true;}})},
    './Configuration':{LocalAccountSelect:()=>null},'./common':common,'./Registers':{Register:()=>null},'./exports':{},
  },{FormData:FormDataFixture});
}
test('supplier invoice deep links show only the exact authorized bill and expose missing evidence',()=>{
  const bills=[{id:'invoice-bill',source_kind:'supplier_invoice',supplier_name:'Example supplier',amount:35,outstanding_amount:15},{id:'other-bill',source_kind:'receipt',supplier_name:'Other supplier',amount:90}];
  const html=renderToStaticMarkup(subledgersForTest({bills,linkedId:'invoice-bill'}).Payables());
  assert.match(html,/Linked supplier bill/);assert.match(html,/Example supplier/);assert.doesNotMatch(html,/Other supplier/);
  assert.match(renderToStaticMarkup(subledgersForTest({bills,linkedId:'missing-bill'}).Payables()),/unavailable in this branch/);
});
test('AP bill registration and due date forms preserve source evidence and cannot rewrite known terms',async()=>{
  const calls=[],ui=subledgersForTest({calls});
  await submit(ui.BillRegistration({refresh(){}}),{receiptId:'posted-receipt-1',reference:'SUP-001',dueDate:'2099-02-01'});
  assert.deepEqual(plain(calls[0]),['payables/bills',{receiptId:'posted-receipt-1',reference:'SUP-001',dueDate:'2099-02-01'}]);
  await submit(ui.DueDateForm({id:'bill-1',endpoint:'payables/bills',dueDate:null,refresh(){}}),{dueDate:'2099-02-01',reason:'Supplier terms evidence'});
  assert.deepEqual(plain(calls[1]),['payables/bills/bill-1/due-date',{dueDate:'2099-02-01',reason:'Supplier terms evidence'},'PUT']);
  const known=ui.DueDateForm({id:'bill-1',endpoint:'payables/bills',dueDate:'2099-02-01',refresh(){}});
  assert.equal(findElement(known,el=>el.type==='form'),undefined);
  await submit(ui.DueDateForm({id:'sale-1',endpoint:'receivables',dueDate:null,refresh(){}}),{dueDate:'2099-03-01',reason:'Agreed invoice terms'});
  assert.equal(calls[2][0],'receivables/sale-1/due-date');
});
test('order payment mode uses plain language but preserves exact partial bill allocations',async()=>{
  const calls=[],bills=[{id:'bill-original',supplier_id:'supplier-1',source_kind:'supplier_invoice',outstanding_amount:'100.00',reference:'INV-ORIGINAL'}];
  const ui=subledgersForTest({calls,states:[[{billId:'bill-original',amount:'25.00'}],'',0]});
  const form=ui.SettlementForm({simple:true,bills,refresh(){}});
  const html=renderToStaticMarkup(form);
  assert.match(html,/Record supplier payment/);assert.match(html,/Amount paid 1/);assert.match(html,/Paid from/);assert.match(html,/>Record payment</);
  assert.doesNotMatch(html,/Create allocated supplier settlement|Allocation 1 bill|Save draft allocated settlement|approval/);
  await submit(form,{date:'2099-01-01',method:'card',reference:'BANK-77',description:'Supplier invoice settlement'});
  assert.deepEqual(plain(calls[0]),['payables/payments',{date:'2099-01-01',method:'card',allocations:[{billId:'bill-original',amount:'25.00'}],reference:'BANK-77',description:'Supplier invoice settlement'}]);
});
test('AP settlement form sends explicit bill allocations and controlled actions never rewrite date or allocation',async()=>{
  const calls=[],bills=[{id:'bill-1',supplier_id:'supplier-1',source_kind:'receipt',outstanding_amount:'50.00',reference:'SUP-001'}];
  let ui=subledgersForTest({calls,states:[[{billId:'bill-1',amount:'20.00'}],'',0]});
  await submit(ui.SettlementForm({bills,refresh(){}}),{date:'2099-01-01',description:'Partial approved bill payment'});
  assert.deepEqual(plain(calls[0]),['payables/settlements',{date:'2099-01-01',description:'Partial approved bill payment',allocations:[{billId:'bill-1',amount:'20.00'}]}]);
  ui=subledgersForTest({calls,states:[[{billId:'invoice-bill',amount:'15.00'}],'',0]});
  await submit(ui.SettlementForm({bills:[{id:'invoice-bill',supplier_id:'supplier-1',source_kind:'supplier_invoice',outstanding_amount:'35.00',reference:'INV-001'}],refresh(){}}),{date:'2099-01-01',description:'Pay accepted goods invoice'});
  assert.deepEqual(plain(calls.at(-1)),['payables/settlements',{date:'2099-01-01',description:'Pay accepted goods invoice',allocations:[{billId:'invoice-bill',amount:'15.00'}]}]);
  for(const [action,status] of [['submit','draft'],['approve','submitted'],['pay','approved'],['void','draft']]){
    ui=subledgersForTest({calls,states:[action]});
    await submit(ui.ControlledActions({row:{id:'settlement-1',version:4,status,created_by:7},kind:'settlement',refresh(){}}),{method:'card',reference:'BANK-001',reason:'Reviewed payment evidence',date:'2099-03-01',amount:'999'});
    const [endpoint,body]=calls.at(-1);
    assert.equal(endpoint,`payables/settlements/settlement-1/${action}`);assert.equal(body.expectedVersion,4);
    assert.equal('date'in body,false);assert.equal('allocations'in body,false);assert.equal('amount'in body,false);
    if(action==='pay'){assert.equal(body.method,'card');assert.equal(body.reference,'BANK-001');}
  }
  for(const status of ['draft','submitted']){
    ui=subledgersForTest({calls,states:['record_payment']});
    await submit(ui.ControlledActions({row:{id:'settlement-2',version:2,status,created_by:9},kind:'settlement',refresh(){}}),{method:'mobile_money',reference:'MOMO-1',date:'2099-03-01',amount:'999'});
    const [endpoint,body]=calls.at(-1);
    assert.equal(endpoint,'payables/settlements/settlement-2/record_payment');assert.equal(body.expectedVersion,2);assert.equal(body.method,'mobile_money');assert.equal(body.reference,'MOMO-1');
    assert.equal('allocations'in body,false);assert.equal('amount'in body,false);
  }
  assert.deepEqual(plain(ui.controlledActions({status:'submitted',version:1,created_by:9},9,true,'settlement')),['record_payment','void']);
});
test('AP application/release actions require versioned independent approval and cannot move new money',async()=>{
  for(const [kind,path]of [['allocation','payables/allocations'],['release','payables/allocation-reversals']]){
    for(const [action,status]of [['submit','draft'],['approve','submitted'],['post','approved'],['void','draft']]){
      const calls=[],ui=subledgersForTest({calls,states:[action]});
      const element=ui.ControlledActions({row:{id:'exact-ap-document',version:7,status,created_by:8},kind,refresh(){}});
      await submit(element,{reason:'Reviewed attribution evidence',amount:'999',date:'2099-01-03',method:'cash',sourceId:'forbidden',allocations:'forbidden'});
      assert.deepEqual(plain(calls),[[`${path}/exact-ap-document/${action}`,{expectedVersion:7,reason:'Reviewed attribution evidence'}]]);
    }
    const ui=subledgersForTest({});
    assert.deepEqual(plain(ui.controlledActions({status:'submitted',version:1,created_by:9},9,true,kind)),['void']);
    assert.deepEqual(plain(ui.controlledActions({status:'approved',version:null},9,true,kind)),[]);
  }
});
test('AR write-off and credit forms preserve invoice identity, non-cash counterpart and approval version',async()=>{
  const calls=[],invoices=[{id:'sale-1',receipt_number:'INV-001',outstanding_amount:'30.00'}];
  for(const kind of ['credit','writeoff']){
    let ui=subledgersForTest({calls,states:[kind,0]});
    await submit(ui.AdjustmentForm({invoices,accounts:accountsFixture,refresh(){}}),{saleId:'sale-1',date:'2099-01-01',amount:'10.00',account:kind==='credit'?'revenue:credits':'expense:bad-debt',reason:'Approved invoice correction'});
    const [endpoint,body]=calls.at(-1);
    assert.equal(endpoint,'receivables/adjustments');
    assert.equal(body.saleId,'sale-1');assert.equal(body.kind,kind);assert.equal(body.amount,'10.00');assert.equal('method'in body,false);
    ui=subledgersForTest({calls,states:['post']});
    await submit(ui.ControlledActions({row:{id:'adjustment-1',version:3,status:'approved',created_by:7},kind:'adjustment',refresh(){}}),{reason:'Reviewed invoice evidence'});
    assert.deepEqual(plain(calls.at(-1)),['receivables/adjustments/adjustment-1/post',{expectedVersion:3,reason:'Reviewed invoice evidence'}]);
  }
});
function evidenceForTest({states=[],calls=[]}={}){
  let index=0;
  class FileFixture{constructor(){this.size=10;this.type='application/pdf';this.name='evidence.pdf';}}
  class ReaderFixture{readAsDataURL(){this.result='data:application/pdf;base64,JVBERi0xLjQ=';this.onload();}}
  const ui=compile('app/pharmacy/accounting/components/ExpenseEvidence.tsx',{
    'react/jsx-runtime':jsx,'next/link':nextLink,react:{useState:initial=>[states[index++]??initial,()=>{}]},
    '../../../../lib/pharmacyAccounting':lib,
    './api':{useResource:()=>({data:{items:[]},loading:false,error:'',refresh(){}}),useMutation:()=>({pending:false,mutate:async(...args)=>{calls.push(args);if(args[4])args[4]({id:'upload-1'});return true;}})},
    './common':common,'./Documents':{DocumentActions:()=>null},'./Subledgers':{ControlledActions:()=>null},'./evidenceDownload':{downloadExpenseEvidence:async()=>{}},
  },{FormData:FormDataFixture,File:FileFixture,FileReader:ReaderFixture});
  return {ui,FileFixture};
}
test('expense evidence uploads private file content then binds only the returned upload identity',async()=>{
  const calls=[];let {ui,FileFixture}=evidenceForTest({calls});
  await submit(ui.Attachments({expenseId:'expense-1'}),{file:new FileFixture()});
  assert.equal(calls[0][0],'evidence/uploads');
  assert.deepEqual(plain(calls[0][1]),{filename:'evidence.pdf',mimeType:'application/pdf',contentBase64:'JVBERi0xLjQ='});
  ({ui}=evidenceForTest({calls,states:[{id:'upload-1',filename:'evidence.pdf',malwareScan:'not_performed'},'',false]}));
  const element=ui.Attachments({expenseId:'expense-1'});
  const bind=findElement(element,el=>el.type==='button'&&el.props.children==='Bind uploaded evidence to this expense');
  await bind.props.onClick();
  assert.deepEqual(plain(calls.at(-1)),['expenses/expense-1/attachments',{uploadId:'upload-1'}]);
  await assert.rejects(ui.evidenceFile({size:6*1024*1024,type:'application/pdf'}),/5 MiB/);
});
test('expense refund requests reference original payments; receipt actions cannot redirect the destination',async()=>{
  const calls=[],{ui}=evidenceForTest({calls});
  await submit(ui.RefundForm({expenseId:'expense-1',payments:[{id:'payment-1',amount:'50.00',method:'card'}],status:'paid',refresh(){}}),{paymentId:'payment-1',date:'2099-01-01',amount:'12.50',reason:'Supplier returned charge'});
  assert.deepEqual(plain(calls[0]),['expenses/expense-1/refunds',{paymentId:'payment-1',date:'2099-01-01',amount:'12.50',reason:'Supplier returned charge'}]);
  const controlled=subledgersForTest({calls,states:['receive']});
  await submit(controlled.ControlledActions({row:{id:'refund-1',status:'approved',version:3,created_by:7},kind:'refund',refresh(){}}),{reference:'REFUND-001',reason:'Actual bank receipt',method:'cash',accountId:999,date:'2099-02-01'});
  assert.deepEqual(plain(calls.at(-1)),['expense-refunds/refund-1/receive',{expectedVersion:3,reason:'Actual bank receipt',reference:'REFUND-001'}]);
});
test('operational journal drill-down uses posted-journals local UUIDs and preserves names/source documents without actions',()=>{
  const calls=[],posted=compile('app/pharmacy/accounting/components/PostedJournal.tsx',{
    'react/jsx-runtime':jsx,'next/link':nextLink,'../../../../lib/pharmacyAccounting':lib,'./common':common,
    './api':{useResource:endpoint=>{calls.push(endpoint);return {loading:false,error:'',refresh(){},data:{id:'operational-uuid',kind:'sale',source_ref:'original-sale',status:'posted',immutable:true,business_unit:'pharmacy',sharedEntryId:42,lines:[{id:1,account:'receivable:1',account_code:'receivable:1',account_name:'Actual receivable account',source_document:'original-line-document',debit:20,credit:0}]}};}},
  });
  const html=renderToStaticMarkup(posted.default({id:'operational-uuid'}));
  assert.equal(calls[0],'posted-journals/operational-uuid');assert.match(html,/Actual receivable account/);assert.match(html,/original-line-document/);
  assert.match(html,/Shared general-ledger entry: 42/);assert.doesNotMatch(html,/<button|<form|Confirm post|Save draft/);
});
test('reconciliation readiness enumerates real unmatched sources, balance mismatches and independent-finalizer blocker',()=>{
  const data={statement:{created_by:7,opening_balance:'10.00',closing_balance:'20.00'},items:[{id:'bank-1',reference:'BANK-001',journal_line_id:null}],ledgerLines:[{id:22}]};
  const blockers=lib.reconciliationBlockers(data,{openingBalance:'11.00',closingBalance:'21.00'},7);
  assert.ok(blockers.some(b=>b.includes('importer')));assert.ok(blockers.some(b=>b.includes('BANK-001')));
  assert.ok(blockers.some(b=>b.includes('22')));assert.ok(blockers.some(b=>b.includes('Opening balance mismatch')));assert.ok(blockers.some(b=>b.includes('Closing balance mismatch')));
  const ready={...data,items:[{id:'bank-1',journal_line_id:22}]};
  assert.deepEqual(plain(lib.reconciliationBlockers(ready,{openingBalance:'10.00',closingBalance:'20.00'},9)),[]);
});
test('canonical settings validation mirrors core controls without creating or replacing explicit mappings',()=>{
  const collections=[{id:1,account_type:'cash'},{id:2,account_type:'bank'},{id:3,account_type:'mobile_money'}];
  assert.equal(configurationLib.requiredMappingCategories.length,17);
  assert.equal(configurationLib.canonicalControl('receivable:patient-1'),'acc-1002');
  assert.equal(configurationLib.canonicalControl('payable:supplier-1'),'acc-2000');
  assert.equal(configurationLib.canonicalControl('collection:1',collections),'acc-1000');
  assert.equal(configurationLib.canonicalControl('collection:2',collections),'acc-1001');
  assert.equal(configurationLib.canonicalControl('collection:3',collections),'acc-1001');
  assert.equal(configurationLib.canonicalControl('liability:output-tax'),undefined);
  const mappings={'receivable:patient-1':'wrong-control','collection:1':'wrong-cash',sales:'approved-sales'};
  const original=JSON.stringify(mappings),issues=configurationLib.configurationIssues(true,mappings,collections);
  assert.ok(issues.some(issue=>issue.includes('acc-1002')));assert.ok(issues.some(issue=>issue.includes('acc-1000')));
  assert.ok(issues.some(issue=>issue.includes('quarantine_inventory')));
  assert.equal(JSON.stringify(mappings),original,'validation never populates or rewrites selected accounts');
  assert.deepEqual(plain(configurationLib.configurationIssues(false,mappings,collections)),[]);
});
const inventoryFixture={
  asOf:'2026-11-02T12:00:00.000Z',branchid:4,
  rows:Array.from({length:30},(_,i)=>({itemId:`medicine-${i+1}`,name:`Medicine ${i+1}`,sku:`SKU-${i+1}`,quantity:3,unitCost:30,value:90})),
  stockValue:2700,inventoryControl:2600,difference:100,balanced:false,
  controls:[{account:'inventory',balance:2600},{account:'quarantine_inventory',balance:45},{account:'stock_in_transit',balance:10}],
  policy:'Current weighted-average valuation; quarantined/transit/returns assets remain separate.',
  correctionPolicy:'Investigate source evidence; approved stock or financial adjustment only.',
};
test('inventory reconciliation adapter rejects missing or contradictory balances rather than fabricating a balanced state',()=>{
  const snapshot=lib.decodeInventoryControl(inventoryFixture);
  assert.equal(snapshot.difference,100);assert.equal(snapshot.rows.length,30);
  assert.throws(()=>lib.decodeInventoryControl({...inventoryFixture,stockValue:undefined}),/invalid financial value/);
  assert.throws(()=>lib.decodeInventoryControl({...inventoryFixture,balanced:true}),/non-zero difference/);
  assert.throws(()=>lib.decodeInventoryControl({...inventoryFixture,difference:0,balanced:true}),/inconsistent/);
  assert.throws(()=>lib.decodeInventoryControl({rows:[]}),/incomplete/);
});
test('inventory control UI uses current-only reconciliation, exposes differences and separate assets, and exports all snapshot rows',async()=>{
  const requests=[],exports=[];
  const inventory=compile('app/pharmacy/accounting/components/InventoryAccounting.tsx',{
    'react/jsx-runtime':jsx,'next/link':nextLink,react:hooks,'./common':common,'./Registers':{Register:()=>null},
    './api':{useResource:endpoint=>{requests.push(endpoint);return {data:lib.decodeInventoryControl(inventoryFixture),loading:false,error:'',refresh(){}};}},
    './exports':{downloadAccountingExport:async(...args)=>{exports.push(args);}},
  });
  const element=inventory.InventoryReconciliation(),html=renderToStaticMarkup(element);
  assert.equal(requests[0],'inventory/reconciliation');
  assert.match(html,/Current-only/);assert.match(html,/Inventory is not reconciled/);assert.match(html,/by GH₵100.00/);
  assert.match(html,/quarantine_inventory/);assert.match(html,/stock_in_transit/);assert.match(html,/2026-11-02T12:00:00.000Z/);
  assert.doesNotMatch(html,/<input[^>]*type="date"|balance.*automatically/);
  const excel=findElement(element,el=>el.type==='button'&&el.props.children==='Excel · full current snapshot');
  await excel.props.onClick();
  assert.equal(exports[0][2].rows.length,30,'export includes all medicines, not just the first 25 displayed');
  assert.equal(exports[0][2].metadata.totals.difference,100);
  assert.equal(exports[0][2].metadata.totals['Control quarantine_inventory'],45);
  assert.match(exports[0][3],/Current-only snapshot/);assert.match(exports[0][3],/reconciled false/);
});
test('inventory reconciliation and branch-scoped posted-journal errors show no stale success or financial rows',()=>{
  const error='Posted pharmacy journal not found in this branch';
  const posted=compile('app/pharmacy/accounting/components/PostedJournal.tsx',{
    'react/jsx-runtime':jsx,'next/link':nextLink,'../../../../lib/pharmacyAccounting':lib,'./common':common,
    './api':{useResource:()=>({data:null,loading:false,error,refresh(){}})},
  });
  const journalHtml=renderToStaticMarkup(posted.default({id:'foreign-branch-id'}));
  assert.match(journalHtml,/role="alert"/);assert.match(journalHtml,/not found in this branch/);assert.doesNotMatch(journalHtml,/<table|Shared general-ledger entry:|<form/);
  const inventory=compile('app/pharmacy/accounting/components/InventoryAccounting.tsx',{
    'react/jsx-runtime':jsx,'next/link':nextLink,react:hooks,'./common':common,'./Registers':{Register:()=>null},
    './api':{useResource:()=>({data:null,loading:false,error:'Inventory control snapshot unavailable',refresh(){}})},'./exports':{},
  });
  const html=renderToStaticMarkup(inventory.InventoryReconciliation());
  assert.match(html,/Inventory control snapshot unavailable/);assert.doesNotMatch(html,/alert-success|<table|<strong>0/);
});
function compatibilityModule({finance=true,calls=[],effects=[],mode='loading',scopeOverride}={}){
  const user={role:finance?'pharmacy_accountant':'pharmacy_cashier',employeeid:7,branch:1};
  const scope=JSON.stringify([undefined,undefined,1,7,user.role]);let stateIndex=0;
  return compile('app/pharmacy/components/LinkedAccountingCompatibility.tsx',{
    'react/jsx-runtime':jsx,'next/link':nextLink,
    react:{useEffect:effect=>effects.push(effect),useState:initial=>[stateIndex++===1?{scope:scopeOverride??scope,mode,error:''}:initial,()=>{}]},
    '../../../components/Auth/customFetch':{customFetch:async endpoint=>{calls.push(endpoint);return {success:true,data:{enabled:true,effective_date:'2026-11-02',mappings:{}}};}},
    '../../../lib/pharmacyAccounting':lib,'./PharmacyWorkspace':{usePharmacyAccess:()=>({finance,app:{user}})},
  });
}
test('legacy compatibility queries protected settings only for finance roles and never reuses a previous branch policy',async()=>{
  let calls=[],effects=[],compatibility=compatibilityModule({finance:false,calls,effects});
  assert.equal(compatibility.useLinkedAccounting().mode,'not-finance');
  effects[0]();await Promise.resolve();assert.equal(calls.length,0);
  calls=[];effects=[];compatibility=compatibilityModule({calls,effects,mode:'enabled'});
  assert.equal(compatibility.useLinkedAccounting().mode,'enabled');
  effects[0]();await Promise.resolve();assert.deepEqual(calls,['pharmacy/accounting/settings']);
  const changed=compatibilityModule({mode:'legacy',scopeOverride:'previous-branch'});
  assert.equal(changed.useLinkedAccounting().mode,'loading');
  for(const endpoint of ['pharmacy/management/journals','pharmacy/management/expenses','pharmacy/management/supplier-payments'])assert.equal(compatibility.isLegacyAccountingPost(endpoint),true);
  assert.equal(compatibility.isLegacyAccountingPost('pharmacy/credit/invoices/1/payment'),false);
  assert.equal(compatibility.isLegacyAccountingPost('pharmacy/management/close-day'),false);
});
function legacyFinancePage({mode='enabled',tab='payments',calls=[]}={}){
  const compatibility=compatibilityModule();
  return compile('app/pharmacy/finance/page.tsx',{
    '../accounting/components/common':common,
    'react/jsx-runtime':jsx,'next/link':nextLink,
    react:{useState:initial=>[initial==='overview'?tab:initial,()=>{}],useEffect(){}},
    '../../../components/Auth/customFetch':{customFetchMutation:async(...args)=>{calls.push(args);return {success:true,data:{}};}},
    '../components/ShiftHandoverForm':{__esModule:true,default:()=>null},
    '../components/PharmacyPaymentFields':{usePharmacyDocument:()=>({pending:null,execute:async(...args)=>{calls.push(args);return {success:true,data:{}};}})},
    '../components/LinkedAccountingCompatibility':{...compatibility,useLinkedAccounting:()=>({mode,error:'Settings unavailable',refresh(){}})},
    '../components/PharmacyWorkspace':{
      styles:{},money:value=>String(value),dateLabel:value=>String(value),
      usePharmacyAccess:()=>({finance:true,manager:true,app:{user:{employeeid:7}}}),
      usePharmacyResource:endpoint=>({data:endpoint.endsWith('reports')?{days:[{status:'open'}],documents:[],shifts:[]}:endpoint.endsWith('suppliers')?[]:{day:{status:'open'},accounts:[],financialDate:'2026-11-02'},loading:false,error:'',refresh:async()=>{}}),
      Message:common.Feedback,Empty:({children})=>React.createElement('p',null,children),Tabs:()=>null,Modal:()=>null,
      FinancialDayPanel:()=>React.createElement('p',null,'Financial-day and shift controls remain available'),
    },
  },{FormData:FormDataFixture});
}
test('enabled/unverified legacy finance forms are disabled before filling and link to real controlled workflows',async()=>{
  for(const mode of ['enabled','loading','unavailable']){
    const calls=[],page=legacyFinancePage({mode,calls}),element=page.default();
    const form=findElement(element,el=>el.type==='form');
    assert.equal(findElement(form,el=>el.type==='fieldset').props.disabled,true);
    await submit(form,{amount:'10.00',description:'Must not post legacy'});
    assert.equal(calls.length,0,'programmatic/stale submission cannot reach legacy mutations');
    const html=renderToStaticMarkup(element);
    assert.ok(html.includes('href="/pharmacy/accounting"'));
    assert.match(html,/Financial-day and shift controls remain available/);
    const journals=legacyFinancePage({mode,tab:'journals'}).default();
    assert.equal(findElement(journals,el=>el.type==='button'&&el.props.children==='New journal').props.disabled,true);
  }
});
test('confirmed disabled accounting preserves legacy expense posting and journal access',async()=>{
  const calls=[],page=legacyFinancePage({mode:'legacy',calls}),element=page.default();
  const form=findElement(element,el=>el.type==='form');
  assert.equal(findElement(form,el=>el.type==='fieldset').props.disabled,false);
  await submit(form,{amount:'10.00',description:'Existing disabled-mode expense',reset(){}});
  assert.equal(calls[0][0],'pharmacy/management/expenses');
  const journals=legacyFinancePage({mode:'legacy',tab:'journals'}).default();
  assert.equal(findElement(journals,el=>el.type==='button'&&el.props.children==='New journal').props.disabled,false);
});
test('Accounts retains customer invoice collection and credit controls when linked accounting is enabled',()=>{
  const compatibility=compatibilityModule();
  const accounts=compile('app/pharmacy/accounts/page.tsx',{
    '../accounting/components/common':common,
    'react/jsx-runtime':jsx,react:hooks,'../../../components/Auth/customFetch':{},
    '../components/LinkedAccountingCompatibility':{...compatibility,useLinkedAccounting:()=>({mode:'enabled',error:'',refresh(){}})},
    '../components/PharmacyPaymentFields':{usePharmacyDocument:()=>({pending:null})},
    '../../../lib/pharmacy/receipt':{},
    '../components/PharmacyWorkspace':{
      styles:{},money:value=>String(value),dateLabel:value=>String(value),
      usePharmacyAccess:()=>({finance:true,manager:true}),
      usePharmacyResource:()=>({data:[{id:1,firstname:'Test',lastname:'Customer',patient_id:'P1',credit_limit:100,outstanding:10,is_active:true}],loading:false,error:'',refresh(){}}),
      Message:common.Feedback,Empty:()=>null,Modal:()=>null,
    },
  });
  const html=renderToStaticMarkup(accounts.default());
  assert.match(html,/Invoices \/ collect/);assert.match(html,/Approve credit account/);assert.match(html,/Limit \/ access/);
  assert.match(html,/Linked Pharmacy Accounting is enabled/);
});
test('AP and AR source-specific reversal requests preserve date/reason without mutating original amounts',async()=>{
  for(const [kind,status,source] of [['settlement','paid','payables/settlements'],['adjustment','posted','receivables/adjustments']]){
    const calls=[],ui=subledgersForTest({calls});
    const element=ui.ReversalRequest({row:{id:'original-1',status},kind,refresh(){}});
    await submit(element,{date:'2099-02-02',reason:'Original source correction reviewed'});
    assert.deepEqual(plain(calls[0]),[`${source}/original-1/reversals`,{date:'2099-02-02',reason:'Original source correction reviewed'}]);
    assert.equal(ui.ReversalRequest({row:{id:'draft-1',status:'draft'},kind,refresh(){}}),null);
  }
});
test('reversal submit/approve/post/void actions are versioned and AP return posting explicitly attests restored funds',async()=>{
  for(const kind of ['settlement','adjustment']){
    const endpoint=kind==='settlement'?'payables/settlement-reversals':'receivables/adjustment-reversals';
    for(const action of ['submit','approve','post','void']){
      const calls=[],ui=subledgersForTest({calls,states:[action]});
      const row={id:'reviewed-reversal',version:3,status:action==='approve'?'submitted':action==='post'?'approved':'draft',created_by:1,submitted_by:2,details:{originalJournalId:'original-local-journal',payment:{method:'card',accountId:7}}};
      const element=ui.ReversalActions({row,kind,refresh(){}});
      await submit(element,{reason:'Reviewed correction',confirmedReceived:'on',reference:'RETURN-BANK-12'});
      const body={expectedVersion:3,reason:'Reviewed correction'};
      if(kind==='settlement'&&action==='post')Object.assign(body,{confirmedReceived:true,reference:'RETURN-BANK-12'});
      assert.deepEqual(plain(calls[0]),[`${endpoint}/reviewed-reversal/${action}`,body]);
      assert.match(renderToStaticMarkup(element),/original-local-journal/);
      if(kind==='settlement'&&action==='post'){
        assert.equal(findElement(element,node=>node.props?.name==='confirmedReceived').props.required,true);
        assert.equal(findElement(element,node=>node.props?.name==='reference').props.required,true);
      }
    }
    const own=subledgersForTest({actor:1});
    const html=renderToStaticMarkup(own.ReversalActions({row:{id:'self-created',status:'submitted',version:2,created_by:1,submitted_by:2},kind,refresh(){}}));
    assert.doesNotMatch(html,/>approve</);
  }
});
test('taxed AR credit policy is selected explicitly; writeoffs never include tax relief even with injected form values',async()=>{
  for(const kind of ['credit','writeoff']){
    const calls=[],ui=subledgersForTest({calls,states:[kind]});
    const element=ui.AdjustmentForm({invoices:[{id:'sale-1',outstanding_amount:50}],accounts:accountsFixture,refresh(){}});
    const policy=findElement(element,node=>node.props?.name==='taxPolicy');
    if(kind==='credit'){assert.ok(policy);assert.equal(policy.props.defaultValue,'');}else assert.equal(policy,undefined);
    await submit(element,{saleId:'sale-1',date:'2099-02-02',amount:'10.00',account:'sales_returns',reason:'Gross credit',taxPolicy:'original_gross_proportional_v1'});
    assert.equal(calls[0][1].taxPolicy,kind==='credit'?'original_gross_proportional_v1':undefined);
  }
});
test('tax-credit register renders signed original lineage and exports all filtered rows, not just displayed page',async()=>{
  const calls=[],exported=[],requests=[],filters={from:'2099-01-01',to:'2099-02-01',saleId:'sale-1',sourceCreditId:'credit-1'};
  const items=[{id:'allocation-1',source_credit_id:'credit-1',event_type:'credit',rate:15,local_account:'liability:vat',gross_amount:10,net_amount:8.7,tax_amount:1.3},{id:'allocation-2',source_credit_id:'credit-1',event_type:'reversal',reversal_of_adjustment_id:'allocation-1',gross_amount:-10,net_amount:-8.7,tax_amount:-1.3}];
  let stateIndex=0;
  const registers=compile('app/pharmacy/accounting/components/Registers.tsx',{
    'react/jsx-runtime':jsx,'next/link':nextLink,react:{useState:initial=>[stateIndex++===0?filters:typeof initial==='function'?initial():initial,()=>{}]},
    '../../../../lib/pharmacyAccounting':lib,'./common':common,
    './api':{useResource:endpoint=>{requests.push(endpoint);return{data:{items,totals:{count:2,gross:0,net:0,tax:0},policy:'original_gross_proportional_v1'},loading:false,error:'',refresh(){}};}},
    './exports':{fullFilteredExport:async(...args)=>{calls.push(args);return {rows:items,metadata:{}};},downloadAccountingExport:async(...args)=>exported.push(args)},
  });
  const element=registers.Register({endpoint:'tax-credits'}),html=renderToStaticMarkup(element);
  assert.match(html,/<table/);assert.match(html,/-GH₵1.30/);assert.match(html,/allocation-1/);assert.match(html,/original_gross_proportional_v1/);
  const params=new URLSearchParams(requests[0].split('?')[1]);
  for(const [key,value]of Object.entries(filters))assert.equal(params.get(key),value);
  for(const prefix of ['Excel','PDF']){
    const button=findElement(element,node=>node.type==='button'&&typeof node.props.children==='string'&&node.props.children.startsWith(prefix));
    await button.props.onClick();
  }
  assert.equal(calls.length,2);
  assert.equal(calls[0][0],'tax-credits');assert.deepEqual(plain(calls[0][1]),filters);
  assert.equal(exported[0][0],'xlsx');assert.equal(exported[1][0],'pdf');assert.equal(exported[0][2].rows.length,2);
});
function consolidationForTest({orphan=0,linkedMismatch=false,globalMismatch=0,fullyChecked=true,batchSize=2,truncated=true,rangeMismatch=false,calls=[],refreshes=[],requests=[],noRange=false}={}){
  const range={from:'2099-01-01',to:'2099-02-01'};
  const pending={...range,reviewLimit:100,items:Array.from({length:batchSize},(_,i)=>({id:`reviewed-source-${i+1}`})),truncated,unlinked:truncated?201:batchSize};
  if(rangeMismatch)pending.from='2098-01-01';
  const reconciliation={...range,reviewLimit:100,fullyChecked,linkedMismatchCount:globalMismatch||Number(linkedMismatch),rowsTruncated:true,balanced:false,unlinked:batchSize,unlinkedShared:orphan,orphanSharedEntriesTruncated:orphan>100,orphanSharedEntries:orphan?[{id:91,source_ref:'extra-shared-source'}]:[],rows:[...pending.items.map(row=>({journal_id:row.id,shared_entry_id:null})),...(linkedMismatch?[{journal_id:'linked-source',shared_entry_id:90,debitDifference:5,creditDifference:0}]:[])]};
  return compile('app/pharmacy/accounting/components/Configuration.tsx',{
    'react/jsx-runtime':jsx,react:{useState:()=>[noRange?{from:'',to:''}:range,()=>{}]},
    '../../../../lib/pharmacyAccounting':lib,'../../../../lib/pharmacyAccountingConfiguration':configurationLib,'./common':common,
    './api':{useResource:(endpoint,external,enabled)=>{requests.push({endpoint,enabled});return {data:enabled?(endpoint.startsWith('consolidation/reconciliation')?reconciliation:pending):null,loading:false,error:'',refresh:async()=>refreshes.push(endpoint)};},useMutation:()=>({pending:false,mutate:async(...args)=>{calls.push(args);return true;}})},
  },{FormData:FormDataFixture});
}
test('consolidation submits only loaded reviewed source IDs, permits expected unlinked differences, and reloads remaining batch',async()=>{
  const calls=[],refreshes=[],ui=consolidationForTest({calls,refreshes}),element=ui.Consolidation({enabled:true});
  const form=findElement(element,node=>node.type==='form'&&findElement(node,child=>child.props?.name==='confirmed'));
  assert.equal(findElement(form,node=>node.type==='fieldset').props.disabled,false);
  assert.match(renderToStaticMarkup(element),/bounded review batch/);
  assert.match(renderToStaticMarkup(element),/at most 100 journals/);
  assert.match(renderToStaticMarkup(element),/full selected date range/);
  assert.match(renderToStaticMarkup(element),/not every scanned journal/);
  await submit(form,{confirmed:'on',reason:'Reviewed first bounded source batch'});
  assert.deepEqual(plain(calls[0]),['consolidation',{from:'2099-01-01',to:'2099-02-01',journalIds:['reviewed-source-1','reviewed-source-2'],confirmed:true,reason:'Reviewed first bounded source batch'}]);
  assert.equal(refreshes.length,2);assert.ok(refreshes.every(endpoint=>endpoint.includes('from=2099-01-01')));
});
test('orphan shared entries, linked differences or stale reviewed ranges block consolidation before mutation',async()=>{
  for(const options of [{orphan:1},{orphan:101},{linkedMismatch:true},{globalMismatch:1},{fullyChecked:false},{fullyChecked:undefined,globalMismatch:2},{batchSize:101},{rangeMismatch:true}]){
    const calls=[],ui=consolidationForTest({...options,calls}),element=ui.Consolidation({enabled:true});
    const form=findElement(element,node=>node.type==='form'&&findElement(node,child=>child.props?.name==='confirmed'));
    assert.equal(findElement(form,node=>node.type==='fieldset').props.disabled,true);
    await submit(form,{confirmed:'on',reason:'Must not bypass review'});
    assert.equal(calls.length,0);
    if(options.orphan)assert.match(renderToStaticMarkup(element),/extra-shared-source/);
  }
});
test('opening Settings does not request full-history consolidation and never invents scan success',()=>{
  const requests=[],element=consolidationForTest({requests,noRange:true}).Consolidation({enabled:true});
  assert.equal(requests.length,2);
  assert.ok(requests.every(request=>request.enabled===false));
  const html=renderToStaticMarkup(element);
  assert.match(html,/No full-history scan runs automatically/);
  assert.doesNotMatch(html,/Source integrity was scanned/);
  const form=findElement(element,node=>node.type==='form'&&findElement(node,child=>child.props?.name==='confirmed'));
  assert.equal(findElement(form,node=>node.type==='fieldset').props.disabled,true);
});
test('disabled accounting resource makes no transport request, including an explicit refresh',async()=>{
  const calls=[],effects=[];
  const api=compile('app/pharmacy/accounting/components/api.ts',{
    react:{useState:initial=>[initial,()=>{}],useRef:()=>({current:0}),useCallback:callback=>callback,useEffect:callback=>effects.push(callback)},
    '../../../../components/Auth/customFetch':{customFetch:async endpoint=>{calls.push(endpoint);return {success:true,data:{}};}},
    '../../../../lib/pharmacyAccounting':lib,'../../../../lib/pharmacyTax':taxLib,
  });
  const resource=api.useResource('consolidation/reconciliation?',false,false);
  effects[0]();await resource.refresh();assert.deepEqual(calls,[]);assert.equal(resource.loading,false);assert.equal(resource.data,null);
});
function allocationUi(calls=[],states,resource=()=>({data:null,loading:false,error:'',refresh(){}})){
  let index=0;
  return compile('app/pharmacy/accounting/components/SupplierAllocations.tsx',{
    'react/jsx-runtime':jsx,react:states?{useState:initial=>[states[index++]??initial,()=>{}]}:hooks,
    '../../../../lib/pharmacyAccounting':lib,'./common':common,'./SupplierPicker':{__esModule:true,default:()=>null},'./Registers':{Register:()=>null},
    './api':{useResource:resource,useMutation:()=>({pending:false,mutate:async(...args)=>{calls.push(args);return true;}})},
  },{FormData:FormDataFixture});
}
test('original AP sources are explicitly reviewed and registered by exact producer identity, never reposted',async()=>{
  const calls=[],ui=allocationUi(calls),row={sourceKind:'credit_note',sourceRef:'full-original-credit-uuid',amount:'20.00'};
  const element=ui.SourceRegistration({row,refresh(){}});
  await submit(element,{});assert.equal(calls.length,0);
  await submit(element,{confirmed:'on'});
  assert.deepEqual(plain(calls),[['payables/allocation-sources',{sourceKind:'credit_note',sourceRef:'full-original-credit-uuid'}]]);
});
test('supplier applications preserve exact source/bill IDs and enforce positive cents, supplier, distinctness and original availability',async()=>{
  const source={id:'exact-source-uuid',supplierId:'supplier-1',status:'available',availableAmount:'40.01'},bill={id:'exact-bill-uuid',supplier_id:'supplier-1',outstanding_amount:'50.00'};
  const lines=[{billId:bill.id,amount:'40.01'}],calls=[],ui=allocationUi(calls,[source.id,lines,'']);
  assert.equal(ui.supplierAllocationError(lines,source,[bill]),'');
  for(const bad of [[{billId:bill.id,amount:'40.02'}],[{billId:bill.id,amount:'0'}],[{billId:bill.id,amount:'1.001'}],[{billId:'other-bill',amount:'1'}],[...lines,...lines]]){
    assert.ok(ui.supplierAllocationError(bad,source,[bill]));
  }
  assert.ok(ui.supplierAllocationError(lines,source,[{...bill,supplier_id:'other-supplier'}]));
  await submit(ui.AllocationForm({sources:[source],bills:[bill],date:'2099-01-03',refresh(){}}),{reason:'Reviewed original allocation'});
  assert.deepEqual(plain(calls),[['payables/allocations',{sourceId:source.id,date:'2099-01-03',reason:'Reviewed original allocation',allocations:lines}]]);
});
test('allocation releases and voided-release replacements retain original application and predecessor version only',async()=>{
  const calls=[],ui=allocationUi(calls),refresh=()=>{};
  await submit(ui.AllocationRelease({row:{id:'original-application',status:'posted'},refresh}),{date:'2099-01-04',reason:'Release exact original uses'});
  await submit(ui.AllocationRelease({row:{id:'voided-release',status:'voided',version:4,reversal_of:'original-application'},replacement:true,refresh}),{date:'2099-01-05',reason:'Replace latest voided release'});
  assert.deepEqual(plain(calls),[
    ['payables/allocations/original-application/reversals',{date:'2099-01-04',reason:'Release exact original uses'}],
    ['payables/allocations/original-application/reversals',{date:'2099-01-05',reason:'Replace latest voided release',replacesIntentId:'voided-release',expectedVersion:4}],
  ]);
  assert.equal(ui.AllocationRelease({row:{id:'draft',status:'draft'},refresh}),null);
});
test('allocation review retrieves exact posted signed source uses and current version; errors never become empty evidence',()=>{
  const requests=[],versions=[],data={id:'exact-release',status:'posted',version:9,details:{sourceId:'original-source'},sourceUses:[{id:'negative-use-exact',source_id:'original-source',bill_id:'original-bill',allocation_id:'negative-allocation',amount:'-20.00',reversal_of_use_id:'positive-use-exact'}],audit:[],reversals:[]};
  const ui=allocationUi([],undefined,endpoint=>{requests.push(endpoint);return {data,loading:false,error:'',refresh(){}};});
  const element=ui.AllocationReview({row:{id:'exact-release',version:1},kind:'release',refresh(){},actions:row=>{versions.push(row.version);return null;}});
  const html=renderToStaticMarkup(element);
  assert.deepEqual(requests,['payables/allocation-reversals/exact-release']);assert.deepEqual(versions,[9]);
  assert.match(html,/negative-use-exact/);assert.match(html,/positive-use-exact/);assert.match(html,/20\.00/);
  const failed=allocationUi([],undefined,()=>({data:null,loading:false,error:'Source evidence unavailable',refresh(){}}));
  const errorHtml=renderToStaticMarkup(failed.AllocationReview({row:{id:'exact-release'},kind:'release',refresh(){},actions(){assert.fail('No action against missing evidence');}}));
  assert.match(errorHtml,/Source evidence unavailable/);assert.doesNotMatch(errorHtml,/No records returned|<form|<table/);
});
test('AP application/release registers offer real server status filters, not unsupported date filters, and retain filtered export scope',async()=>{
  for(const endpoint of ['payables/allocations','payables/allocation-reversals']){
    const requests=[],exports=[];let state=0;
    const ui=compile('app/pharmacy/accounting/components/Registers.tsx',{
      'react/jsx-runtime':jsx,'next/link':nextLink,'../../../../lib/pharmacyAccounting':lib,'./common':common,
      react:{useState:initial=>{state++;const value=typeof initial==='function'?initial():initial;return [state<=2?{...value,status:'submitted'}:value,()=>{}];}},
      './api':{useResource:path=>{requests.push(path);return {data:{items:[],limit:25,offset:0},loading:false,error:'',refresh(){}};}},
      './exports':{fullFilteredExport:async(...args)=>{exports.push(args);return {rows:[],metadata:{}};},downloadAccountingExport:async()=>{}},
    });
    const element=ui.Register({endpoint}),html=renderToStaticMarkup(element);
    assert.ok(requests[0].includes('status=submitted'));assert.match(html,/Status/);assert.doesNotMatch(html,/type="date"/);
    const excel=findElement(element,node=>node.type==='button'&&React.Children.toArray(node.props.children).join('').startsWith('Excel'));
    await excel.props.onClick();
    assert.equal(exports[0][0],endpoint);assert.equal(exports[0][1].status,'submitted');
  }
});
test('voided AP/AR reversal replacements create new audited intents with exact predecessor version and no editable money fields',async()=>{
  for(const [kind,path]of [['settlement','payables/settlement-reversals'],['adjustment','receivables/adjustment-reversals']]){
    const calls=[],ui=compile('app/pharmacy/accounting/components/Subledgers.tsx',{
      'react/jsx-runtime':jsx,react:hooks,'next/link':nextLink,'../../../../lib/pharmacyAccounting':lib,'./common':common,'./Configuration':{},'./Registers':{},'./exports':{},
      '../../components/PharmacyWorkspace':{usePharmacyAccess:()=>({finance:true})},'./api':{useMutation:()=>({pending:false,mutate:async(...args)=>{calls.push(args);return true;}})},
    },{FormData:FormDataFixture});
    const element=ui.ReversalReplacement({row:{id:'exact-voided-uuid',status:'voided',version:5},kind,refresh(){}});
    await submit(element,{date:'2099-01-06',reason:'Audited replacement',amount:'999',accountId:'forbidden'});
    assert.deepEqual(plain(calls),[[`${path}/exact-voided-uuid/replacements`,{date:'2099-01-06',reason:'Audited replacement',expectedVersion:5}]]);
    assert.equal(ui.ReversalReplacement({row:{id:'active',status:'submitted',version:2},kind,refresh(){}}),null);
  }
});
test('accounting reference/date presentation is concise, kind-aware and never rewrites identifiers',()=>{
  const journal='266a7e7d-5e3b-4d61-9a7a-f4a82ade9174',sale='f262eb76-53c6-40b5-911b-f8043b7174ef';
  assert.equal(lib.accountingReference(journal,'journal_id'),'JRN-266A7E7D');
  assert.equal(lib.accountingReference(sale,'source_document','sale'),'PHM-F262EB76');
  assert.equal(lib.accountingReference(sale,'source_document','expense'),'EXP-F262EB76');
  assert.equal(lib.accountingReference(`Pharmacy receipt PHM-${sale}`,'description','sale'),'Pharmacy receipt PHM-F262EB76');
  assert.equal(lib.accountingReference('PHM-2026-001','receipt_number'),'PHM-2026-001');
  assert.equal(lib.accountingDateLabel('2026-11-02T00:00:00.000Z'),'2026-11-02');
  assert.equal(lib.accountingAmount('1234.5'),'1,234.50');
  assert.equal(lib.accountingAmount(null),'—');
  const html=renderToStaticMarkup(React.createElement(common.ReferenceText,{value:journal,field:'journal_id'}));
  assert.match(html,/>JRN-266A7E7D</);assert.ok(html.includes(`title="${journal}"`));assert.ok(html.includes(`full reference: ${journal}`));assert.match(html,/tabindex="0"/);
});
test('ledger uses professional explicit columns and short visible references while drill-down and Excel/PDF audit IDs stay exact',async()=>{
  const journal='266a7e7d-5e3b-4d61-9a7a-f4a82ade9174',sale='f262eb76-53c6-40b5-911b-f8043b7174ef';
  const row={id:'internal-ledger-row-id',journal_id:journal,date:'2026-11-02T00:00:00.000Z',reference:journal,kind:'sale',description:`Pharmacy receipt PHM-${sale}`,account:'acc-1000',account_name:'Cash on hand',source_document:sale,business_unit:'pharmacy',branchid:2,debit:1234.5,credit:0,running_balance:1234.5,signed_running_balance:1234.5,posting_created_at:'2026-11-02T17:00:00.000Z'};
  const before=JSON.stringify(row),exports=[],fullCalls=[];
  const registers=compile('app/pharmacy/accounting/components/Registers.tsx',{
    'react/jsx-runtime':jsx,'next/link':nextLink,react:hooks,'../../../../lib/pharmacyAccounting':lib,'./common':common,
    './api':{useResource:()=>({data:{rows:[row],total:1,columns:Object.keys(row)},loading:false,error:'',refresh(){}})},
    './exports':{fullFilteredExport:async(...args)=>{fullCalls.push(args);return {rows:[row],metadata:{}};},downloadAccountingExport:async(...args)=>exports.push(args)},
  });
  const element=registers.Register({endpoint:'ledger',ledger:true}),html=renderToStaticMarkup(element);
  const headers=[...html.matchAll(/<th scope="col"[^>]*>(.*?)<\/th>/g)].map(match=>match[1]);
  assert.deepEqual(headers,['Date','Journal ref','Account','Description','Source document','Debit','Credit','Running balance','Actions']);
  const visible=html.replace(/<[^>]*>/g,'');
  assert.ok(visible.includes('JRN-266A7E7D'));assert.ok(visible.includes('PHM-F262EB76'));assert.ok(visible.includes('Cash on hand'));assert.ok(visible.includes('1,234.50'));
  assert.ok(!visible.includes(journal));assert.ok(!visible.includes(sale));assert.ok(!visible.includes('T00:00:00'));assert.ok(!visible.includes('internal-ledger-row-id'));assert.ok(!visible.includes('signed running balance'));
  assert.ok(html.includes(`/pharmacy/accounting/general-ledger/journals/${journal}`));assert.ok(html.includes(`title="${sale}"`));assert.ok(html.includes(`title="Pharmacy receipt PHM-${sale}"`));
  for(const prefix of ['Excel','PDF']){
    const button=findElement(element,node=>node.type==='button'&&typeof node.props.children==='string'&&node.props.children.startsWith(prefix));
    await button.props.onClick();
  }
  assert.equal(fullCalls.length,2);assert.equal(fullCalls[0][2].ledger,true);
  for(const output of exports){assert.equal(output[2].rows[0].journal_id,journal);assert.equal(output[2].rows[0].source_document,sale);assert.equal(output[2].rows[0].description,`Pharmacy receipt PHM-${sale}`);}
  assert.equal(JSON.stringify(row),before);
  assert.ok(lib.csv([row],['journal_id','source_document','description']).includes(sale));
});
test('summary metrics follow Payroll neutral summary strips and shared currency, never loading zeros or controls',()=>{
  const {JSDOM}=require('jsdom');
  const html=renderToStaticMarkup(React.createElement(common.SummaryMetrics,{metrics:[
    {title:'Receivables',value:'1234.50',subtitle:'Source-book obligation',variant:'primary'},
    {title:'Payables',value:null,subtitle:'Not yet returned',variant:'warning'},
    {title:'Documents',value:1234,count:true,subtitle:'Server total',variant:'info'},
    {title:'Inventory',value:500,subtitle:'Current snapshot',variant:'success'},
  ]}));
  const document=new JSDOM(html).window.document;
  assert.equal(document.querySelectorAll('dl.accounting-summary > div').length,4);
  assert.equal(document.querySelector('.bg-gradient,.text-white,.summary-card'),null);
  for(const card of document.querySelectorAll('dl.accounting-summary > div')){
    assert.ok(card.querySelector('dt'));
    assert.ok(card.querySelector('dd'));
    assert.equal(card.querySelector('form,input,button,select'),null);
  }
  assert.ok(html.includes(currencyFormatter.format(1234.5)));assert.match(html,/Not available/);
  assert.equal(common.money(undefined),'—');assert.equal(common.money(null),'—');
});
test('statement summaries reuse the overview layout and format expenses, refunds and zero tax as money',()=>{
  const {JSDOM}=require('jsdom');
  const ui=compile('app/pharmacy/accounting/components/Registers.tsx',{
    'react/jsx-runtime':jsx,'next/link':nextLink,react:hooks,'../../../../lib/pharmacyAccounting':lib,
    './common':common,'./api':{},'./exports':{},
  });
  const summary={grossSales:2016220,refunds:200,netSales:2016020,taxCollected:0,receipts:20,refundCount:1,
    stockValue:2131180.43,medicines:2,reorderItems:0,outOfStock:0,bookRevenue:2016020,costOfSales:53819.79,operatingExpenses:200,profit:1962000.21};
  const document=new JSDOM(renderToStaticMarkup(React.createElement(ui.ReportSummary,{data:summary}))).window.document;
  assert.equal(document.querySelectorAll('section[aria-label$=" summary"]').length,3);
  assert.equal(document.querySelectorAll('dl > div').length,14);
  assert.equal(document.querySelectorAll('dl.accounting-summary').length,3,'use the same summary style as Receivables and Payables');
  for(const [title,value]of [['Refunds',200],['Tax collected',0],['Operating expenses',200],['Profit',1962000.21]]){
    const card=[...document.querySelectorAll('dl > div')].find(e=>e.querySelector('dt').textContent===title);
    assert.equal(card.querySelector('dd').textContent,currencyFormatter.format(value));
  }
  const receipts=[...document.querySelectorAll('dl > div')].find(e=>e.querySelector('dt').textContent==='Receipts');
  assert.equal(receipts.querySelector('dd').textContent,'20');
  const expenses=[...document.querySelectorAll('dl > div')].find(e=>e.querySelector('dt').textContent==='Operating expenses');
  assert.equal(expenses.querySelector('dd.summary-detail').textContent,'Posted pharmacy operating expenses');
  assert.equal(document.querySelector('a').getAttribute('href'),'/pharmacy/accounting/expenses');
  assert.equal(document.querySelector('form,input,button,.bg-gradient'),null);
  assert.match(document.body.textContent,/inventory adjustments/);
  const partial=new JSDOM(renderToStaticMarkup(React.createElement(ui.ReportSummary,{data:{refunds:null,taxCollected:0}}))).window.document;
  assert.equal(partial.querySelectorAll('dl > div').length,2,'missing metrics must not become invented zeros');
  assert.equal(partial.querySelector('dd').textContent,'Not available');
  assert.equal(partial.querySelectorAll('dl > div')[1].querySelector('dd').textContent,currencyFormatter.format(0));
});
test('table workflow forms render outside PrimeTable decorative ancestors, with selected exact document preserved',()=>{
  const {JSDOM}=require('jsdom'),row={id:'exact-document-uuid',description:'Original approved evidence',amount:'25.00',version:3};
  const ui=compile('app/pharmacy/accounting/components/common.tsx',{...commonImports,react:{...React,useState:()=>[row.id,()=>{}]}});
  const html=renderToStaticMarkup(React.createElement(ui.DataTable,{
    rows:[row],columns:['id','description','amount','version'],actions:original=>React.createElement('form',{'data-original-id':original.id},React.createElement('fieldset',null,React.createElement('legend',null,'Reviewed transition'),React.createElement('input',{name:'expectedVersion',defaultValue:original.version}))),
  }));
  const document=new JSDOM(html).window.document,form=document.querySelector('form');
  assert.ok(document.querySelector('.prime-table-decorative table'));assert.ok(form);
  assert.equal(form.closest('.card,.prime-table-decorative'),null);
  assert.equal(form.dataset.originalId,row.id);assert.equal(form.querySelector('[name="expectedVersion"]').value,'3');
  assert.ok(form.closest('[aria-label="Selected document review"]'));
});
test('supplier selector searches human names from authenticated real records and emits exact IDs, including clear/error behavior',()=>{
  const requests=[],selected=[],SelectFixture=()=>null,supplierId='f262eb76-53c6-40b5-911b-f8043b7174ef';
  let failed=false,malformed=false;
  const ui=compile('app/pharmacy/accounting/components/SupplierPicker.tsx',{
    'react/jsx-runtime':jsx,'react-select':{__esModule:true,default:SelectFixture},
    '../../../../components/Auth/customFetch':{reactSelectCustomStyles:{}},'../../../../lib/pharmacyAccounting':lib,'./common':common,
    './api':{useResource:(endpoint,external)=>{requests.push([endpoint,external]);return {data:failed?null:malformed?[{name:'Missing real identifier'}]:[{id:supplierId,name:'Akwa Medical Supplies'}],loading:false,error:failed?'Supplier service unavailable':'',refresh(){}};}},
  });
  let element=ui.default({value:supplierId,onChange:(...args)=>selected.push(args)});
  let picker=findElement(element,node=>node.type===SelectFixture);
  assert.deepEqual(plain(requests[0]),['pharmacy/suppliers',true]);assert.equal(picker.props.isSearchable,true);
  assert.equal(picker.props.options[0].label,'Akwa Medical Supplies');assert.equal(picker.props.value.value,supplierId);
  picker.props.onChange(picker.props.options[0]);picker.props.onChange(null);
  assert.deepEqual(selected,[[supplierId,'Akwa Medical Supplies'],['','']]);
  failed=true;element=ui.default({value:'',onChange(){}});
  picker=findElement(element,node=>node.type===SelectFixture);
  assert.equal(picker.props.isDisabled,true);assert.equal(picker.props.options.length,0);
  assert.equal(picker.props.noOptionsMessage(),'Supplier retrieval failed');
  failed=false;malformed=true;element=ui.default({value:'',onChange(){}});
  picker=findElement(element,node=>node.type===SelectFixture);
  assert.equal(picker.props.isDisabled,true);assert.equal(picker.props.options.length,0);
  assert.match(renderToStaticMarkup(element),/invalid identifiers or names/);
});
test('compound date and supplier controls have explicit labels without enclosing secondary inputs or retry buttons',()=>{
  const {JSDOM}=require('jsdom');
  const DatePreset=props=>React.createElement('div',null,
    React.createElement('select',{id:props.id,'aria-label':props.label}),
    React.createElement('input',{type:'date','aria-label':'Custom range start date'}),
    React.createElement('input',{type:'date','aria-label':'Custom range end date'}));
  const Supplier=()=>React.createElement('div',null,
    React.createElement('button',{type:'button'},'Retry'),
    React.createElement('input',{id:'accounting-supplier','aria-label':'Search supplier by name'}));
  const ui=compile('app/pharmacy/accounting/components/Registers.tsx',{
    'react/jsx-runtime':jsx,'next/link':nextLink,react:hooks,'../../../../lib/pharmacyAccounting':lib,'./common':common,'./exports':{},
    '../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable':{__esModule:true,default:DatePreset},
    './SupplierPicker':{__esModule:true,default:Supplier},
    './api':{useResource:()=>({data:[],loading:false,error:'',refresh(){}})},
  });
  const document=new JSDOM(renderToStaticMarkup(ui.Register({endpoint:'suppliers',supplier:true}))).window.document;
  for(const [id,title]of [['accounting-suppliers-date-preset','Date preset'],['accounting-supplier','Supplier']]){
    const control=document.getElementById(id),label=document.querySelector(`label[for="${id}"]`);
    assert.ok(control);assert.ok(label);assert.equal(label.textContent,title);
    assert.equal(control.labels[0],label);
    assert.equal(label.querySelector('input,select,button'),null);
  }
});
test('supplier statement selection and apply navigate with exact selected ID instead of typed IDs',async()=>{
  const requests=[],state=[],Picker=()=>null;let cursor=0;
  const supplierId='f262eb76-53c6-40b5-911b-f8043b7174ef';
  const ui=compile('app/pharmacy/accounting/components/Registers.tsx',{
    'react/jsx-runtime':jsx,'next/link':nextLink,'../../../../lib/pharmacyAccounting':lib,'./common':common,'./exports':{},
    './SupplierPicker':{__esModule:true,default:Picker},
    react:{useState:initial=>{const index=cursor++;if(!(index in state))state[index]=typeof initial==='function'?initial():initial;return [state[index],value=>{state[index]=typeof value==='function'?value(state[index]):value;}];}},
    './api':{useResource:endpoint=>{requests.push(endpoint);return {data:endpoint.startsWith('suppliers/')?{party:{name:'Akwa Medical Supplies'},items:[],openingBalance:10,closingBalance:20}:[{id:supplierId,name:'Akwa Medical Supplies'}],loading:false,error:'',refresh(){}};}},
  });
  const render=()=>{cursor=0;return ui.Register({endpoint:'suppliers',supplier:true});};
  let element=render();const picker=findElement(element,node=>node.type===Picker);
  picker.props.onChange(supplierId,'Akwa Medical Supplies');element=render();
  await submit(element,{});element=render();
  assert.ok(requests.at(-1).startsWith(`suppliers/${supplierId}/statement?`));
  const html=renderToStaticMarkup(element);assert.match(html,/Supplier statement/);assert.match(html,/Akwa Medical Supplies/);
  assert.doesNotMatch(html,/Supplier ID/);
});
function accountingUiFixture({failure=''}={}) {
  const cache={},rootDir='app/pharmacy/accounting/components/',requests=[];
  const snapshot=lib.decodeInventoryControl(inventoryFixture);
  const resource=endpoint=>{
    requests.push(endpoint);let data={items:[],total:0};
    if(endpoint==='accounts')data=taxAccounts;
    else if(endpoint==='settings')data=taxSettings;
    else if(endpoint==='overview')data={receivables:'10.00',payables:'20.00',documents:[{kind:'expense',status:'draft',count:1,amount:'5.00'}],reconciliations:[]};
    else if(endpoint==='inventory/reconciliation')data=snapshot;
    else if(endpoint.startsWith('tax?'))data=taxLib.decodeTax(taxFixture);
    else if(endpoint==='pharmacy/suppliers')data=[{id:'supplier-1',name:'Akwa Medical Supplies'}];
    else if(endpoint==='periods')data={items:[{period_code:'2099-01',period_start:'2099-01-01',period_end:'2099-01-31',status:'open'}],pharmacyCanChangeStatus:false};
    else if(endpoint==='reconciliation')data={accounts:[{id:7,name:'Pharmacy Bank',currency:'GHS'}],items:[]};
    else if(endpoint.includes('/aging?'))data={items:[{id:'sale-1',receipt_number:'PHM-001',outstanding_amount:10}],buckets:{current:10},total:10,reconciliation:{reconciled:true,difference:0,parties:[]}};
    else if(endpoint.startsWith('reports?'))data={rows:[{account:'sales',account_name:'Pharmacy sales',amount:10}],columns:['account','account_name','amount'],totals:{netProfit:10}};
    return {data:failure?null:data,loading:false,error:failure,refresh(){}};
  };
  function load(name) {
    if(cache[name])return cache[name];
    const file=rootDir+name+'.tsx',source=ts.createSourceFile(file,fs.readFileSync(path.join(root,file),'utf8'),ts.ScriptTarget.Latest,true);
    const imports={
      'react/jsx-runtime':jsx,react:{...React,...hooks,useEffect(){}},'next/link':nextLink,
      '../../../../lib/pharmacyAccounting':lib,'../../../../lib/pharmacyAccountingConfiguration':configurationLib,'../../../../lib/pharmacyTax':taxLib,
      '../../../../lib/pharmacyLearning':learningLib,
      '../../components/PharmacyTaskHelp':{__esModule:true,default:()=>null},
      './common':common,'./api':{useResource:resource,useMutation:()=>({pending:false,error:'',mutate:async()=>true})},
      './exports':{downloadAccountingExport:async()=>{},fullFilteredExport:async()=>({rows:[],metadata:{}})},
      './evidenceDownload':{},'../../components/PharmacyWorkspace':{usePharmacyAccess:()=>({finance:true,manager:true,app:{user:{role:'pharmacy_manager',employeeid:9}}}),MedicinePicker:()=>null},
      '../../../../lib/roleNavigationPolicy':{canAccessRolePage:()=>true},
      '../../../../components/Auth/customFetch':{currencyFormatter,reactSelectCustomStyles:{}},
      '../../../../components/accounting/ReportShell.module.css':{__esModule:true,default:{}},
      '../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable':{__esModule:true,default:()=>null},
      'react-select':{__esModule:true,default:()=>null},
      './AccountingWorkspace.module.css':{__esModule:true,default:{workspace:'workspace',navigation:'navigation'}},
    };
    for(const node of source.statements){
      if(ts.isImportDeclaration(node)&&ts.isStringLiteral(node.moduleSpecifier)){
        const dependency=node.moduleSpecifier.text;
        if(!(dependency in imports)&&dependency.startsWith('./'))imports[dependency]=load(dependency.slice(2));
      }
    }
    return cache[name]=compile(file,imports,{FormData:FormDataFixture});
  }
  return {workspace:load('AccountingWorkspace'),requests};
}
test('all 19 accounting destinations render actual workflow sections without form card ancestry, badges or metric controls',()=>{
  const {JSDOM}=require('jsdom'),fixture=accountingUiFixture();let forms=0;
  for(const [section]of lib.accountingDestinations){
    const element=fixture.workspace.default({section}),html=renderToStaticMarkup(element);
    const document=new JSDOM(html).window.document;
    assert.equal(document.querySelectorAll('nav[aria-label="Pharmacy accounting"]').length,0,`${section}: must reuse the feature sidebar, not duplicate 19 links`);
    assert.equal(document.querySelectorAll('h1').length,1,section);
    assert.equal(document.querySelector('.badge,[class*="rounded-pill"]'),null,section);
    for(const form of document.querySelectorAll('form')){
      forms++;assert.equal(form.closest('.card,.prime-table-decorative'),null,`${section}: form is boxed`);
    }
    for(const card of document.querySelectorAll('.summary-card')){
      assert.ok(card.querySelector('dd.summary-value'),`${section}: non-summary card`);
      assert.equal(card.querySelector('form,input,select,button'),null,section);
    }
  }
  assert.ok(forms>=12,`${forms} actual forms rendered across destinations`);
});
test('failed overview and legacy immediate forms do not show invented metrics or card ancestors',()=>{
  const {JSDOM}=require('jsdom'),fixture=accountingUiFixture({failure:'Synthetic branch service unavailable'});
  const html=renderToStaticMarkup(fixture.workspace.default({section:''}));
  assert.match(html,/Synthetic branch service unavailable/);
  assert.equal(new JSDOM(html).window.document.querySelector('.card'),null);
  const legacy=legacyFinancePage({mode:'enabled'}).default();
  const document=new JSDOM(renderToStaticMarkup(legacy)).window.document;
  for(const form of document.querySelectorAll('form'))assert.equal(form.closest('.card'),null);
  assert.ok(document.querySelector('fieldset[disabled]'));
});
test('accounting overview follows the Payroll dashboard pattern without duplicating the sidebar, and register exports stay outside the filter form',()=>{
  const {JSDOM}=require('jsdom'),fixture=accountingUiFixture();
  const overview=new JSDOM(renderToStaticMarkup(fixture.workspace.default({section:''}))).window.document;
  assert.equal(overview.querySelector('[aria-labelledby="accounting-tasks"]'),null,'the full destination directory belongs to the sidebar');
  const tools=overview.querySelector('nav[aria-label="Accounting tools"]');
  assert.ok(tools);
  assert.equal(tools.querySelectorAll('a').length,6);
  assert.ok(tools.querySelectorAll('a').length<lib.accountingDestinations.length);
  assert.ok(overview.querySelector('[aria-labelledby="accounting-cycle"] ol'));
  assert.equal(overview.querySelector('h1').textContent,'Accounting overview');
  assert.ok(overview.querySelector('nav[aria-label="Breadcrumb"]'));
  assert.equal(overview.querySelector('.bg-gradient,.text-white'),null);
  assert.ok([...overview.querySelectorAll('header a')].some(a=>a.textContent==='Record an expense'));
  assert.ok(overview.querySelector('nav[aria-label="Everyday pharmacy money tasks"]'));
  assert.ok(overview.querySelector('a[href="/pharmacy/guide/pharmacy-finances"]'));
  assert.ok(tools.closest('details'),'advanced checks should not compete with everyday tasks');
  const ledger=new JSDOM(renderToStaticMarkup(fixture.workspace.default({section:'general-ledger'}))).window.document;
  assert.equal(ledger.querySelectorAll('h1').length,1);
  assert.equal(ledger.querySelector('h1').textContent,'All pharmacy accounting transactions');
  assert.ok(ledger.querySelector('header').textContent.includes('General ledger'));
  const exportControl=[...ledger.querySelectorAll('summary')].find(e=>e.textContent==='Export all filtered records');
  assert.ok(exportControl);assert.equal(exportControl.closest('form'),null);
  const filterForm=[...ledger.forms].find(form=>form.textContent.includes('Apply filters'));
  assert.ok(filterForm);assert.equal(filterForm.querySelector('details'),null);
  assert.equal(filterForm.getAttribute('aria-label'),'Report filters');
  const payables=new JSDOM(renderToStaticMarkup(fixture.workspace.default({section:'payables'}))).window.document;
  assert.equal(payables.querySelectorAll('nav[aria-label="Payables views"] button').length,5);
  assert.equal(payables.querySelector('nav[aria-label="Payables views"] button[aria-pressed="true"]').textContent,'Unpaid bills');
  assert.equal(payables.querySelectorAll('form[aria-label="Report filters"]').length,0,'do not show an Apply button when there are no supported filters');
  assert.equal(payables.querySelectorAll('[data-accounting-export]').length,1,'do not stack every workflow register on first load');
  const table=new JSDOM(renderToStaticMarkup(React.createElement(common.DataTable,{rows:[{account:'cash',debit:'10.00'}]}))).window.document;
  assert.ok(table.querySelector('[data-accounting-table="true"].lab-accounting-table'));
});
test('workflow views mount on first visit, preserve visited forms, and show only the selected workflow',()=>{
  const {JSDOM}=require('jsdom'),state=[];let cursor=0;
  const ui=compile('app/pharmacy/accounting/components/common.tsx',{...commonImports,react:{...React,useState:initial=>{
    const index=cursor++;if(!(index in state))state[index]=initial;
    return [state[index],next=>{state[index]=typeof next==='function'?next(state[index]):next;}];
  }}});
  const props={label:'Review workflows',views:[
    {id:'bills',title:'Bills',content:React.createElement('p',null,'Bill register')},
    {id:'settlements',title:'Settlements',content:React.createElement('form',null,React.createElement('input',{name:'reason',defaultValue:'Unsaved review'}))},
  ]};
  const render=()=>{cursor=0;return ui.WorkflowViews(props);};
  let tree=render(),document=new JSDOM(renderToStaticMarkup(tree)).window.document;
  assert.equal(document.querySelector('form'),null,'unvisited workflows are not mounted');
  findElement(tree,element=>element.type==='button'&&element.props.children==='Settlements').props.onClick();
  tree=render();document=new JSDOM(renderToStaticMarkup(tree)).window.document;
  assert.ok(document.querySelector('section[aria-label="Bills"][hidden]'));
  assert.ok(document.querySelector('section[aria-label="Settlements"]:not([hidden]) form'));
  findElement(tree,element=>element.type==='button'&&element.props.children==='Bills').props.onClick();
  tree=render();document=new JSDOM(renderToStaticMarkup(tree)).window.document;
  assert.ok(document.querySelector('section[aria-label="Settlements"][hidden] form'),'visited drafts stay mounted when changing workflow');
});
test('all 19 failed accounting retrievals remain errors rather than success-shaped empty financial registers',()=>{
  const fixture=accountingUiFixture({failure:'Synthetic branch service unavailable'});
  for(const [section]of lib.accountingDestinations){
    const html=renderToStaticMarkup(fixture.workspace.default({section}));
    assert.match(html,/Synthetic branch service unavailable/,section);
    assert.doesNotMatch(html,/No records returned for this selection\./,section);
    assert.doesNotMatch(html,/<h3 class="fw-bold mb-0">GH₵0\.00/,section);
  }
});
