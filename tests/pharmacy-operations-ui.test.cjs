const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),test=require('node:test'),vm=require('node:vm'),ts=require('typescript');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const styles=new Proxy({},{get:(_,key)=>String(key)});
function compile(file,overrides={}){
 const exports={};const mocks=name=>{
  if(overrides[name])return overrides[name];
  if(name.endsWith('.module.css'))return {__esModule:true,default:styles};
  if(name.includes('customFetch'))return {};
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
 assert.doesNotMatch(source,/<details/);assert.match(source,/Received deliveries/);assert.match(source,/Purchase orders/);assert.match(source,/Search medicine name or SKU/);
});
