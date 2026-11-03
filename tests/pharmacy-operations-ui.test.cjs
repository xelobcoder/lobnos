const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),test=require('node:test'),vm=require('node:vm'),ts=require('typescript');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const styles=new Proxy({},{get:(_,key)=>String(key)});
function compile(file,overrides={}){
 const exports={};const mocks=name=>{
  if(overrides[name])return overrides[name];
  if(name.endsWith('.module.css'))return {__esModule:true,default:styles};
  if(name.includes('customFetch'))return {currencyFormatter:new Intl.NumberFormat('en-GH',{style:'currency',currency:'GHS'})};
  if(name.includes('useApplicationContext'))return {useApplication:()=>({user:{role:'pharmacy_manager',employeeid:3}})};
  if(name==='next/link')return ({href,children})=>React.createElement('a',{href},children);
  return require(name);
 };
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,{exports,require:mocks});return exports;
}
const hooks={...React,useState:v=>[v,()=>{}],useEffect(){},useId:()=>':test:',useRef:v=>({current:v})};
const shared=compile('app/pharmacy/components/PharmacyWorkspace.tsx',{react:hooks});
test('financial-day screen has an explicit opening action before any shift',()=>{
 const html=renderToStaticMarkup(React.createElement(shared.FinancialDayPanel,{setup:{financialDate:'2026-10-24',day:null},canManage:true,onChange:async()=>{}}));
 assert.match(html,/Not opened/);assert.match(html,/Open financial day/);assert.doesNotMatch(html,/Close financial day/);
});
test('cashier sees a clear manager instruction rather than an unavailable opening action',()=>{
 const html=renderToStaticMarkup(React.createElement(shared.FinancialDayPanel,{setup:{financialDate:'2026-10-24',day:null},canManage:false,onChange:async()=>{}}));
 assert.match(html,/manager or accountant must open the day/);assert.doesNotMatch(html,/>Open financial day<\/button>/);
});
test('a closed financial day is identified and cannot be reopened in the UI',()=>{
 const html=renderToStaticMarkup(React.createElement(shared.FinancialDayPanel,{setup:{financialDate:'2026-10-24',day:{status:'closed'}},canManage:true,onChange:async()=>{}}));
 assert.match(html,/Closed/);assert.match(html,/next financial day/);assert.doesNotMatch(html,/>Open financial day<\/button>/);
});
function stockModal(day='open'){
 let index=0;const values={2:'purchase',3:'10',4:'100'};
 const localHooks={...hooks,useState:v=>{const i=index++;return [Object.hasOwn(values,i)?values[i]:v,()=>{}];}};
 const resource=endpoint=>({data:endpoint.includes('suppliers')?[{id:'supplier',name:'Medicine supplier'}]:{day:day?{status:day}:null},loading:false,error:'',refresh:async()=>{}});
 const module=compile('app/pharmacy/components/PharmacyStockUpModal.tsx',{react:localHooks,'./PharmacyPaymentFields':{usePharmacyDocument:()=>({pending:null,execute:async()=>{}})},'./PharmacyWorkspace':{styles,money:shared.money,Modal:({children})=>React.createElement('section',{},children),Message:()=>null,usePharmacyResource:resource}});
 return renderToStaticMarkup(React.createElement(module.default,{items:[{inventoryItemId:'drug',name:'Medicine',unit:'tablet',availableStock:5,salePrice:8,wholesalePrice:6,batchTracking:true,purchaseUnit:'box',unitsPerPurchaseUnit:20}],onClose(){},onCompleted(){}}));
}
test('stock receiving explains purchase packs, base stock and total cost before saving',()=>{
 const html=stockModal();assert.match(html,/200 tablet will be added to stock/);assert.match(html,/Cost per box/);assert.match(html,/1,000\.00/);assert.match(html,/20 tablet per pack/);
});
test('stock receiving exposes the missing financial day and blocks receipt submission',()=>{
 const html=stockModal(null);assert.match(html,/not opened/);assert.match(html,/View financial day/);assert.match(html,/disabled=""[^>]*>Receive 200 tablet/);
});
test('inventory, stock and catalogue pages share the same task-based workspace',()=>{
 for(const route of ['inventory','stock','catalogue']){
  const source=fs.readFileSync(path.join(__dirname,'..','app','pharmacy',route,'page.tsx'),'utf8');
  assert.match(source,/PharmacyInventoryWorkspace/);
 }
 const source=fs.readFileSync(path.join(__dirname,'..','app','pharmacy','components','PharmacyInventoryWorkspace.tsx'),'utf8');
 assert.doesNotMatch(source,/<details/);assert.match(source,/Older stock receipts/);assert.match(source,/New physical deliveries and acceptance are tracked in Purchase orders or Deliveries &amp; invoices/);assert.match(source,/Purchase orders/);assert.match(source,/Search medicine name or SKU/);
 assert.doesNotMatch(source,/Buying medicines\?|PharmacyTaskHelp|Manage pharmacy medicines, receive deliveries/);
 assert.match(source,/>New purchase request<\/button>/);
 assert.match(source,/<Modal title="Request medicines" size="wide"/);
});
test('only an explicitly wide pharmacy modal expands beyond the standard dialog',()=>{
 const wide=renderToStaticMarkup(React.createElement(shared.Modal,{title:'Purchase',size:'wide',onClose(){}},'Form'));
 const regular=renderToStaticMarkup(React.createElement(shared.Modal,{title:'Receive',onClose(){}},'Form'));
 assert.match(wide,/dialogWide/);assert.doesNotMatch(regular,/dialogWide/);
});

function financeHandover({shifts,previous=true,manager=true,administrator=false,employeeid=1,busy=false,tab='days',mode='legacy',reportError='',setupError='',metrics=[]}){
 let index=0;
 const localHooks={...hooks,useState:initial=>[index++===0?tab:index===4?busy:initial,()=>{}]};
 const days=previous?[{id:'day',financial_date:'2026-10-26',status:'open',opened_at:'2026-10-26T08:00:00Z'}]:[];
 const data={days,shifts,balances:[],documents:[],events:[],revenue:100,costOfSales:20,expenses:5,profit:75};
 const resource=endpoint=>({data:endpoint.endsWith('reports')?data:endpoint.endsWith('suppliers')?[]:{financialDate:'2026-10-27',day:{status:'open'}},loading:false,error:endpoint.endsWith('reports')?reportError:endpoint.endsWith('checkout-setup')?setupError:'',refresh:async()=>{}});
 const module=compile('app/pharmacy/finance/page.tsx',{
  react:localHooks,
  '../components/ShiftHandoverForm':{__esModule:true,default:()=>null},
  '../components/PharmacyPaymentFields':{usePharmacyDocument:()=>({pending:null})},
  '../components/LinkedAccountingCompatibility':{useLinkedAccounting:()=>({mode,refresh(){}}),LinkedAccountingNotice:()=>null,isLegacyAccountingPost:()=>false},
  '../accounting/components/common':{...shared,styles,FormSection:()=>null,ResourceState:({error})=>error?React.createElement('p',{role:'alert'},error):null,SummaryMetrics:({metrics:values})=>{metrics.push(values);return null;}},
  '../components/PharmacyWorkspace':{...shared,styles,usePharmacyAccess:()=>({finance:true,manager,administrator,app:{user:{employeeid}}}),usePharmacyResource:resource,FinancialDayPanel:()=>null,Message:shared.Message,Tabs:({tabs})=>React.createElement('nav',{},tabs.map(tab=>React.createElement('button',{key:tab.id},tab.label)))}
 });
 return renderToStaticMarkup(React.createElement(module.default));
}
 test('finance starts with daily work, shared count summaries and optional all-time totals, not a misleading trial balance',()=>{
  const metrics=[];
  const html=financeHandover({tab:'overview',mode:'enabled',metrics,shifts:[closedHandovers[1],{id:'active',cashier_id:4,financial_date:'2026-10-26',opening_float:50}]});
  assert.match(html,/<h1>Cash &amp; day closing<\/h1>/);
  assert.match(html,/What do you need to do\?/);
  assert.match(html,/Today &amp; next steps/);
  assert.match(html,/<details[^>]*><summary>All-time financial totals &amp; account movements/);
  assert.doesNotMatch(html,/<h2>Trial balance<\/h2>|Legacy journals|Legacy payments/);
  assert.match(html,/href="\/pharmacy\/accounting\/trial-balance"/);
  assert.deepEqual(Array.from(metrics[0],m=>[m.title,m.value,m.count]),[['Open shifts',1,true],['Awaiting review',1,true],['Open days',1,true],['Cash differences',1,true]]);
  assert.equal(metrics[1].find(m=>m.title==='Net profit').value,75,'reported profit must not be recalculated');
 });
 test('finance error states hide stale records and tasks while preserving retry and configuration safeguards',()=>{
  const failed=financeHandover({tab:'days',shifts:closedHandovers,reportError:'Finance records unavailable',mode:'unavailable'});
  assert.match(failed,/role="alert"/);assert.match(failed,/Finance records unavailable/);
  assert.doesNotMatch(failed,/<table|Review handover<\/button>|Close previous financial day|Legacy journals/);
  const setupFailed=financeHandover({tab:'reconciliation',shifts:[],setupError:'Day setup unavailable'});
  assert.match(setupFailed,/Day setup unavailable|Retry financial-day setup/);
  assert.doesNotMatch(setupFailed,/<form|<table/);
  const legacy=financeHandover({tab:'overview',shifts:[]});
  assert.match(legacy,/Legacy payments &amp; expenses/);assert.match(legacy,/Legacy journals/);
 });
 test('financial-day overview sends closing to handover review before any mutation; actual close explains blockers',()=>{
  let reviewed=0;
  const props={setup:{financialDate:'2026-10-27',day:{status:'open'}},canManage:true,onChange:async()=>{},closeBlockedReason:'2 cashier shifts need review.'};
  const find=(element,label)=>{
   if(!React.isValidElement(element))return undefined;
   if(element.type==='button'&&element.props.children===label)return element;
   return React.Children.toArray(element.props.children).map(child=>find(child,label)).find(Boolean);
  };
  const overview=shared.FinancialDayPanel({...props,onReviewBeforeClose:()=>reviewed++});
  const review=find(overview,'Review before closing');
  assert.equal(review.props.disabled,false);review.props.onClick();assert.equal(reviewed,1);
  const closing=shared.FinancialDayPanel(props);
  assert.equal(find(closing,'Close financial day').props.disabled,true);
  assert.match(renderToStaticMarkup(closing),/2 cashier shifts need review/);
 });
const closedHandovers=[
 {id:'one',cashier_id:1,financial_date:'2026-10-24',closed_at:'2026-10-24T18:00:00Z',counted_cash:3000,variance:0,opening_float:0},
 {id:'two',cashier_id:1,financial_date:'2026-10-24',closed_at:'2026-10-24T19:00:00Z',counted_cash:15,variance:-1395,opening_float:0},
 {id:'three',cashier_id:1,financial_date:'2026-10-26',closed_at:'2026-10-26T18:00:00Z',counted_cash:2600,variance:0,opening_float:0},
 {id:'four',cashier_id:1,financial_date:'2026-10-26',closed_at:'2026-10-26T19:00:00Z',counted_cash:2002600,variance:0,opening_float:0}
];
test('previous-day handovers render one table with every count, date, variance and self-review restriction',()=>{
 const html=financeHandover({shifts:closedHandovers});
 const section=html.split('id="financial-days-workflow"')[1].split('</section>')[0];
 assert.match(section,/Finish 26 Oct 2026/);
 assert.match(section,/0 remaining/);assert.match(section,/4 awaiting review/);
 assert.equal((section.match(/<tbody><tr/g)||[]).length,1);
 assert.equal((section.match(/<td>Staff #1<\/td>/g)||[]).length,4);
 for(const heading of ['Staff','Financial date','Counted cash','Difference','Status / action'])assert.ok(section.includes(heading));
 for(const amount of ['3,000.00','15.00','2,600.00','2,002,600.00'])assert.ok(section.includes(amount),amount);
 assert.match(section,/<td class="number">-GH\u20b51,395\.00<\/td>/);
 assert.equal((section.match(/Awaiting another manager&#x27;s review\./g)||[]).length,4);
 assert.doesNotMatch(section,/<article|>Review handover<\/button>/);
 assert.match(section,/table-responsive/);
 assert.match(html,/disabled=""[^>]*>Close previous financial day/);
});
test('handover table preserves authorized review and active-shift close actions',()=>{
 const html=financeHandover({shifts:[closedHandovers[0],{id:'open',cashier_id:4,financial_date:'2026-10-26',opening_float:50}],employeeid:3,busy:true});
 assert.match(html,/disabled=""[^>]*>Review handover/);
 assert.match(html,/disabled=""[^>]*>Close with cash count/);
 assert.match(html,/<td class="number">--<\/td>/);
 const accountant=financeHandover({shifts:[closedHandovers[0],{id:'open',cashier_id:4,financial_date:'2026-10-26',opening_float:50}],manager:false});
 assert.doesNotMatch(accountant,/>Review handover<\/button>|>Close with cash count<\/button>/);
 assert.match(accountant,/Ask the cashier to close their shift/);
});
test('all-shift view shows reviewed rows while completed previous-day workflow remains clear',()=>{
 const html=financeHandover({shifts:[{...closedHandovers[0],reviewed_by:3}],previous:false});
 assert.match(html,/>Reviewed<\/span>/);
 const complete=financeHandover({shifts:[{...closedHandovers[0],reviewed_by:3}]});
 assert.match(complete,/All cashier shifts for this day have been closed and reviewed/);
 assert.doesNotMatch(complete,/No cashier shifts opened yet/);
 assert.doesNotMatch(complete,/disabled=""[^>]*>Close previous financial day/);
});
test('organisation admin can open their own handover review but must still review every blocker',()=>{
 const html=financeHandover({shifts:closedHandovers,administrator:true});
 assert.equal((html.match(/>Admin review handover<\/button>/g)||[]).length,4);
 assert.doesNotMatch(html,/Awaiting another manager/);
 assert.match(html,/disabled=""[^>]*>Close previous financial day/);
});
test('administrator self-review form requires a reason and acknowledgement without hiding discrepancies',()=>{
 const form=compile('app/pharmacy/components/ShiftHandoverForm.tsx',{
  react:hooks,
  './PharmacyWorkspace':{...shared,styles,usePharmacyResource:()=>({data:{cashierId:1,financialDate:'2026-10-26',closed:true,reviewed:false,countedCash:15,variance:-1395,expectedCash:1410,currentExpectedCash:1410},loading:false,error:''})}
 }).default;
 const html=renderToStaticMarkup(React.createElement(form,{shift:{id:'shift'},review:true,adminSelfReview:true,busy:false,onConfirm:async()=>{},onCancel(){}}));
 assert.match(html,/Administrator self-review/);assert.match(html,/Administrator review reason/);
 assert.match(html,/minLength="10"/);
 assert.match(html,/type="checkbox"[^>]*required=""/);
 assert.match(html,/disabled=""[^>]*>Confirm handover review/);
 assert.match(html,/-GH\u20b51,395\.00/);
 assert.match(html,/financial-day audit history/);
});
